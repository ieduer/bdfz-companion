import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const gradlePath = path.join(repoRoot, 'android', 'app', 'build.gradle');
const required = [
  'BDFZ_ANDROID_KEYSTORE_PATH',
  'BDFZ_ANDROID_KEY_ALIAS',
  'BDFZ_ANDROID_KEYSTORE_PASSWORD',
  'BDFZ_ANDROID_KEY_PASSWORD',
];

for (const name of required) {
  if (!process.env[name]) throw new Error(`${name} is required`);
}
if (!fs.existsSync(process.env.BDFZ_ANDROID_KEYSTORE_PATH)) {
  throw new Error('BDFZ Android release keystore does not exist');
}

let source = fs.readFileSync(gradlePath, 'utf8');
const signingNeedle = `    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }`;
const signingReplacement = `    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            storeFile file(System.getenv('BDFZ_ANDROID_KEYSTORE_PATH'))
            storePassword System.getenv('BDFZ_ANDROID_KEYSTORE_PASSWORD')
            keyAlias System.getenv('BDFZ_ANDROID_KEY_ALIAS')
            keyPassword System.getenv('BDFZ_ANDROID_KEY_PASSWORD')
        }
    }`;

if (!source.includes(signingNeedle)) throw new Error('Expo signing block was not recognized');
source = source.replace(signingNeedle, signingReplacement);
source = source.replace(
  '            signingConfig signingConfigs.debug\n            def enableShrinkResources',
  '            signingConfig signingConfigs.release\n            def enableShrinkResources',
);
if (!source.includes('signingConfig signingConfigs.release')) {
  throw new Error('Release signing configuration was not applied');
}

fs.writeFileSync(gradlePath, source);
console.log('Configured generated Android project for private release signing');
