# Quick Start Guide

## 1. Install the Extension

1. Open Chrome browser
2. Go to `chrome://extensions/`
3. Toggle "Developer mode" ON (top-right)
4. Click "Load unpacked"
5. Select the `github-agent-extension` folder
6. Done! You'll see the RepoLens icon in your toolbar

## 2. Get Your AI API Key

Choose one of these providers:

### Option A: Google Gemini (Recommended for beginners - has free tier)

1. Visit [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy it (starts with `AIza`)

### Option B: Anthropic Claude (More detailed analysis)

1. Visit [console.anthropic.com](https://console.anthropic.com/)
2. Sign up or log in
3. Go to API Keys section
4. Create a new key
5. Copy it (starts with `sk-ant-`)

## 3. Configure RepoLens

1. Click the RepoLens extension icon
2. Click the gear icon (⚙)
3. Select your AI provider (Gemini or Claude)
4. Paste your API key
5. (Optional) Add a GitHub token for higher rate limits
6. Click Save

## 4. Analyze Your First Repo

### Option A: Auto-detect
1. Go to any GitHub repo (e.g., `github.com/vercel/next.js`)
2. Click the RepoLens icon
3. Click "Analyze"

### Option B: Manual entry
1. Click the RepoLens icon
2. Type: `vercel/next.js`
3. Click "Analyze"

## 5. View Results

You'll see:
- 📦 Recent commits grouped by theme
- 🔀 Merged PRs with summaries
- 🔑 Key insights about the project

Results are cached for 15 minutes for quick access.

## Tips

- **Gemini** is great for quick analysis and has a generous free tier
- **Claude** provides more detailed and nuanced analysis
- Add a GitHub token to avoid rate limits
- Results load instantly from cache if analyzed recently
- Click "Copy" to copy the markdown summary
- Click "Re-analyze" to refresh the data

## Need Help?

Check the full README.md for troubleshooting and detailed documentation.
