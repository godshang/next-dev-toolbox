'use client';

import JsonFormat from '@/components/tools/JsonFormat';
import JsonView from '@/components/tools/JsonView';
import JsonDiff from '@/components/tools/JsonDiff';
import JsonToExcel from '@/components/tools/JsonToExcel';
import JsonYamlConverter from '@/components/tools/JsonYamlConverter';
import PropertiesYamlConverter from '@/components/tools/PropertiesYamlConverter';
import ColorConverter from '@/components/tools/ColorConverter';
import NumberBaseConverter from '@/components/tools/NumberBaseConverter';
import SqlFormatter from '@/components/tools/SqlFormatter';
import TimestampConverter from '@/components/tools/TimestampConverter';
import UuidGenerator from '@/components/tools/UuidGenerator';
import CronExpressionGenerator from '@/components/tools/CronExpressionGenerator';
import RandomStringGenerator from '@/components/tools/RandomStringGenerator';
import QrCodeGenerator from '@/components/tools/QrCodeGenerator';
import QrCodeReader from '@/components/tools/QrCodeReader';
import UrlEncode from '@/components/tools/UrlEncode';
import UrlCompare from '@/components/tools/UrlCompare';
import Base64 from '@/components/tools/Base64';
import UnicodeCodec from '@/components/tools/UnicodeCodec';
import Hash from '@/components/tools/Hash';
import JwtDecode from '@/components/tools/JwtDecode';
import TextDiff from '@/components/tools/TextDiff';
import AesCrypto from '@/components/tools/AesCrypto';
import XmlFormat from '@/components/tools/XmlFormat';
import XmlJsonConverter from '@/components/tools/XmlJsonConverter';
import CsvJsonConverter from '@/components/tools/CsvJsonConverter';
import CurlConverter from '@/components/tools/CurlConverter';
import PasswordGenerator from '@/components/tools/PasswordGenerator';

export default function ToolRenderer({ toolId }: { toolId: string }) {
  switch (toolId) {
    case 'json-format':
      return <JsonFormat />;
    case 'json-view':
      return <JsonView />;
    case 'json-diff':
      return <JsonDiff />;
    case 'text-diff':
      return <TextDiff />;
    case 'json-to-excel':
      return <JsonToExcel />;
    case 'json-yaml':
      return <JsonYamlConverter />;
    case 'xml-format':
      return <XmlFormat />;
    case 'xml-json':
      return <XmlJsonConverter />;
    case 'csv-json':
      return <CsvJsonConverter />;
    case 'properties-yaml':
      return <PropertiesYamlConverter />;
    case 'color-converter':
      return <ColorConverter />;
    case 'number-base':
      return <NumberBaseConverter />;
    case 'sql-formatter':
      return <SqlFormatter />;
    case 'timestamp':
      return <TimestampConverter />;
    case 'uuid':
      return <UuidGenerator />;
    case 'cron':
      return <CronExpressionGenerator />;
    case 'random-string':
      return <RandomStringGenerator />;
    case 'qr-code':
      return <QrCodeGenerator />;
    case 'qr-reader':
      return <QrCodeReader />;
    case 'url-encode':
      return <UrlEncode />;
    case 'url-compare':
      return <UrlCompare />;
    case 'base64':
      return <Base64 />;
    case 'unicode-codec':
      return <UnicodeCodec />;
    case 'hash':
      return <Hash />;
    case 'aes-crypto':
      return <AesCrypto />;
    case 'jwt-decode':
      return <JwtDecode />;
    case 'curl-converter':
      return <CurlConverter />;
    case 'password-gen':
      return <PasswordGenerator />;
    default:
      return null;
  }
}
