import { tools, ToolItem } from './tools-registry';

export function searchTools(query: string): ToolItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return tools.filter(tool => {
    if (tool.name.toLowerCase().includes(q)) return true;
    if (tool.description.toLowerCase().includes(q)) return true;
    return tool.keywords.some(kw => kw.toLowerCase().includes(q));
  });
}
