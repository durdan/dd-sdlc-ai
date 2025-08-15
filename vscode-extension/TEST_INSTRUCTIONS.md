# VS Code Extension Testing Instructions

## Prerequisites

1. **Main Application Running**
   ```bash
   npm run dev
   ```
   The application should be running at `http://localhost:3000`

2. **Database Setup**
   - Run the VS Code extension support migration in Supabase:
   ```sql
   -- Execute the contents of database/migrations/vscode-extension-support.sql
   ```

3. **Environment Variables**
   Ensure `.env.local` has:
   - `JWT_SECRET` or `NEXTAUTH_SECRET` configured
   - Supabase credentials
   - AI service API keys (OpenAI or Anthropic)

## Installation Steps

1. **Install the Extension in VS Code**
   - Open VS Code
   - Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
   - Run: `Extensions: Install from VSIX...`
   - Select: `vscode-extension/sdlc-doc-generator/sdlc-doc-generator-1.0.0.vsix`

2. **Alternative: Development Mode**
   - Open the extension folder in VS Code:
     ```bash
     code vscode-extension/sdlc-doc-generator
     ```
   - Press `F5` to run in development mode
   - A new VS Code window will open with the extension loaded

## Testing the Extension

### 1. Initial Setup
- After installation, you should see "SDLC Document Generator" in the activity bar
- The status bar should show: `SDLC: 0/10` (for anonymous users)

### 2. Test Anonymous Usage
- Open a project folder in VS Code
- Right-click on any file and select "SDLC Docs: Quick Generate"
- Choose a document type (e.g., "Business Analysis")
- Enter your requirements when prompted
- Verify the document is generated and saved

### 3. Test Authentication Flow
1. **Sign In**
   - Click the account icon in the SDLC panel
   - Select "Sign In"
   - Browser should open to `http://localhost:3000/auth/vscode`
   - Sign in with Google if not already authenticated
   - Copy the authentication code shown
   - Return to VS Code and paste the code when prompted
   - Status bar should update to show `SDLC: 0/20` (authenticated limit)

2. **Verify Authentication**
   - Generate another document
   - Check that usage is tracked correctly
   - Verify account panel shows user email

### 4. Test Document Generation
Test each document type:
- Business Analysis
- Functional Specification
- Technical Specification
- UX Specification
- Architecture Diagram
- Wireframe
- AI Coding Prompt
- Test Specification

### 5. Test Usage Limits
- Generate documents until reaching the limit
- Verify appropriate error message when limit is reached
- For authenticated users: 20 documents/day
- For anonymous users: 10 documents/day

### 6. Test History Feature
- Click "Show History" in the SDLC panel
- Verify previously generated documents are listed
- Click on a document to open it

## Troubleshooting

### Extension Not Loading
- Check VS Code Output panel (View → Output → SDLC Document Generator)
- Ensure the main app is running at `http://localhost:3000`

### Authentication Issues
- Check browser console for errors on the auth page
- Verify JWT_SECRET is set in `.env.local`
- Check Supabase tables: `vscode_auth_codes`, `vscode_devices`

### API Connection Issues
- Verify the extension is using the correct API endpoint
- Check Network tab in VS Code Developer Tools (Help → Toggle Developer Tools)
- Ensure CORS is properly configured

### Database Issues
- Verify the migration has been run
- Check Supabase logs for any RLS policy violations
- Ensure service role key is configured

## Development Tips

1. **Hot Reload**: When developing, changes to TypeScript files require:
   ```bash
   npm run compile
   ```
   Then reload the extension host window (`Cmd+R` or `Ctrl+R`)

2. **Debug Console**: Use VS Code's debug console to inspect variables and test functions

3. **Clear Extension Data**: 
   - Command Palette → "Developer: Reload Window"
   - Or manually clear extension storage

## API Endpoints Used

- `POST /api/vscode/auth/device` - Register device
- `POST /api/vscode/auth/exchange` - Exchange auth code for token
- `GET /api/vscode/auth/validate` - Validate JWT token
- `POST /api/vscode/generate` - Generate document
- `GET /api/vscode/usage` - Check usage limits

## Success Criteria

✅ Extension installs without errors
✅ Anonymous users can generate up to 10 documents
✅ Authentication flow completes successfully
✅ Authenticated users can generate up to 20 documents
✅ Documents are saved locally
✅ History shows previous generations
✅ Usage tracking works correctly
✅ Status bar updates reflect current state