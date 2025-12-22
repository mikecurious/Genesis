# Security Checklist - Preventing Secret Exposure

## ✅ Completed Protections

- [x] Pre-commit hook installed to scan for secrets
- [x] .env is in .gitignore
- [x] .env.example uses only placeholder values
- [x] Security policy documented

## 🔄 Manual Actions Required

### Immediate (Do Now)

- [ ] **Push the security fixes**
  ```bash
  git push origin main
  ```

- [ ] **Rotate MongoDB password**
  1. Go to: https://cloud.mongodb.com
  2. Navigate to Database Access
  3. Change password for user "Genesis"
  4. Update `MONGO_URI` in backend/.env

- [ ] **Rotate Gemini API key**
  1. Go to: https://makersuite.google.com/app/apikey
  2. Delete the exposed key: `AIzaSyDQykLOQ6TMWAYNfaA5xmk_8BnfLPG_hxs`
  3. Create a new API key
  4. Update `GEMINI_API_KEY` in backend/.env

- [ ] **Rotate Gmail app password**
  1. Go to: https://myaccount.google.com/apppasswords
  2. Revoke the exposed password
  3. Generate a new app password
  4. Update `EMAIL_PASS` in backend/.env

### GitHub Configuration (Do Today)

- [ ] **Enable GitHub secret scanning**
  1. Go to: https://github.com/mikecurious/Genesis/settings/security_analysis
  2. Enable "Secret scanning"
  3. Enable "Push protection"

- [ ] **Review repository visibility**
  - If this is a private project, consider making the repo private
  - Go to: https://github.com/mikecurious/Genesis/settings
  - Scroll to "Danger Zone" → "Change repository visibility"

### Production Deployment (After Rotation)

- [ ] **Update production environment variables**
  - Update all secrets on your hosting platform (Render, Vercel, etc.)
  - Redeploy the application

- [ ] **Notify users (optional)**
  - If you have users, consider notifying them of the security update
  - All existing sessions will be invalidated (they'll need to log in again)

## 🛡️ Ongoing Best Practices

### Before Every Commit

The pre-commit hook will automatically check, but you should:
- Review what files you're committing: `git status`
- Check the diff: `git diff --cached`
- Never use `git add .` blindly - be explicit about what you're adding

### When Adding New Secrets

1. Add to `.env` (never committed)
2. Add placeholder to `.env.example` with instructions
3. Document in README if needed
4. Add to deployment platform's environment variables

### Regular Security Reviews

- Monthly: Review .env.example for any real values
- After new features: Check for hardcoded secrets
- Before major releases: Full security audit

## 🧪 Testing the Pre-commit Hook

Test that the hook is working:

```bash
# This should be BLOCKED by the hook
echo "TEST_SECRET=AIzaSyTestKey123456789012345678901" >> backend/.env.example
git add backend/.env.example
git commit -m "test"

# Clean up the test
git restore backend/.env.example
```

You should see: "🚫 COMMIT BLOCKED: Secrets detected!"

## 📚 Additional Resources

- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [12 Factor App - Config](https://12factor.net/config)

## 🆘 Emergency Response

If secrets are exposed again:

1. **STOP** - Don't panic
2. **ROTATE** - Change all exposed secrets immediately
3. **VERIFY** - Check git history: `git log --all --full-history -- backend/.env`
4. **NOTIFY** - If severe, notify affected users
5. **LEARN** - Review what went wrong and update processes
