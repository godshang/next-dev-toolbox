export interface ParsedCurl {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
}

function normalizeCurl(cmd: string): string {
  return cmd.replace(/\\\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
}

function unescapeQuotes(s: string): string {
  return s.replace(/\\"/g, '"').replace(/\\'/g, "'");
}

function extractQuotedArgs(cmd: string, flag: string): string[] {
  const results: string[] = [];
  const pattern = new RegExp(
    `${flag}\\s+(?:"((?:\\\\.|[^"\\\\])*)"|'((?:\\\\.|[^'\\\\])*)')`,
    'gi'
  );
  let match;
  while ((match = pattern.exec(cmd)) !== null) {
    results.push(unescapeQuotes(match[1] ?? match[2] ?? ''));
  }
  return results;
}

export function parseCurl(input: string): ParsedCurl {
  let cmd = normalizeCurl(input);
  if (!cmd) throw new Error('请输入 cURL 命令');

  if (/^curl\b/i.test(cmd)) {
    cmd = cmd.replace(/^curl\s+/i, '');
  }

  let method = 'GET';
  const methodMatch = cmd.match(/(?:-X|--request)\s+(?:"([^"]+)"|'([^']+)'|(\S+))/i);
  if (methodMatch) {
    method = (methodMatch[1] || methodMatch[2] || methodMatch[3]).toUpperCase();
  }

  const headers: Record<string, string> = {};
  for (const h of [
    ...extractQuotedArgs(cmd, '-H'),
    ...extractQuotedArgs(cmd, '--header'),
  ]) {
    const colon = h.indexOf(':');
    if (colon > 0) {
      headers[h.slice(0, colon).trim()] = h.slice(colon + 1).trim();
    }
  }

  let body: string | undefined;
  const dataMatch = cmd.match(
    /(?:-d|--data(?:-raw|-binary)?|--json)\s+(?:"((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)'|(\S+))/i
  );
  if (dataMatch) {
    body = unescapeQuotes(dataMatch[1] || dataMatch[2] || dataMatch[3] || '');
    if (!methodMatch && method === 'GET') method = 'POST';
  }

  let url = '';
  const urlFlagMatch = cmd.match(/(?:--url)\s+(?:"([^"]+)"|'([^']+)'|(\S+))/i);
  if (urlFlagMatch) {
    url = urlFlagMatch[1] || urlFlagMatch[2] || urlFlagMatch[3];
  } else {
    const urlMatch = cmd.match(/(https?:\/\/[^\s'"]+)/i);
    if (urlMatch) url = urlMatch[1];
  }

  if (!url) throw new Error('无法解析 URL，请检查 cURL 命令格式');

  return { url, method, headers, body };
}

function isJsonBody(body: string): boolean {
  try {
    JSON.parse(body);
    return true;
  } catch {
    return false;
  }
}

function escapeJavaString(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

function escapePythonString(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

export type CodeTarget = 'fetch' | 'axios' | 'java' | 'python';

export function generateCode(parsed: ParsedCurl, target: CodeTarget): string {
  const { url, method, headers, body } = parsed;
  const hasBody = body != null && body !== '';
  const jsonBody = hasBody && isJsonBody(body);

  switch (target) {
    case 'fetch': {
      const lines = [`const response = await fetch('${url}', {`, `  method: '${method}',`];
      if (Object.keys(headers).length > 0) {
        lines.push('  headers: {');
        for (const [k, v] of Object.entries(headers)) {
          lines.push(`    '${k.replace(/'/g, "\\'")}': '${v.replace(/'/g, "\\'")}',`);
        }
        lines.push('  },');
      }
      if (hasBody) {
        if (jsonBody) {
          lines.push(`  body: JSON.stringify(${body}),`);
        } else {
          lines.push(`  body: '${body.replace(/'/g, "\\'")}',`);
        }
      }
      lines.push('});', '', 'const data = await response.json();', 'console.log(data);');
      return lines.join('\n');
    }

    case 'axios': {
      const lines = ['const response = await axios({', `  method: '${method.toLowerCase()}',`, `  url: '${url}',`];
      if (Object.keys(headers).length > 0) {
        lines.push('  headers: {');
        for (const [k, v] of Object.entries(headers)) {
          lines.push(`    '${k.replace(/'/g, "\\'")}': '${v.replace(/'/g, "\\'")}',`);
        }
        lines.push('  },');
      }
      if (hasBody) {
        lines.push(jsonBody ? `  data: ${body},` : `  data: '${body.replace(/'/g, "\\'")}',`);
      }
      lines.push('});', '', 'console.log(response.data);');
      return lines.join('\n');
    }

    case 'java': {
      const lines = [
        'HttpClient client = HttpClient.newHttpClient();',
        '',
        'HttpRequest request = HttpRequest.newBuilder()',
        `    .uri(URI.create("${escapeJavaString(url)}"))`,
      ];
      for (const [k, v] of Object.entries(headers)) {
        lines.push(`    .header("${escapeJavaString(k)}", "${escapeJavaString(v)}")`);
      }
      if (hasBody) {
        lines.push(`    .method("${method}", HttpRequest.BodyPublishers.ofString("${escapeJavaString(body)}"))`);
      } else if (method === 'GET') {
        lines.push('    .GET()');
      } else {
        lines.push(`    .method("${method}", HttpRequest.BodyPublishers.noBody())`);
      }
      lines.push(
        '    .build();',
        '',
        'HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());',
        'System.out.println(response.body());'
      );
      return lines.join('\n');
    }

    case 'python': {
      const lines = ['import requests', ''];
      const args = [`method='${method.toLowerCase()}'`, `url='${escapePythonString(url)}'`];
      if (Object.keys(headers).length > 0) {
        const headerEntries = Object.entries(headers)
          .map(([k, v]) => `'${escapePythonString(k)}': '${escapePythonString(v)}'`)
          .join(', ');
        args.push(`headers={${headerEntries}}`);
      }
      if (hasBody) {
        args.push(jsonBody ? `json=${body}` : `data='${escapePythonString(body)}'`);
      }
      lines.push('response = requests.request(');
      args.forEach((arg, i) => {
        lines.push(`    ${arg}${i < args.length - 1 ? ',' : ''}`);
      });
      lines.push(')', 'print(response.text)');
      return lines.join('\n');
    }
  }
}
