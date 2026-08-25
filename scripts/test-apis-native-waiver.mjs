#!/usr/bin/env node

import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { validateApisNativeWaiver } from './check-apis-native-waiver.mjs';

const root = resolve(import.meta.dirname, '..');
const fixtureRoot = mkdtempSync(join(tmpdir(), 'bdfz-companion-waiver-'));

function expectFailure(label, mutate, expected) {
  const copy = join(fixtureRoot, label);
  cpSync(root, copy, {
    recursive: true,
    filter: (source) => !source.includes('/node_modules/') && !source.includes('/.git/'),
  });
  mutate(copy);
  let message = '';
  try {
    validateApisNativeWaiver(copy);
  } catch (error) {
    message = error.message;
  }
  if (!message.includes('豁免前提已失效，必須執行註冊設備煙霧測試') || !message.includes(expected)) {
    throw new Error(`${label} did not fail with expected evidence: ${message}`);
  }
}

try {
  const baseline = validateApisNativeWaiver(root);
  if (baseline.scannedFiles < 1) throw new Error('baseline source scan was empty');

  expectFailure('direct-host', (copy) => {
    writeFileSync(join(copy, 'services/directApis.ts'), "fetch('https://apis.bdfz.net')\n");
  }, 'APIS public hostname');

  expectFailure('app-version', (copy) => {
    const path = join(copy, 'app.json');
    const app = JSON.parse(readFileSync(path, 'utf8'));
    app.expo.version = '1.1.1';
    writeFileSync(path, `${JSON.stringify(app, null, 2)}\n`);
  }, 'App version changed');

  expectFailure('url-policy', (copy) => {
    const path = join(copy, 'services/urlPolicy.ts');
    writeFileSync(path, `${readFileSync(path, 'utf8')}\n// reviewed host change pending\n`);
  }, 'services/urlPolicy.ts changed');

  process.stdout.write('PASS APIS native waiver guard fixtures: baseline, direct host, App version, urlPolicy invalidation\n');
} finally {
  rmSync(fixtureRoot, { recursive: true, force: true });
}
