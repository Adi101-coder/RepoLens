# RepoLens — AI-Powered GitHub Repo Analyzer

A Chrome extension that uses Claude AI to instantly analyze any GitHub repository and deliver a clean, structured summary of recent commits and merged pull requests.

## Features

- 🤖 AI-powered analysis using Claude Opus or Gemini 2.0 Flash
- 📦 Automatic commit grouping by theme
- 🔀 Merged PR summaries with context
- 🔑 Key insights about project activity
- ⚡ Fast, client-side processing
- 🔒 API keys stored locally in your browser
- 🔄 Support for both Anthropic Claude and Google Gemini

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked"
5. Select the `github-agent-extension` folder
6. The RepoLens icon should appear in your extensions toolbar

## Setup

### Choose Your AI Provider

RepoLens supports two AI providers:

1. **Anthropic Claude** (Opus 4.5) - More detailed analysis
2. **Google Gemini** (2.0 Flash) - Faster and free tier available

### Option A: Anthropic Claude

1. Get your API key from [console.anthropic.com](https://console.anthropic.com/)
2. Click the RepoLens extension icon
3. Click the gear icon (⚙) to open settings
4. Select "Anthropic Claude" as provider
5. Enter your Anthropic API key (starts with `sk-ant-`)
6. Click Save

### Option B: Google Gemini

1. Get your API key from [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Click the RepoLens extension icon
3. Click the gear icon (⚙) to open settings
4. Select "Google Gemini" as provider
5. Enter your Gemini API key (starts with `AIza`)
6. Click Save

### Optional: GitHub Personal Access Token

For higher rate limits (5,000 req/hr vs 60 req/hr):

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select the `repo` scope (read-only access)
4. Copy the token (starts with `ghp_`)
5. Add it in RepoLens settings

## Usage

### Auto-detect from GitHub page

1. Navigate to any GitHub repository page
2. Click the RepoLens extension icon
3. The repo will be auto-detected
4. Click "Analyze"

### Manual entry

1. Click the RepoLens extension icon
2. Enter a repo in format: `owner/repo` (e.g., `vercel/next.js`)
3. Click "Analyze"

## How It Works

RepoLens uses an AI agent loop powered by Claude or Gemini:

1. Fetches repository metadata from GitHub API
2. Retrieves recent commits (filters out bot commits)
3. Gets merged pull requests
4. Optionally inspects PR file changes for context
5. AI analyzes and generates a structured summary

All processing happens client-side in your browser. No backend server required.

## Privacy & Security

- API keys are stored only in `chrome.storage.local` (sandboxed to this extension)
- Keys are never logged or sent anywhere except official API endpoints
- No analytics, no telemetry, no external tracking
- All data stays in your browser

⚠️ **Important**: Do not install this extension in a shared or managed browser profile, as API keys could be accessed by other users with access to that profile.

## Caching

- Analysis results are cached for 15 minutes per repository
- Cached results load instantly
- Cache is stored locally in your browser
- Clear cache via Settings → "Clear all data"

## Rate Limits

### GitHub API
- Without token: 60 requests/hour
- With token: 5,000 requests/hour

### AI Provider Limits

**Anthropic Claude:**
- Depends on your plan at console.anthropic.com
- Each analysis uses ~1-3 API calls

**Google Gemini:**
- Free tier: 15 requests/minute, 1,500 requests/day
- Paid tier: Higher limits available
- Each analysis uses ~1-3 API calls

## Troubleshooting

### "Add your AI API key in settings"
- You need to configure your API key first
- Click the gear icon and add your key

### "Your [Provider] API key looks invalid"
- Check that your key is correct
- Anthropic keys start with `sk-ant-`
- Gemini keys start with `AIza`

### "GitHub rate limit reached"
- Add a GitHub token in settings for higher limits
- Or wait for the rate limit to reset (1 hour)

### "Repo not found"
- The repo may be private (requires GitHub token with appropriate permissions)
- Check the repo URL is correct

### Extension not loading
- Make sure you're using Chrome or a Chromium-based browser
- Check that Developer mode is enabled in chrome://extensions/
- Try reloading the extension

## File Structure

```
github-agent-extension/
├── manifest.json          # Extension configuration
├── popup.html            # Main popup UI
├── popup.css             # Popup styling
├── popup.js              # Agent loop & API logic
├── settings.html         # Settings screen
├── settings.css          # Settings styling
├── settings.js           # Settings logic
├── marked.min.js         # Markdown renderer
└── icons/                # Extension icons
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

## Technical Details

- **Manifest Version**: V3
- **No build step**: Pure HTML/CSS/JS
- **No framework**: Vanilla JavaScript
- **APIs Used**:
  - Anthropic Claude API or Google Gemini API (direct browser calls)
  - GitHub REST API v3
- **CSP Compliant**: No eval, no inline scripts

## License

MIT License - feel free to modify and distribute.

## Credits

Built with:
- [Anthropic Claude](https://www.anthropic.com/) or [Google Gemini](https://ai.google.dev/) for AI analysis
- [GitHub API](https://docs.github.com/en/rest) for repository data
- [Marked.js](https://marked.js.org/) for markdown rendering
