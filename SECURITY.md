# Security Policy

## Supported versions

Security fixes are provided for the latest published version.

## Reporting a vulnerability

Use [GitHub's private security advisory form](https://github.com/ieduer/bdfz-companion/security/advisories/new). Do not open a public issue containing session values, personal data, signing material, exploit details, or private endpoints.

Include the affected version, reproduction steps, impact, and a minimal redacted proof. Do not test against other users' accounts or submit destructive payloads.

## Secrets and signing

The repository must never contain User Center sessions, Telegram credentials, Cloudflare credentials, feedback bodies, Android keystores, or signing passwords. Local release credentials are loaded from the operator's approved secret store and referenced only through environment variable names.
