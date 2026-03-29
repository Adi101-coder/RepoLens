# AI Provider Comparison

RepoLens supports two AI providers. Here's how they compare:

## Google Gemini 2.0 Flash

### Pros
- ✅ **Free tier available** - 15 requests/min, 1,500 requests/day
- ✅ **Fast responses** - Optimized for speed
- ✅ **Easy to get started** - Just sign in with Google account
- ✅ **No credit card required** for free tier
- ✅ **Good for frequent use** - Generous free limits

### Cons
- ⚠️ Less detailed analysis compared to Claude
- ⚠️ May occasionally miss nuanced patterns

### Best For
- Developers who want to try RepoLens without cost
- Quick daily repo checks
- High-frequency analysis needs
- Budget-conscious users

### Get Started
1. Visit [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Sign in with Google
3. Click "Create API Key"
4. Copy and paste into RepoLens settings

---

## Anthropic Claude Opus 4.5

### Pros
- ✅ **More detailed analysis** - Better at identifying patterns
- ✅ **Nuanced insights** - Deeper understanding of code changes
- ✅ **Better context handling** - Excellent at summarizing complex PRs
- ✅ **More reliable** - Consistent high-quality output

### Cons
- ⚠️ **Paid only** - Requires credit card and usage fees
- ⚠️ **Slightly slower** - More thorough = takes a bit longer
- ⚠️ **Higher cost** - ~$0.01-0.03 per analysis

### Best For
- Professional developers
- Detailed project analysis
- Complex repositories with many changes
- When quality matters more than speed

### Get Started
1. Visit [console.anthropic.com](https://console.anthropic.com/)
2. Sign up and add payment method
3. Create API key
4. Copy and paste into RepoLens settings

---

## Quick Comparison Table

| Feature | Gemini 2.0 Flash | Claude Opus 4.5 |
|---------|------------------|-----------------|
| **Cost** | Free tier available | Paid only (~$0.01-0.03/analysis) |
| **Speed** | ⚡⚡⚡ Very Fast | ⚡⚡ Fast |
| **Analysis Quality** | ⭐⭐⭐ Good | ⭐⭐⭐⭐⭐ Excellent |
| **Free Tier** | 1,500 requests/day | None |
| **Setup Difficulty** | Easy (Google account) | Medium (requires payment) |
| **Best Use Case** | Daily quick checks | Deep analysis |

---

## Our Recommendation

### For Most Users: Start with Gemini
- Free to try
- Good enough for 90% of use cases
- Easy setup
- You can always switch to Claude later

### Upgrade to Claude When:
- You need more detailed insights
- You're analyzing complex enterprise repos
- You want the highest quality summaries
- Cost isn't a primary concern

---

## Can I Switch Between Providers?

**Yes!** You can switch anytime:

1. Click the gear icon (⚙) in RepoLens
2. Select a different AI provider
3. Enter the corresponding API key
4. Click Save

Your cached results and GitHub token remain unchanged.

---

## Cost Estimates

### Gemini (Free Tier)
- **Cost**: $0
- **Limit**: 1,500 analyses per day
- **Perfect for**: Individual developers

### Gemini (Paid)
- **Cost**: ~$0.001-0.005 per analysis
- **Limit**: Much higher
- **Perfect for**: Heavy users who exceed free tier

### Claude
- **Cost**: ~$0.01-0.03 per analysis
- **Limit**: Based on your Anthropic plan
- **Perfect for**: Professional use, detailed analysis

---

## Performance Tips

Regardless of provider:
- Add a GitHub token to avoid GitHub API rate limits
- Use cache (results cached for 15 minutes)
- Analyze during off-peak hours for faster responses
- Clear cache if you want fresh data
