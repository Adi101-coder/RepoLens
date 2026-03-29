# RepoLens Installation Guide

## What You've Got

A complete Chrome extension that analyzes GitHub repositories using AI. All files are ready to load into Chrome.

## Quick Install (3 minutes)

### Step 1: Load Extension into Chrome
1. Open Chrome browser
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked"
5. Select the `github-agent-extension` folder
6. ✅ Extension installed!

### Step 2: Get an AI API Key

**Recommended: Google Gemini (Free)**
- Visit: https://aistudio.google.com/app/apikey
- Sign in with Google
- Click "Create API Key"
- Copy the key (starts with `AIza`)

**Alternative: Anthropic Claude (Paid, better quality)**
- Visit: https://console.anthropic.com/
- Sign up and add payment
- Create API key
- Copy the key (starts with `sk-ant-`)

### Step 3: Configure RepoLens
1. Click the RepoLens icon in Chrome toolbar
2. Click the gear icon (⚙)
3. Select your AI provider
4. Paste your API key
5. Click "Save"

### Step 4: Try It Out!
1. Go to any GitHub repo (e.g., https://github.com/vercel/next.js)
2. Click the RepoLens icon
3. Click "Analyze"
4. Watch the magic happen! ✨

## Optional: Add GitHub Token

For higher rate limits (5,000 req/hr vs 60 req/hr):

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select `repo` scope (read-only)
4. Copy the token
5. Add it in RepoLens settings

## Files Included

```
github-agent-extension/
├── manifest.json              # Extension config
├── popup.html/css/js          # Main UI
├── settings.html/css/js       # Settings screen
├── marked.min.js              # Markdown renderer
├── icons/                     # Extension icons
├── README.md                  # Full documentation
├── QUICKSTART.md              # Quick start guide
├── AI_PROVIDER_COMPARISON.md  # Provider comparison
└── TESTING_CHECKLIST.md       # Testing guide
```

## Troubleshooting

### Extension won't load
- Make sure "Developer mode" is ON in chrome://extensions/
- Check that you selected the `github-agent-extension` folder (not parent folder)

### "Add your API key" message
- You need to configure an API key first
- Click the gear icon and follow setup steps

### Analysis fails
- Check your API key is correct
- Verify you have internet connection
- Try a different repo to test

## Next Steps

1. Read `QUICKSTART.md` for usage tips
2. Check `AI_PROVIDER_COMPARISON.md` to choose the best provider
3. See `README.md` for full documentation

## Support

- Check `TESTING_CHECKLIST.md` for common issues
- Review error messages - they include helpful suggestions
- All API keys are stored locally in your browser only

Enjoy analyzing repos with AI! 🚀
