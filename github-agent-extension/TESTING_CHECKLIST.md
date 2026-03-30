# Testing Checklist

Use this checklist to verify all features work correctly.

## Installation & Setup

- [ ] Extension loads without errors in chrome://extensions/
- [ ] All 4 icon sizes display correctly
- [ ] Settings page opens when clicking gear icon
- [ ] Settings page opens automatically on first install (no API key)

## Settings Screen

- [ ] Anthropic API key field accepts input
- [ ] GitHub token field accepts input (optional)
- [ ] Password toggle buttons work (👁 / 🙈)
- [ ] Validation: rejects keys not starting with "sk-ant-"
- [ ] Save button stores keys successfully
- [ ] Success message appears after saving
- [ ] Settings page auto-closes after save
- [ ] "Clear all data" button works and clears storage

## Popup - Auto-detection

- [ ] On GitHub repo page: repo auto-fills in input
- [ ] On GitHub profile page: input stays empty
- [ ] On GitHub file/blob page: strips to owner/repo format
- [ ] On non-GitHub page: input stays empty with placeholder

## Popup - Analysis Flow

- [ ] "Analyze" button triggers analysis
- [ ] Loading state shows spinner and status updates
- [ ] Status updates show: repo info, commits, PRs, Claude analyzing
- [ ] Analysis completes and shows formatted result
- [ ] Result displays markdown correctly (headers, lists, links)
- [ ] Result area is scrollable if content exceeds height

## Popup - Result Actions

- [ ] "Copy" button copies markdown to clipboard
- [ ] "Copy" button shows "✓ Copied" feedback
- [ ] "Re-analyze" button reruns analysis
- [ ] Cache info shows "Last analyzed: X min ago" if cached

## Error Handling

- [ ] No Anthropic key: redirects to settings
- [ ] Invalid Anthropic key (401): shows clear error message
- [ ] GitHub rate limit (403/429): shows error with suggestion
- [ ] Repo not found (404): shows "may be private" message
- [ ] Invalid repo format: shows "doesn't look like valid repo"
- [ ] Network offline: shows connection error
- [ ] Analysis timeout (8+ iterations): shows partial results

## Edge Cases

- [ ] Repo with zero commits: Claude says "no commits yet"
- [ ] Repo with zero merged PRs: Claude says "no merged PRs"
- [ ] Repo with 100+ commits/day: caps at 30, notes high activity
- [ ] Bot commits filtered: Dependabot, Renovate, github-actions
- [ ] PR with empty body: handled gracefully
- [ ] PR body > 600 chars: truncated before sending to Claude
- [ ] Multi-line commit messages: only first line shown
- [ ] Repo URL with trailing slash: normalized correctly
- [ ] Full GitHub URL input: parsed to owner/repo format

## Caching

- [ ] First analysis: no cache info shown
- [ ] Second analysis within 15 min: shows cache timestamp
- [ ] Analysis after 15 min: auto-reruns
- [ ] Multiple repos: each cached separately
- [ ] Clear data: removes all cached results

## Rate Limits

- [ ] Without GitHub token: works but limited to 60 req/hr
- [ ] With GitHub token: higher limit (5000 req/hr)
- [ ] Warning shown when GitHub rate limit < 5 remaining
- [ ] Error shown when rate limit exceeded

## UI/UX

- [ ] Popup dimensions: 400px × 560px
- [ ] Dark theme colors match GitHub dark mode
- [ ] All buttons have hover states
- [ ] All interactive elements have focus rings
- [ ] Animations smooth (200ms transitions)
- [ ] Custom scrollbar styling in result area
- [ ] Text is readable and properly sized

## Security

- [ ] API keys stored in chrome.storage.local only
- [ ] No keys logged to console
- [ ] No external calls except to declared APIs
- [ ] CSP prevents inline scripts and eval
- [ ] marked.min.js loaded locally (not from CDN)

## Test Repos

Try these repos for variety:

- [ ] `vercel/next.js` - Very active, many PRs
- [ ] `facebook/react` - Large, established project
- [ ] `denoland/deno` - Active developm