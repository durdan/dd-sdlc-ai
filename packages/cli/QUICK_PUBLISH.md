# Quick Publishing Guide

## 🚀 Publish to NPM in 5 Minutes

### Step 1: Create NPM Account
If you don't have an npm account:
1. Go to https://www.npmjs.com/signup
2. Create your account
3. Verify your email

### Step 2: Login to NPM
```bash
npm login
# Enter your username, password, and email
```

### Step 3: Build and Publish
```bash
cd packages/cli

# Build the package
npm run build

# Publish to npm
npm publish --access public
```

That's it! Your package is now live at: https://www.npmjs.com/package/sdlc-ai

## 📦 What Users Will See

Once published, developers can install your CLI:

```bash
# Install globally
npm install -g sdlc-ai

# Use it immediately
sdlc generate "create an e-commerce platform"
```

## 🎯 First-Time Publisher Checklist

Before publishing, ensure:

- [ ] You're logged into npm (`npm whoami`)
- [ ] The package name "sdlc-ai" is available (`npm view sdlc-ai`)
- [ ] You've built the project (`npm run build`)
- [ ] The dist/ folder exists and contains compiled JS files

## 🆘 Common Issues

### "You do not have permission to publish"
- Make sure you're logged in: `npm login`
- Check the package name isn't taken: `npm view sdlc-ai`

### "Cannot find module"
- Run `npm run build` first
- Make sure dist/ folder exists

### "Package name too similar"
Try alternative names:
- `sdlc-ai-cli`
- `sdlc-generator`
- `ai-sdlc`

## 📊 After Publishing

1. **Test it works**:
   ```bash
   npm install -g sdlc-ai
   sdlc --version
   ```

2. **Share your package**:
   - Tweet: "Just published sdlc-ai - Generate SDLC docs with AI! npm install -g sdlc-ai"
   - Post on Reddit: r/node, r/javascript, r/programming
   - Share on Dev.to or Medium

3. **Monitor usage**:
   - View stats: https://www.npmjs.com/package/sdlc-ai
   - Check downloads: https://npm-stat.com/charts.html?package=sdlc-ai

## 🔄 Updating Your Package

When you make changes:

```bash
# Make your changes, then:

# Bump version (choose one):
npm version patch  # 1.0.0 → 1.0.1 (bug fixes)
npm version minor  # 1.0.0 → 1.1.0 (new features)
npm version major  # 1.0.0 → 2.0.0 (breaking changes)

# Build and publish
npm run build
npm publish
```

## 🎉 Congratulations!

You've just made your CLI available to millions of developers worldwide!

Your package URL: https://www.npmjs.com/package/sdlc-ai
Package stats: https://npm-stat.com/charts.html?package=sdlc-ai

---

Need help? Open an issue on GitHub or reach out to the community!