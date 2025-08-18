# 🚀 Publish SDLC AI CLI - Step by Step

Follow these steps to publish your CLI to npm right now:

## Step 1: Create NPM Account (if needed)

If you don't have an npm account:
1. Open https://www.npmjs.com/signup
2. Create your account
3. Verify your email

## Step 2: Login to NPM

Run this command and enter your credentials:

```bash
npm login
```

You'll be prompted for:
- Username: [your npm username]
- Password: [your npm password]  
- Email: [your email]
- One-time password (if 2FA enabled)

## Step 3: Verify Login

```bash
npm whoami
```

This should show your npm username.

## Step 4: Check Package Name Availability

```bash
npm view sdlc-ai
```

If you see "npm ERR! 404", the name is available! ✅

## Step 5: Final Build Check

```bash
# We already built it, but let's make sure
npm run build

# Check that dist folder exists
ls -la dist/
```

## Step 6: Publish to NPM

```bash
npm publish --access public
```

You should see output like:
```
npm notice 📦  sdlc-ai@1.0.0
npm notice === Tarball Contents ===
npm notice 1.5kB  LICENSE
npm notice 5.2kB  README.md
npm notice 2.3kB  package.json
npm notice === Tarball Details ===
npm notice name:          sdlc-ai
npm notice version:       1.0.0
npm notice filename:      sdlc-ai-1.0.0.tgz
npm notice package size:  XX.X kB
npm notice unpacked size: XX.X kB
npm notice shasum:        [hash]
npm notice integrity:     [hash]
npm notice total files:   XX
+ sdlc-ai@1.0.0
```

## Step 7: Verify Installation

After publishing, test it:

```bash
# Install globally
npm install -g sdlc-ai

# Test it works
sdlc --version
# Should show: 1.0.0

# Try generating a document
sdlc generate "test project"
```

## 🎉 Success!

Your package is now live at:
- https://www.npmjs.com/package/sdlc-ai

Anyone can now install it with:
```bash
npm install -g sdlc-ai
```

## 📊 Monitor Your Package

- View package: https://www.npmjs.com/package/sdlc-ai
- Check downloads: https://npm-stat.com/charts.html?package=sdlc-ai
- See weekly stats: https://www.npmjs.com/package/sdlc-ai?activeTab=versions

## 🔧 Troubleshooting

### If "sdlc-ai" is taken:

Try these alternative names:
```bash
# Edit package.json and change the name to one of these:
- sdlc-ai-cli
- sdlc-doc-gen
- ai-sdlc-generator
- sdlc-gpt

# Then publish with the new name
npm publish --access public
```

### If you get permission errors:

1. Make sure you're logged in: `npm whoami`
2. Check your npm email is verified
3. Try logging out and back in:
   ```bash
   npm logout
   npm login
   ```

## 📝 Next Steps After Publishing

1. **Create a GitHub Release**:
   ```bash
   git tag -a v1.0.0 -m "Initial release"
   git push origin v1.0.0
   ```

2. **Update GitHub README** to show npm badge:
   ```markdown
   [![npm version](https://badge.fury.io/js/sdlc-ai.svg)](https://www.npmjs.com/package/sdlc-ai)
   ```

3. **Share on Social Media**:
   - Twitter/X: "Just published sdlc-ai 🚀 Generate comprehensive SDLC documentation with AI! npm install -g sdlc-ai #opensource #AI #npm"
   - LinkedIn: Share your achievement
   - Dev.to: Write an article about it

4. **Submit to Package Lists**:
   - Awesome Node.js: https://github.com/sindresorhus/awesome-nodejs
   - Product Hunt: https://www.producthunt.com/
   - OpenBase: https://openbase.com/

---

## 🆘 Need Help?

If you encounter any issues, here are the commands to help debug:

```bash
# Check npm configuration
npm config list

# View what will be published (dry run)
npm publish --dry-run

# Check package contents
npm pack
tar -tzf sdlc-ai-1.0.0.tgz
```

Ready? Go ahead and run `npm login` to start! 🚀