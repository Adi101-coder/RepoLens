// State management
let currentRepo = null;
let aiProvider = 'anthropic';
let anthropicKey = null;
let geminiKey = null;
let githubToken = null;
let analysisInProgress = false;

// DOM elements
const repoInput = document.getElementById('repoInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const settingsBtn = document.getElementById('settingsBtn');
const cacheInfo = document.getElementById('cacheInfo');
const statusText = document.getElementById('statusText');
const resultContent = document.getElementById('resultContent');
const copyBtn = document.getElementById('copyBtn');
const reanalyzeBtn = document.getElementById('reanalyzeBtn');
const retryBtn = document.getElementById('retryBtn');
const errorMessage = document.getElementById('errorMessage');

const inputState = document.getElementById('inputState');
const loadingState = document.getElementById('loadingState');
const resultState = document.getElementById('resultState');
const errorState = document.getElementById('errorState');

// Initialize
init();

function init() {
  // Load API keys
  chrome.storage.local.get(['ai_provider', 'anthropic_key', 'gemini_key', 'github_token'], (result) => {
    aiProvider = result.ai_provider || 'anthropic';
    anthropicKey = result.anthropic_key;
    geminiKey = result.gemini_key;
    githubToken = result.github_token;

    // If no AI key configured, redirect to settings
    if ((aiProvider === 'anthropic' && !anthropicKey) || (aiProvider === 'gemini' && !geminiKey)) {
      chrome.runtime.openOptionsPage();
      return;
    }
  });

  // Detect GitHub repo from current tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      const url = tabs[0].url;
      const match = url.match(/github\.com\/([^/]+)\/([^/?\s#]+)/);
      if (match) {
        const repo = `${match[1]}/${match[2]}`;
        repoInput.value = repo;
        checkCache(repo);
      }
    }
  });

  // Event listeners
  analyzeBtn.addEventListener('click', startAnalysis);
  settingsBtn.addEventListener('click', () => chrome.runtime.openOptionsPage());
  copyBtn.addEventListener('click', copyToClipboard);
  reanalyzeBtn.addEventListener('click', startAnalysis);
  retryBtn.addEventListener('click', startAnalysis);

  repoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') startAnalysis();
  });
}

function checkCache(repo) {
  const cacheKey = `cache_${repo.replace('/', '_')}`;
  chrome.storage.local.get([cacheKey], (result) => {
    if (result[cacheKey]) {
      const { timestamp } = result[cacheKey];
      const age = Date.now() - timestamp;
      const minutes = Math.floor(age / 60000);

      if (minutes < 15) {
        cacheInfo.textContent = `Last analyzed: ${minutes} min ago`;
      }
    }
  });
}

async function startAnalysis() {
  if (analysisInProgress) return;

  const repoStr = normalizeRepoInput(repoInput.value.trim());
  if (!repoStr) {
    showError("That doesn't look like a valid GitHub repo. Try: owner/repo");
    return;
  }

  currentRepo = repoStr;
  analysisInProgress = true;

  showState('loading');
  updateStatus('⚙ Starting analysis...');

  try {
    await runAgentLoop(currentRepo);
  } catch (error) {
    handleError(error);
  } finally {
    analysisInProgress = false;
  }
}

function normalizeRepoInput(input) {
  if (!input) return null;

  // Handle full GitHub URLs
  const urlMatch = input.match(/github\.com\/([^/]+)\/([^/?\s#.]+)/);
  if (urlMatch) {
    return `${urlMatch[1]}/${urlMatch[2]}`;
  }

  // Handle owner/repo format
  const repoMatch = input.match(/^([^/\s]+)\/([^/\s]+)$/);
  if (repoMatch) {
    return input;
  }

  return null;
}

async function runAgentLoop(repo) {
  const [owner, repoName] = repo.split('/');

  const messages = [{
    role: 'user',
    content: `Analyze: ${repo}`
  }];

  let iterations = 0;
  const maxIterations = 8;
  let finalSummary = '';

  while (iterations < maxIterations) {
    iterations++;

    const response = aiProvider === 'gemini'
      ? await callGemini(messages, owner, repoName)
      : await callClaude(messages);

    if (response.stop_reason === 'end_turn') {
      // Extract text content
      const textBlock = response.content.find(block => block.type === 'text');
      if (textBlock) {
        finalSummary = textBlock.text;
      }
      break;
    }

    if (response.stop_reason === 'tool_use') {
      // Add assistant message
      messages.push({
        role: 'assistant',
        content: response.content
      });

      // Process tool calls
      const toolResults = [];
      for (const block of response.content) {
        if (block.type === 'tool_use') {
          const result = await executeToolCall(block.name, block.input, owner, repoName);
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: JSON.stringify(result)
          });
        }
      }

      // Add tool results
      messages.push({
        role: 'user',
        content: toolResults
      });

      continue;
    }

    // Unknown stop reason
    break;
  }

  if (!finalSummary && iterations >= maxIterations) {
    throw new Error('Analysis took too long. Please try again.');
  }

  if (!finalSummary) {
    throw new Error('No summary generated. Please try again.');
  }

  // Cache the result
  const cacheKey = `cache_${repo.replace('/', '_')}`;
  chrome.storage.local.set({
    [cacheKey]: {
      summary: finalSummary,
      timestamp: Date.now()
    }
  });

  // Render result
  showResult(finalSummary);
}

async function callClaude(messages) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': anthropicKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-opus-4-5',
      max_tokens: 4096,
      system: getSystemPrompt(),
      tools: getTools(),
      messages: messages
    })
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Your Anthropic API key looks invalid. Check it in settings.');
    }
    if (response.status === 429) {
      throw new Error("You've hit your Anthropic usage limit. Check your plan at console.anthropic.com.");
    }
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  return await response.json();
}

async function callGemini(messages, owner, repo) {
  // For Gemini, we'll handle tool calls manually instead of using function calling
  const lastMessage = messages[messages.length - 1];

  // Check if this is the initial request
  if (lastMessage.role === 'user' && typeof lastMessage.content === 'string') {
    // Initial request - manually call all tools and then ask Gemini to summarize
    updateStatus('⚙ Fetching repo info...');
    const repoInfo = await getRepoInfo(owner, repo);

    updateStatus('⚙ Loading recent commits...');
    const commits = await getRecentCommits(owner, repo, 30);

    updateStatus('⚙ Loading merged PRs...');
    const prs = await getMergedPRs(owner, repo, 20);

    updateStatus('🤖 Gemini is analyzing...');

    // Build a comprehensive prompt with all the data
    const prompt = `${getSystemPrompt()}

Repository: ${owner}/${repo}

REPOSITORY INFO:
${JSON.stringify(repoInfo, null, 2)}

RECENT COMMITS (${commits.length} commits):
${JSON.stringify(commits, null, 2)}

MERGED PULL REQUESTS (${prs.length} PRs):
${JSON.stringify(prs, null, 2)}

Now analyze this repository and provide a structured markdown summary following the exact format specified in the system prompt.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      }
    );

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('Your Gemini API key looks invalid. Check it in settings.');
      }
      if (response.status === 429) {
        throw new Error("You've hit your Gemini usage limit. Check your quota at aistudio.google.com.");
      }
      const errorText = await response.text();
      console.error('Gemini API error details:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText.substring(0, 200)}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';

    return {
      stop_reason: 'end_turn',
      content: [{ type: 'text', text }]
    };
  }

  // This shouldn't happen with our simplified approach
  return {
    stop_reason: 'end_turn',
    content: [{ type: 'text', text: 'Error: Unexpected message format' }]
  };
}

function convertMessagesToGemini(messages) {
  const geminiMessages = [];

  for (const msg of messages) {
    if (msg.role === 'user') {
      if (typeof msg.content === 'string') {
        geminiMessages.push({
          role: 'user',
          parts: [{ text: msg.content }]
        });
      } else if (Array.isArray(msg.content)) {
        // Tool results
        const parts = msg.content.map(item => {
          if (item.type === 'tool_result') {
            return {
              functionResponse: {
                name: 'tool_' + item.tool_use_id,
                response: { result: item.content }
              }
            };
          }
          return { text: item.text || '' };
        });
        geminiMessages.push({ role: 'user', parts });
      }
    } else if (msg.role === 'assistant') {
      const parts = [];
      for (const block of msg.content) {
        if (block.type === 'text') {
          parts.push({ text: block.text });
        } else if (block.type === 'tool_use') {
          parts.push({
            functionCall: {
              name: block.name,
              args: block.input
            }
          });
        }
      }
      if (parts.length > 0) {
        geminiMessages.push({ role: 'model', parts });
      }
    }
  }

  return geminiMessages;
}

function convertGeminiResponse(data, owner, repo) {
  const candidate = data.candidates?.[0];
  if (!candidate) {
    return { stop_reason: 'end_turn', content: [{ type: 'text', text: 'No response from Gemini' }] };
  }

  const parts = candidate.content?.parts || [];
  const content = [];

  for (const part of parts) {
    if (part.text) {
      content.push({ type: 'text', text: part.text });
    } else if (part.functionCall) {
      content.push({
        type: 'tool_use',
        id: 'tool_' + Date.now(),
        name: part.functionCall.name,
        input: part.functionCall.args
      });
    }
  }

  const hasToolCalls = content.some(c => c.type === 'tool_use');

  return {
    stop_reason: hasToolCalls ? 'tool_use' : 'end_turn',
    content
  };
}

function getGeminiTools() {
  return [
    {
      name: 'get_repo_info',
      description: 'Fetch metadata about a GitHub repository.',
      parameters: {
        type: 'object',
        properties: {
          owner: { type: 'string', description: 'Repository owner' },
          repo: { type: 'string', description: 'Repository name' }
        },
        required: ['owner', 'repo']
      }
    },
    {
      name: 'get_recent_commits',
      description: 'Fetch the most recent commits from a GitHub repository. Returns author, date, and commit message.',
      parameters: {
        type: 'object',
        properties: {
          owner: { type: 'string', description: 'Repository owner' },
          repo: { type: 'string', description: 'Repository name' },
          limit: { type: 'integer', description: 'Number of commits (default 30, max 100)' }
        },
        required: ['owner', 'repo']
      }
    },
    {
      name: 'get_merged_prs',
      description: 'Fetch recently merged pull requests. Returns title, author, merge date, and PR body.',
      parameters: {
        type: 'object',
        properties: {
          owner: { type: 'string', description: 'Repository owner' },
          repo: { type: 'string', description: 'Repository name' },
          limit: { type: 'integer', description: 'Number of PRs (default 20)' }
        },
        required: ['owner', 'repo']
      }
    },
    {
      name: 'get_pr_files',
      description: 'List files changed in a specific PR. Use this when a PR description is empty or vague.',
      parameters: {
        type: 'object',
        properties: {
          owner: { type: 'string', description: 'Repository owner' },
          repo: { type: 'string', description: 'Repository name' },
          pr_number: { type: 'integer', description: 'Pull request number' }
        },
        required: ['owner', 'repo', 'pr_number']
      }
    }
  ];
}

async function executeToolCall(toolName, input, owner, repo) {
  updateStatus(`⚙ ${toolName}...`);

  switch (toolName) {
    case 'get_repo_info':
      return await getRepoInfo(input.owner, input.repo);
    case 'get_recent_commits':
      return await getRecentCommits(input.owner, input.repo, input.limit || 30);
    case 'get_merged_prs':
      return await getMergedPRs(input.owner, input.repo, input.limit || 20);
    case 'get_pr_files':
      return await getPRFiles(input.owner, input.repo, input.pr_number);
    default:
      return { error: 'Unknown tool' };
  }
}

async function getRepoInfo(owner, repo) {
  const response = await githubFetch(`/repos/${owner}/${repo}`);
  return {
    full_name: response.full_name,
    description: response.description,
    language: response.language,
    stargazers_count: response.stargazers_count,
    forks_count: response.forks_count,
    pushed_at: response.pushed_at,
    pushed_at_relative: formatRelativeTime(response.pushed_at),
    open_issues_count: response.open_issues_count,
    default_branch: response.default_branch
  };
}

async function getRecentCommits(owner, repo, limit) {
  const response = await githubFetch(`/repos/${owner}/${repo}/commits?per_page=${Math.min(limit, 100)}`);

  return response
    .filter(commit => !isBot(commit.commit.author.name, commit.commit.author.email))
    .map(commit => ({
      sha: commit.sha.substring(0, 7),
      author: commit.commit.author.name,
      date: commit.commit.author.date,
      date_relative: formatRelativeTime(commit.commit.author.date),
      message: commit.commit.message.split('\n')[0]
    }));
}

function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);
  
  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
  if (diffMonths < 12) return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
  return `${diffYears} year${diffYears !== 1 ? 's' : ''} ago`;
}

async function getMergedPRs(owner, repo, limit) {
  const response = await githubFetch(`/repos/${owner}/${repo}/pulls?state=closed&per_page=${limit}&sort=updated&direction=desc`);

  return response
    .filter(pr => pr.merged_at)
    .map(pr => ({
      number: pr.number,
      title: pr.title,
      user: pr.user.login,
      merged_at: pr.merged_at,
      merged_at_relative: formatRelativeTime(pr.merged_at),
      html_url: pr.html_url,
      body: (pr.body || '').substring(0, 600)
    }));
}

async function getPRFiles(owner, repo, prNumber) {
  const response = await githubFetch(`/repos/${owner}/${repo}/pulls/${prNumber}/files?per_page=50`);

  return response.map(file => ({
    filename: file.filename,
    status: file.status,
    additions: file.additions,
    deletions: file.deletions
  }));
}

async function githubFetch(endpoint) {
  const headers = {
    'Accept': 'application/vnd.github.v3+json'
  };

  if (githubToken) {
    headers['Authorization'] = `token ${githubToken}`;
  }

  const response = await fetch(`https://api.github.com${endpoint}`, { headers });

  // Check rate limit
  const remaining = response.headers.get('X-RateLimit-Remaining');
  if (remaining && parseInt(remaining) < 5) {
    console.warn('GitHub rate limit almost reached');
  }

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Repo not found. It may be private or the URL may be wrong.');
    }
    if (response.status === 403 || response.status === 429) {
      throw new Error('GitHub rate limit reached. Add a token in settings for 5,000 req/hr.');
    }
    throw new Error(`GitHub API error: ${response.status}`);
  }

  return await response.json();
}

function isBot(name, email) {
  const botNames = ['dependabot', 'renovate', 'github-actions', 'greenkeeper'];
  const nameLower = name.toLowerCase();

  if (botNames.some(bot => nameLower.includes(bot))) return true;
  if (name.includes('[bot]')) return true;
  if (email && email.includes('@users.noreply.github.com') && botNames.some(bot => email.includes(bot))) return true;

  return false;
}

function getSystemPrompt() {
  return `You are RepoLens, an expert developer assistant that analyses GitHub repositories.

When given a repo in "owner/repo" format, you MUST follow this exact sequence:

1. Call get_repo_info to understand what the project is.
2. Call get_recent_commits to retrieve the latest commits.
3. Call get_merged_prs to retrieve recently merged pull requests.
4. If any PR has a vague or empty description AND there are fewer than 5 PRs total,
   call get_pr_files on the most significant ones for deeper context.
5. Produce a structured markdown summary.

Output format (strict):

## {repo_name}
> {one-line description} · {language} · ⭐ {stars} · Last push: {relative time}

---

### 📦 Recent commits
Group commits by theme. Ignore dependency bumps and bot commits entirely. Use sub-bullets for individual commits under each theme.

### 🔀 Merged PRs
List each merged PR as:
**#{number} — {title}** by @{author} · {relative date}
{1-2 sentence summary of what this PR actually did}

### 🔑 Key takeaways
3-4 bullet points answering: what is this project actively focused on right now? Any patterns in authorship, frequency, or areas of change worth noting?

Rules:
- Be concise. The popup is small. No padding sentences.
- Never invent information not present in the API data.
- If commits or PRs are empty, say so clearly rather than hallucinating activity.
- Use relative times ("2 days ago", "last week") not raw ISO timestamps.
- Filter out noise: Dependabot, Renovate, GitHub Actions bot commits should be ignored.`;
}

function getTools() {
  return [
    {
      name: 'get_repo_info',
      description: 'Fetch metadata about a GitHub repository.',
      input_schema: {
        type: 'object',
        properties: {
          owner: { type: 'string' },
          repo: { type: 'string' }
        },
        required: ['owner', 'repo']
      }
    },
    {
      name: 'get_recent_commits',
      description: 'Fetch the most recent commits from a GitHub repository. Returns author, date, and commit message.',
      input_schema: {
        type: 'object',
        properties: {
          owner: { type: 'string' },
          repo: { type: 'string' },
          limit: { type: 'integer', description: 'Number of commits (default 30, max 100)' }
        },
        required: ['owner', 'repo']
      }
    },
    {
      name: 'get_merged_prs',
      description: 'Fetch recently merged pull requests. Returns title, author, merge date, and PR body.',
      input_schema: {
        type: 'object',
        properties: {
          owner: { type: 'string' },
          repo: { type: 'string' },
          limit: { type: 'integer', description: 'Number of PRs (default 20)' }
        },
        required: ['owner', 'repo']
      }
    },
    {
      name: 'get_pr_files',
      description: 'List files changed in a specific PR. Use this when a PR description is empty or vague.',
      input_schema: {
        type: 'object',
        properties: {
          owner: { type: 'string' },
          repo: { type: 'string' },
          pr_number: { type: 'integer' }
        },
        required: ['owner', 'repo', 'pr_number']
      }
    }
  ];
}

function showResult(markdown) {
  resultContent.innerHTML = marked.parse(markdown);
  showState('result');
}

function copyToClipboard() {
  const markdown = resultContent.textContent;
  navigator.clipboard.writeText(markdown).then(() => {
    const originalText = copyBtn.textContent;
    copyBtn.textContent = '✓ Copied';
    setTimeout(() => {
      copyBtn.textContent = originalText;
    }, 2000);
  });
}

function showError(message) {
  errorMessage.textContent = message;
  showState('error');
}

function handleError(error) {
  console.error('Analysis error:', error);
  let message = error.message || 'An unexpected error occurred. Please try again.';

  // Add settings button for API key errors
  if (message.includes('API key')) {
    message += '\n\nClick the gear icon (⚙) to update your settings.';
  }

  showError(message);
}

function updateStatus(text) {
  statusText.textContent = text;
}

function showState(state) {
  inputState.classList.add('hidden');
  loadingState.classList.add('hidden');
  resultState.classList.add('hidden');
  errorState.classList.add('hidden');

  switch (state) {
    case 'input':
      inputState.classList.remove('hidden');
      analyzeBtn.disabled = false;
      analyzeBtn.textContent = 'Analyze';
      analyzeBtn.classList.remove('loading');
      break;
    case 'loading':
      loadingState.classList.remove('hidden');
      analyzeBtn.disabled = true;
      analyzeBtn.textContent = 'Analyzing...';
      analyzeBtn.classList.add('loading');
      break;
    case 'result':
      resultState.classList.remove('hidden');
      break;
    case 'error':
      errorState.classList.remove('hidden');
      break;
  }
}
