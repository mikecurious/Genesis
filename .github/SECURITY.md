# Security Policy

## Secret Management Best Practices

### DO ✅

1. **Use placeholder values in .env.example**
   - Never put real secrets in example files
   - Use descriptive placeholder names: `your_api_key_here`, `your_mongodb_password`
   - Include instructions on how to obtain the secret

2. **Always keep .env in .gitignore**
   - The `.env` file is already in `.gitignore`
   - Never use `git add -f .env` to force add it

3. **Generate strong secrets**
   ```bash
   # For JWT secrets
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

4. **Rotate secrets immediately if exposed**
   - Change the secret in your service (MongoDB, APIs, etc.)
   - Update your `.env` file
   - Redeploy your application

5. **Use environment-specific secrets**
   - Different secrets for development, staging, and production
   - Never reuse production secrets in development

### DON'T ❌

1. **Never commit .env files**
   - Pre-commit hook will block this, but always verify

2. **Never put real secrets in .env.example**
   - This file is committed to git and publicly visible

3. **Never share secrets in chat, email, or Slack**
   - Use secure secret management tools

4. **Never hardcode secrets in source code**
   - Always use environment variables

## What to Do If Secrets Are Exposed

1. **Immediately rotate all exposed secrets**
   - MongoDB: Change password at mongodb.com
   - API keys: Revoke and regenerate in provider console
   - JWT_SECRET: Generate new one and redeploy

2. **Check git history**
   ```bash
   git log --all --full-history -- backend/.env
   ```

3. **If secrets were pushed to GitHub**
   - You cannot delete from history easily
   - Rotate ALL secrets immediately
   - Consider using GitHub's secret scanning alerts

4. **Invalidate all user sessions**
   - If JWT_SECRET was exposed, all tokens are compromised

## GitHub Secret Scanning

Enable GitHub secret scanning:
1. Go to: https://github.com/mikecurious/Genesis/settings/security_analysis
2. Enable "Secret scanning"
3. Enable "Push protection" to block commits with secrets

## Pre-commit Hook

A pre-commit hook is installed that scans for:
- Actual .env files being committed
- MongoDB connection strings with credentials
- Google/OpenAI/GitHub API keys
- Long secret-like values in .env.example files

The hook will block commits if secrets are detected.

## Reporting Security Issues

If you discover a security vulnerability, please email: admin@mygenesisfortune.com

Do not create public GitHub issues for security vulnerabilities.
