// Settings screen logic
const aiProviderSelect = document.getElementById('aiProvider');
const anthropicKeyInput = document.getElementById('anthropicKey');
const geminiKeyInput = document.getElementById('geminiKey');
const anthropicKeyGroup = document.getElementById('anthropicKeyGroup');
const geminiKeyGroup = document.getElementById('geminiKeyGroup');
const githubTokenInput = document.getElementById('githubToken');
const settingsForm = document.getElementById('settingsForm');
const errorMsg = document.getElementById('errorMsg');
const successMsg = document.getElementById('successMsg');
const clearDataBtn = document.getElementById('clearDataBtn');

// Load existing keys
chrome.storage.local.get(['ai_provider', 'anthropic_key', 'gemini_key', 'github_token'], (result) => {
  if (result.ai_provider) {
    aiProviderSelect.value = result.ai_provider;
    toggleProviderFields(result.ai_provider);
  }
  if (result.anthropic_key) {
    anthropicKeyInput.value = result.anthropic_key;
  }
  if (result.gemini_key) {
    geminiKeyInput.value = result.gemini_key;
  }
  if (result.github_token) {
    githubTokenInput.value = result.github_token;
  }
});

// Provider selection
aiProviderSelect.addEventListener('change', (e) => {
  toggleProviderFields(e.target.value);
});

function toggleProviderFields(provider) {
  if (provider === 'gemini') {
    anthropicKeyGroup.classList.add('hidden');
    geminiKeyGroup.classList.remove('hidden');
  } else {
    anthropicKeyGroup.classList.remove('hidden');
    geminiKeyGroup.classList.add('hidden');
  }
}

// Toggle visibility buttons
document.querySelectorAll('.toggle-visibility').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.dataset.target;
    const input = document.getElementById(targetId);
    if (input.type === 'password') {
      input.type = 'text';
      btn.textContent = '🙈';
    } else {
      input.type = 'password';
      btn.textContent = '👁';
    }
  });
});

// Save settings
settingsForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  errorMsg.classList.add('hidden');
  successMsg.classList.add('hidden');
  
  const provider = aiProviderSelect.value;
  const anthropicKey = anthropicKeyInput.value.trim();
  const geminiKey = geminiKeyInput.value.trim();
  const githubToken = githubTokenInput.value.trim();
  
  // Validate based on provider
  if (provider === 'anthropic') {
    if (!anthropicKey) {
      showError('Anthropic API key is required');
      return;
    }
    if (!anthropicKey.startsWith('sk-ant-')) {
      showError('Anthropic API key must start with sk-ant-');
      return;
    }
  } else if (provider === 'gemini') {
    if (!geminiKey) {
      showError('Gemini API key is required');
      return;
    }
    if (!geminiKey.startsWith('AIza')) {
      showError('Gemini API key must start with AIza');
      return;
    }
  }
  
  // Save to storage
  chrome.storage.local.set({
    ai_provider: provider,
    anthropic_key: anthropicKey,
    gemini_key: geminiKey,
    github_token: githubToken
  }, () => {
    successMsg.classList.remove('hidden');
    setTimeout(() => {
      window.close();
    }, 1000);
  });
});

// Clear all data
clearDataBtn.addEventListener('click', () => {
  if (confirm('Clear all stored data including API keys and cache?')) {
    chrome.storage.local.clear(() => {
      aiProviderSelect.value = 'anthropic';
      anthropicKeyInput.value = '';
      geminiKeyInput.value = '';
      githubTokenInput.value = '';
      toggleProviderFields('anthropic');
      successMsg.textContent = '✓ All data cleared';
      successMsg.classList.remove('hidden');
    });
  }
});

function showError(message) {
  errorMsg.textContent = message;
  errorMsg.classList.remove('hidden');
}
