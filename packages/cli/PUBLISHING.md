# Publishing Guide for SDLC AI CLI

This guide explains how to publish the SDLC AI CLI to npm and other package registries.

## 📦 NPM Publishing

### Prerequisites

1. **Create an npm account**: https://www.npmjs.com/signup
2. **Login to npm**:
   ```bash
   npm login
   ```
3. **Verify login**:
   ```bash
   npm whoami
   ```

### First-Time Publishing

1. **Check package name availability**:
   ```bash
   npm view sdlc-ai
   # If "npm ERR! 404", the name is available
   ```

2. **Build the package**:
   ```bash
   cd packages/cli
   npm run build
   ```

3. **Test locally** (optional but recommended):
   ```bash
   npm pack
   # This creates sdlc-ai-1.0.0.tgz
   
   # Test installation
   npm install -g ./sdlc-ai-1.0.0.tgz
   sdlc --version
   
   # Uninstall test
   npm uninstall -g sdlc-ai
   ```

4. **Publish to npm**:
   ```bash
   npm publish
   ```

### Updating Versions

Follow semantic versioning (semver):

```bash
# Patch release (1.0.0 → 1.0.1) - Bug fixes
npm version patch

# Minor release (1.0.0 → 1.1.0) - New features, backward compatible
npm version minor

# Major release (1.0.0 → 2.0.0) - Breaking changes
npm version major

# Then publish
npm publish
```

## 🚀 GitHub Releases

### Manual Release

1. **Tag the release**:
   ```bash
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   ```

2. **Create GitHub Release**:
   - Go to https://github.com/yourusername/sdlc-ai-platform/releases
   - Click "Create a new release"
   - Choose the tag
   - Add release notes
   - Attach built artifacts if needed

### Automated Release with GitHub Actions

Create `.github/workflows/publish.yml`:

```yaml
name: Publish to NPM

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      
      - name: Install dependencies
        run: |
          cd packages/cli
          npm ci
      
      - name: Build
        run: |
          cd packages/cli
          npm run build
      
      - name: Publish to NPM
        run: |
          cd packages/cli
          npm publish
        env:
          NODE_AUTH_TOKEN: ${{secrets.NPM_TOKEN}}
```

To set up:
1. Get npm token: `npm token create`
2. Add to GitHub secrets: Settings → Secrets → New repository secret
3. Name: `NPM_TOKEN`, Value: your token

## 📊 Distribution Channels

### 1. NPM Registry (Primary)

```bash
npm install -g sdlc-ai
```

### 2. Yarn

```bash
yarn global add sdlc-ai
```

### 3. pnpm

```bash
pnpm add -g sdlc-ai
```

### 4. Direct from GitHub

```bash
npm install -g github:yourusername/sdlc-ai-platform#main
```

### 5. Homebrew (macOS/Linux)

Create a formula (after npm publish):

```ruby
class SdlcAi < Formula
  desc "CLI tool for AI-powered SDLC documentation generation"
  homepage "https://github.com/yourusername/sdlc-ai-platform"
  url "https://registry.npmjs.org/sdlc-ai/-/sdlc-ai-1.0.0.tgz"
  sha256 "YOUR_SHA256_HERE"
  license "MIT"

  depends_on "node"

  def install
    system "npm", "install", *Language::Node.std_npm_install_args(libexec)
    bin.install_symlink Dir["#{libexec}/bin/*"]
  end

  test do
    system "#{bin}/sdlc", "--version"
  end
end
```

### 6. Docker Image

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
RUN npm link
ENTRYPOINT ["sdlc"]
```

Build and publish:
```bash
docker build -t yourusername/sdlc-ai:latest .
docker push yourusername/sdlc-ai:latest
```

Usage:
```bash
docker run -it yourusername/sdlc-ai generate "project description"
```

## 📈 Post-Publishing

### 1. Verify Installation

```bash
npm view sdlc-ai
npm install -g sdlc-ai
sdlc --version
```

### 2. Update Documentation

- Update README with installation instructions
- Add npm badge: `[![npm version](https://badge.fury.io/js/sdlc-ai.svg)](https://www.npmjs.com/package/sdlc-ai)`
- Update website/docs

### 3. Monitor Usage

- Check npm stats: https://www.npmjs.com/package/sdlc-ai
- Monitor GitHub stars/issues
- Track downloads: `npm-stat.com/charts.html?package=sdlc-ai`

### 4. Announce Release

- GitHub Discussions
- Twitter/Social Media
- Dev.to / Medium article
- Reddit (r/programming, r/node)
- Product Hunt

## 🔒 Security Considerations

1. **Never commit sensitive data**:
   - API keys
   - Tokens
   - Private configurations

2. **Use 2FA on npm**:
   ```bash
   npm profile enable-2fa auth-and-writes
   ```

3. **Review dependencies**:
   ```bash
   npm audit
   npm audit fix
   ```

4. **Sign your commits**:
   ```bash
   git config --global commit.gpgsign true
   ```

## 🆘 Troubleshooting

### "Package name too similar to existing packages"

Choose a more unique name like:
- `sdlc-ai-cli`
- `sdlc-doc-gen`
- `ai-sdlc-generator`

### "You do not have permission to publish"

- Check npm login: `npm whoami`
- Verify package name is not taken
- Check organization permissions if scoped

### "Cannot publish over previously published version"

- Bump version: `npm version patch`
- Check current version: `npm view sdlc-ai version`

## 📋 Pre-Publishing Checklist

- [ ] All tests pass
- [ ] Build succeeds without errors
- [ ] README is up to date
- [ ] LICENSE file exists
- [ ] Package.json has all required fields
- [ ] Version number is correct
- [ ] No sensitive data in code
- [ ] .npmignore configured properly
- [ ] Test local installation works
- [ ] Changelog/Release notes ready

## 🎉 Congratulations!

Once published, your CLI will be available globally for developers to use:

```bash
npm install -g sdlc-ai
sdlc generate "my awesome project"
```

Remember to:
- Respond to issues promptly
- Keep dependencies updated
- Follow semantic versioning
- Document breaking changes
- Engage with the community