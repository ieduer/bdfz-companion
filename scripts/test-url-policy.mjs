import assert from 'node:assert/strict';
import {
  getSafeExternalNavigationUrl,
  getTrustedWebViewUrl,
  isExternalOnlyUrl,
  isTrustedSessionBridgeUrl,
  isTrustedWebViewUrl,
} from '../services/urlPolicy.ts';

assert.equal(getTrustedWebViewUrl('https://my.bdfz.net'), 'https://my.bdfz.net/');
assert.equal(isTrustedWebViewUrl('https://forum.rdfzer.com/topic/1'), true);
assert.equal(isTrustedWebViewUrl('https://recite.rdfz.net/'), true);
assert.equal(isTrustedWebViewUrl('https://bdfz.net.evil.example/'), false);
assert.equal(isTrustedWebViewUrl('https://user:pass@my.bdfz.net/'), false);
assert.equal(isTrustedWebViewUrl('http://my.bdfz.net/'), false);
assert.equal(isTrustedWebViewUrl('https://my.bdfz.net:8443/'), false);
assert.equal(isExternalOnlyUrl('http://bdfz-cinema.bdfz.net:8765/'), true);
assert.equal(isExternalOnlyUrl('http://bdfz-cinema.bdfz.net:8765.evil.example/'), false);
assert.equal(isTrustedSessionBridgeUrl('https://my.bdfz.net/'), true);
assert.equal(isTrustedSessionBridgeUrl('https://gk.bdfz.net/'), false);
assert.equal(getSafeExternalNavigationUrl('https://example.org/help'), 'https://example.org/help');
assert.equal(getSafeExternalNavigationUrl('http://example.org/'), null);

console.log('URL policy checks passed');
