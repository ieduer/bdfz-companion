#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const INVALIDATION_MESSAGE = '豁免前提已失效，必須執行註冊設備煙霧測試';
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.json']);
const EXCLUDED_DIRECTORIES = new Set([
  '.expo', '.git', '.github', 'android', 'dist', 'docs', 'node_modules', 'scripts',
]);
const EXCLUDED_FILES = new Set([
  'config/apis-native-waiver.json',
  'package-lock.json',
]);
const DIRECT_APIS_PATTERNS = [
  { label: 'APIS public hostname', pattern: /apis\.bdfz\.net/i },
  { label: 'APIS service binding', pattern: /\bAPIS\b/ },
  { label: 'APIS project header', pattern: /X-Project-Name/i },
  { label: 'APIS task header', pattern: /X-Task-Type/i },
  { label: 'direct Gemini Developer API', pattern: /generativelanguage\.googleapis\.com/i },
];

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function walkSourceFiles(root, current = root, output = []) {
  for (const entry of readdirSync(current, { withFileTypes: true })) {
    if (entry.isDirectory() && EXCLUDED_DIRECTORIES.has(entry.name)) continue;
    const fullPath = join(current, entry.name);
    if (entry.isDirectory()) {
      walkSourceFiles(root, fullPath, output);
      continue;
    }
    const relativePath = relative(root, fullPath).replaceAll('\\', '/');
    if (EXCLUDED_FILES.has(relativePath) || !SOURCE_EXTENSIONS.has(extname(entry.name))) continue;
    output.push({ fullPath, relativePath });
  }
  return output;
}

export function validateApisNativeWaiver(root) {
  const manifestPath = join(root, 'config/apis-native-waiver.json');
  const appConfigPath = join(root, 'app.json');
  const packagePath = join(root, 'package.json');
  const urlPolicyPath = join(root, 'services/urlPolicy.ts');
  for (const path of [manifestPath, appConfigPath, packagePath, urlPolicyPath]) {
    if (!existsSync(path)) throw new Error(`${INVALIDATION_MESSAGE}: missing ${relative(root, path)}`);
  }

  const waiver = readJson(manifestPath);
  const appConfig = readJson(appConfigPath).expo;
  const packageConfig = readJson(packagePath);
  const failures = [];

  if (waiver.schemaVersion !== 1 || waiver.scope !== 'native-direct-apis-contract-only') {
    failures.push('waiver manifest schema or scope changed');
  }
  if (appConfig.version !== waiver.appVersion || packageConfig.version !== waiver.appVersion) {
    failures.push(`App version changed from waived ${waiver.appVersion}`);
  }
  if (appConfig.android?.versionCode !== waiver.androidVersionCode) {
    failures.push(`Android versionCode changed from waived ${waiver.androidVersionCode}`);
  }
  const currentUrlPolicySha = sha256(urlPolicyPath);
  if (currentUrlPolicySha !== waiver.urlPolicySha256) {
    failures.push('services/urlPolicy.ts changed; review any AI-capable WebView allowlist change');
  }

  for (const { fullPath, relativePath } of walkSourceFiles(root)) {
    const source = readFileSync(fullPath, 'utf8');
    for (const { label, pattern } of DIRECT_APIS_PATTERNS) {
      if (pattern.test(source)) failures.push(`${relativePath}: ${label}`);
    }
  }

  if (failures.length > 0) {
    throw new Error(`${INVALIDATION_MESSAGE}\n${failures.map((failure) => `- ${failure}`).join('\n')}`);
  }
  return {
    appVersion: waiver.appVersion,
    androidVersionCode: waiver.androidVersionCode,
    scannedFiles: walkSourceFiles(root).length,
    urlPolicySha256: currentUrlPolicySha,
  };
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  try {
    const root = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
    const result = validateApisNativeWaiver(root);
    process.stdout.write(`PASS native APIS waiver guard: ${result.scannedFiles} source files, App ${result.appVersion} (${result.androidVersionCode})\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  }
}
