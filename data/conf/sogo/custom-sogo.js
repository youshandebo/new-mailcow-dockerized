// QQ Mail Style CSS Injection for SOGo
(function() {
  'use strict';

  var css = `
    /* ===== QQ Mail Theme for SOGo ===== */
    /* Based on actual SOGo DOM: md-toolbar, md-sidenav, md-list-item, md-content */

    /* --- Global Font & Base --- */
    body, body.ng-scope, main {
      font-family: 'Noto Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif !important;
      color: #333 !important;
      background: #f0f2f5 !important;
    }

    /* --- Top Navbar --- */
    md-toolbar, md-toolbar.md-default-theme, md-toolbar.md-hue-2 {
      background: linear-gradient(135deg, #4A90D9 0%, #357ABD 50%, #2B6CB0 100%) !important;
      color: #fff !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
      z-index: 100 !important;
    }
    md-toolbar .md-toolbar-tools {
      color: #fff !important;
      padding: 0 16px !important;
      font-size: 15px !important;
    }
    md-toolbar a, md-toolbar button, md-toolbar .md-button,
    md-toolbar .md-toolbar-tools a, md-toolbar .md-toolbar-tools button,
    md-toolbar .md-toolbar-tools .md-button {
      color: rgba(255,255,255,0.9) !important;
    }
    md-toolbar a:hover, md-toolbar button:hover, md-toolbar .md-button:hover {
      color: #fff !important;
      background: rgba(255,255,255,0.12) !important;
    }
    md-toolbar md-icon {
      color: rgba(255,255,255,0.9) !important;
    }
    md-toolbar .md-toolbar-tools .md-button {
      margin: 0 2px !important;
      padding: 6px 12px !important;
      font-size: 13px !important;
      border-radius: 6px !important;
    }
    /* Hide default brand in toolbar */
    md-toolbar .md-toolbar-tools > a:first-child {
      font-size: 0 !important;
      width: 0 !important;
      max-width: 0 !important;
      overflow: hidden !important;
      margin: 0 !important;
      padding: 0 !important;
      opacity: 0 !important;
      pointer-events: none !important;
      position: absolute !important;
    }
    /* Injected brand */
    md-toolbar .mc-qq-brand {
      font-size: 18px !important;
      font-weight: 700 !important;
      letter-spacing: 1px !important;
      margin-right: 24px !important;
      color: #fff !important;
      text-decoration: none !important;
      white-space: nowrap !important;
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      position: relative !important;
      z-index: 10 !important;
    }
    md-toolbar .mc-qq-brand span {
      font-size: 20px !important;
    }

    /* --- Sidebar / Folder Panel --- */
    md-sidenav, md-sidenav.md-sidenav-left {
      background: #fff !important;
      border-right: 1px solid #e8ecef !important;
    }
    md-sidenav md-list-item, md-sidenav md-list-item .md-button {
      color: #333 !important;
      font-size: 13px !important;
      min-height: 38px !important;
      height: 38px !important;
      line-height: 38px !important;
      border-radius: 6px !important;
      transition: all 0.15s ease !important;
    }
    md-sidenav md-list-item:hover, md-sidenav md-list-item .md-button:hover {
      background: #f0f6ff !important;
      color: #4A90D9 !important;
    }
    md-sidenav md-list-item.md-active .md-button,
    md-sidenav md-list-item.selected .md-button,
    md-sidenav md-list-item .md-button.selected,
    md-sidenav md-list-item .md-button.md-focused {
      background: linear-gradient(135deg, #4A90D9, #357ABD) !important;
      color: #fff !important;
      font-weight: 500 !important;
      box-shadow: 0 2px 6px rgba(30,136,229,0.3) !important;
    }
    md-sidenav md-list-item .badge,
    md-sidenav md-list-item .badgeContainer {
      background: #ff4444 !important;
      color: #fff !important;
      font-size: 11px !important;
      padding: 2px 6px !important;
      border-radius: 10px !important;
      min-width: 18px !important;
      text-align: center !important;
      font-weight: 600 !important;
    }
    md-sidenav md-list-item md-icon {
      font-size: 18px !important;
      width: 18px !important;
      height: 18px !important;
      margin-right: 8px !important;
      color: #4A90D9 !important;
    }
    md-sidenav md-list-item.md-active md-icon,
    md-sidenav md-list-item.selected md-icon {
      color: #fff !important;
    }
    md-sidenav md-divider {
      margin: 4px 12px !important;
      border-color: #f0f0f0 !important;
    }
    /* Folder panel section headers */
    md-sidenav .folder-name, md-sidenav .panel-heading {
      background: #fafbfc !important;
      border-bottom: 1px solid #e8ecef !important;
      padding: 12px 16px !important;
      font-size: 14px !important;
      font-weight: 600 !important;
      color: #333 !important;
    }

    /* --- Mail List --- */
    md-content {
      background: #fff !important;
    }
    md-content md-list-item,
    md-content md-list-item.md-no-proxy {
      border-bottom: 1px solid #f5f5f5 !important;
      padding: 10px 16px !important;
      min-height: 64px !important;
      transition: background 0.15s ease !important;
    }
    md-content md-list-item:hover {
      background: #f0f6ff !important;
    }
    md-content md-list-item.md-active,
    md-content md-list-item.selected,
    md-content md-list-item.active {
      background: #e8f0fe !important;
      border-left: 3px solid #4A90D9 !important;
      padding-left: 13px !important;
    }
    md-content md-list-item.unread,
    md-content md-list-item .unread {
      font-weight: 600 !important;
    }
    md-content md-list-item .subject {
      color: #1a1a1a !important;
      font-size: 14px !important;
      font-weight: 500 !important;
    }
    md-content md-list-item .from {
      color: #333 !important;
      font-size: 13px !important;
    }
    md-content md-list-item .preview,
    md-content md-list-item .snippet {
      color: #999 !important;
      font-size: 12px !important;
      margin-top: 2px !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      white-space: nowrap !important;
    }
    md-content md-list-item .date {
      color: #999 !important;
      font-size: 12px !important;
    }
    md-content md-list-item .badge {
      background: #ff4444 !important;
      color: #fff !important;
      font-size: 11px !important;
      padding: 2px 6px !important;
      border-radius: 10px !important;
      font-weight: 600 !important;
    }

    /* --- Buttons --- */
    .md-button.md-primary, md-button.md-primary {
      background: linear-gradient(135deg, #4A90D9, #357ABD) !important;
      color: #fff !important;
      border-radius: 6px !important;
      font-size: 13px !important;
      padding: 6px 16px !important;
      box-shadow: 0 1px 3px rgba(30,136,229,0.3) !important;
      transition: all 0.2s ease !important;
    }
    .md-button.md-primary:hover, md-button.md-primary:hover {
      background: linear-gradient(135deg, #357ABD, #2B6CB0) !important;
      box-shadow: 0 2px 6px rgba(30,136,229,0.4) !important;
    }
    .md-button.md-raised, md-button.md-raised {
      border-radius: 6px !important;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08) !important;
      transition: all 0.2s ease !important;
    }
    .md-button.md-raised:hover, md-button.md-raised:hover {
      box-shadow: 0 2px 8px rgba(0,0,0,0.12) !important;
    }
    .md-button:not(.md-raised):not(.md-primary) {
      border-radius: 6px !important;
      transition: background 0.15s ease !important;
    }
    .md-button:not(.md-raised):not(.md-primary):hover {
      background: rgba(30,136,229,0.08) !important;
    }
    .md-button.md-fab, md-fab-trigger .md-button {
      background: linear-gradient(135deg, #4A90D9, #2B6CB0) !important;
      box-shadow: 0 4px 12px rgba(30,136,229,0.4) !important;
    }

    /* --- Links --- */
    a { color: #4A90D9 !important; }
    a:hover { color: #357ABD !important; text-decoration: underline !important; }

    /* --- Input Fields --- */
    md-input-container input, md-input-container textarea,
    md-input-container .md-input {
      border-color: #ddd !important;
      border-radius: 6px !important;
      padding: 8px 12px !important;
      font-size: 14px !important;
    }
    md-input-container input:focus, md-input-container textarea:focus,
    md-input-container .md-input:focus {
      border-color: #4A90D9 !important;
      box-shadow: 0 0 0 2px rgba(30,136,229,0.15) !important;
    }

    /* --- Tabs --- */
    md-tabs md-tab-item, md-tab-item {
      color: #666 !important;
      font-size: 14px !important;
    }
    md-tabs md-tab-item.md-active, md-tab-item.md-active {
      color: #4A90D9 !important;
      font-weight: 600 !important;
    }
    md-ink-bar {
      background: #4A90D9 !important;
      height: 3px !important;
    }

    /* --- Checkbox / Switch --- */
    md-checkbox.md-checked .md-icon {
      background: #4A90D9 !important;
      border-color: #4A90D9 !important;
    }
    md-switch.md-checked .md-thumb { background: #4A90D9 !important; }
    md-switch.md-checked .md-bar { background: rgba(30,136,229,0.5) !important; }

    /* --- Cards, Dialogs --- */
    md-card {
      border-radius: 8px !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06) !important;
      border: none !important;
    }
    md-dialog {
      border-radius: 12px !important;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18) !important;
    }
    md-toast {
      background: #323232 !important;
      border-radius: 8px !important;
    }
    md-divider {
      border-color: #f0f0f0 !important;
    }

    /* --- Scrollbar --- */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #d0d0d0; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: #b0b0b0; }

    /* --- General UI --- */
    .contact-image, .avatar {
      border-radius: 50% !important;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
    }
    md-select-menu md-content, md-menu-content {
      border-radius: 8px !important;
      box-shadow: 0 4px 16px rgba(0,0,0,0.12) !important;
      border: 1px solid #e8ecef !important;
    }
    md-option {
      font-size: 13px !important;
      min-height: 36px !important;
    }
    md-option:hover, md-option:focus {
      background: #e8f0fe !important;
    }
    table { border-collapse: separate !important; border-spacing: 0 !important; }
    table th {
      background: #fafbfc !important;
      font-weight: 600 !important;
      font-size: 13px !important;
      color: #555 !important;
      border-bottom: 2px solid #e8ecef !important;
      padding: 10px 12px !important;
    }
    table td {
      border-bottom: 1px solid #f5f5f5 !important;
      padding: 10px 12px !important;
      font-size: 13px !important;
    }
    table tr:hover td { background: #f8fafc !important; }
    md-tooltip {
      font-size: 12px !important;
      background: #333 !important;
      border-radius: 4px !important;
      padding: 4px 8px !important;
    }

    /* ===== AI Assistant Panel ===== */
    #ai-assistant-btn {
      position: fixed; bottom: 24px; right: 24px; z-index: 9999;
      width: 56px; height: 56px; border-radius: 50%;
      background: linear-gradient(135deg, #4A90D9, #2B6CB0);
      color: #fff; border: none; cursor: pointer;
      box-shadow: 0 4px 16px rgba(30,136,229,0.4);
      display: flex; align-items: center; justify-content: center;
      font-size: 24px; transition: transform 0.2s, box-shadow 0.2s;
    }
    #ai-assistant-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 24px rgba(30,136,229,0.5);
    }
    #ai-panel {
      position: fixed; bottom: 90px; right: 24px; z-index: 9998;
      width: 380px; height: 520px;
      background: #fff; border-radius: 12px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.18);
      display: none; flex-direction: column;
      overflow: hidden; font-family: 'Noto Sans', sans-serif;
    }
    #ai-panel.open { display: flex; }
    #ai-panel-header {
      background: linear-gradient(135deg, #4A90D9, #2B6CB0);
      color: #fff; padding: 16px 20px;
      display: flex; align-items: center; justify-content: space-between;
    }
    #ai-panel-header h3 { margin: 0; font-size: 16px; font-weight: 600; }
    #ai-panel-header button {
      background: rgba(255,255,255,0.2); border: none; color: #fff;
      width: 28px; height: 28px; border-radius: 50%; cursor: pointer;
      font-size: 16px; display: flex; align-items: center; justify-content: center;
    }
    #ai-panel-actions {
      padding: 10px 16px; border-bottom: 1px solid #f0f0f0;
      display: flex; gap: 8px; flex-wrap: wrap;
    }
    #ai-panel-actions button {
      padding: 6px 12px; border-radius: 16px; border: 1px solid #e0e0e0;
      background: #f5f7fa; color: #555; font-size: 12px; cursor: pointer;
      transition: all 0.2s;
    }
    #ai-panel-actions button:hover { background: #e3edf7; border-color: #4A90D9; color: #4A90D9; }
    #ai-messages {
      flex: 1; overflow-y: auto; padding: 16px;
      display: flex; flex-direction: column; gap: 12px;
    }
    .ai-msg {
      max-width: 85%; padding: 10px 14px; border-radius: 12px;
      font-size: 14px; line-height: 1.5; word-break: break-word;
    }
    .ai-msg.user {
      align-self: flex-end;
      background: #4A90D9; color: #fff;
      border-bottom-right-radius: 4px;
    }
    .ai-msg.assistant {
      align-self: flex-start;
      background: #f0f4f8; color: #333;
      border-bottom-left-radius: 4px;
    }
    .ai-msg.error {
      align-self: center;
      background: #fff3f3; color: #c62828;
      font-size: 13px;
    }
    .ai-typing {
      align-self: flex-start; padding: 10px 14px;
      background: #f0f4f8; border-radius: 12px;
      font-size: 14px; color: #999;
    }
    .ai-typing span { animation: ai-dot 1.4s infinite; }
    .ai-typing span:nth-child(2) { animation-delay: 0.2s; }
    .ai-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes ai-dot {
      0%, 80%, 100% { opacity: 0.3; }
      40% { opacity: 1; }
    }
    #ai-input-area {
      padding: 12px 16px; border-top: 1px solid #f0f0f0;
      display: flex; gap: 8px; align-items: flex-end;
    }
    #ai-input {
      flex: 1; border: 1px solid #e0e0e0; border-radius: 20px;
      padding: 10px 16px; font-size: 14px; resize: none;
      outline: none; max-height: 80px; min-height: 40px;
      font-family: inherit; line-height: 1.4;
    }
    #ai-input:focus { border-color: #4A90D9; }
    #ai-send {
      width: 40px; height: 40px; border-radius: 50%;
      background: #4A90D9; color: #fff; border: none;
      cursor: pointer; display: flex; align-items: center;
      justify-content: center; font-size: 18px;
      transition: background 0.2s; flex-shrink: 0;
    }
    #ai-send:hover { background: #357ABD; }
    #ai-send:disabled { background: #ccc; cursor: not-allowed; }
    .ai-msg pre {
      background: #f5f5f5; padding: 8px; border-radius: 6px;
      overflow-x: auto; font-size: 13px; margin: 6px 0;
    }
    .ai-msg code {
      background: #f5f5f5; padding: 2px 4px; border-radius: 3px;
      font-size: 13px;
    }
    .ai-msg p { margin: 4px 0; }
    .ai-msg ul, .ai-msg ol { margin: 4px 0; padding-left: 20px; }

    @media (max-width: 480px) {
      #ai-panel { width: calc(100vw - 32px); right: 16px; bottom: 80px; height: 60vh; }
      #ai-assistant-btn { bottom: 16px; right: 16px; }
    }
  `;

  var style = document.createElement('style');
  style.type = 'text/css';
  style.id = 'sogo-qq-mail-style';
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);
  console.log('[QQ Mail] CSS injected');
})();

// Inject QQ Mail brand into toolbar
(function() {
  'use strict';
  function injectBrand() {
    var toolbar = document.querySelector('md-toolbar .md-toolbar-tools');
    if (!toolbar || toolbar.querySelector('.mc-qq-brand')) return false;
    var brand = document.createElement('a');
    brand.className = 'mc-qq-brand';
    brand.href = '/SOGo/';
    brand.innerHTML = '<span>&#x2709;</span> AI Mail';
    toolbar.insertBefore(brand, toolbar.firstChild);
    console.log('[QQ Mail] Brand injected');
    return true;
  }
  if (!injectBrand()) {
    var observer = new MutationObserver(function() {
      if (injectBrand()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(injectBrand, 1000);
    setTimeout(injectBrand, 3000);
    setTimeout(function() { observer.disconnect(); }, 10000);
  }
})();

// AI Assistant for SOGo
(function() {
  'use strict';

  var AI_BASE = '/api/ai-proxy.php';
  var AI_KEY = 'mailcow-ai-2024';
  var chatHistory = [];
  var isOpen = false;

  function createUI() {
    var btn = document.createElement('button');
    btn.id = 'ai-assistant-btn';
    btn.innerHTML = '&#x1F4AC;';
    btn.title = 'AI 助手';
    btn.onclick = togglePanel;
    document.body.appendChild(btn);

    var panel = document.createElement('div');
    panel.id = 'ai-panel';
    panel.innerHTML = `
      <div id="ai-panel-header">
        <h3>&#x1F916; AI 邮件助手</h3>
        <button onclick="document.getElementById('ai-panel').classList.remove('open')">&times;</button>
      </div>
      <div id="ai-panel-actions">
        <button onclick="aiSummarize()">&#x1F4DD; 总结当前邮件</button>
        <button onclick="aiReply()">&#x1F4AC; 帮我回复</button>
        <button onclick="aiTranslate()">&#x1F310; 翻译</button>
      </div>
      <div id="ai-messages">
        <div class="ai-msg assistant">你好！我是 AI 邮件助手。你可以问我任何问题，或者点击上方按钮对当前邮件进行操作。</div>
      </div>
      <div id="ai-input-area">
        <textarea id="ai-input" placeholder="输入消息..." rows="1"></textarea>
        <button id="ai-send" onclick="aiSendMessage()">&#x27A4;</button>
      </div>
    `;
    document.body.appendChild(panel);

    var input = document.getElementById('ai-input');
    input.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 80) + 'px';
    });
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        aiSendMessage();
      }
    });
  }

  function togglePanel() {
    var panel = document.getElementById('ai-panel');
    isOpen = !isOpen;
    if (isOpen) {
      panel.classList.add('open');
      document.getElementById('ai-input').focus();
    } else {
      panel.classList.remove('open');
    }
  }

  function addMessage(text, role) {
    var messages = document.getElementById('ai-messages');
    var div = document.createElement('div');
    div.className = 'ai-msg ' + role;
    div.innerHTML = formatText(text);
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  function formatText(text) {
    return text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }

  function showTyping() {
    var messages = document.getElementById('ai-messages');
    var div = document.createElement('div');
    div.className = 'ai-typing';
    div.id = 'ai-typing';
    div.innerHTML = '<span>&#x25CF;</span> <span>&#x25CF;</span> <span>&#x25CF;</span>';
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function hideTyping() {
    var el = document.getElementById('ai-typing');
    if (el) el.remove();
  }

  function getCurrentEmail() {
    var subject = document.querySelector('.mail-content .subject, .mc-mail-content .subject, md-content .subject');
    var body = document.querySelector('.mail-content .body, .mc-mail-content .body, .mail-body, md-content .body');
    var from = document.querySelector('.mail-content .from, .mc-mail-content .from, md-content .from');
    if (subject || body) {
      return {
        subject: subject ? subject.textContent.trim() : '',
        body: body ? body.innerText.trim().substring(0, 3000) : '',
        from: from ? from.textContent.trim() : ''
      };
    }
    return null;
  }

  async function streamChat(messages, onChunk) {
    var response = await fetch(AI_BASE + '/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-AI-Key': AI_KEY },
      body: JSON.stringify({ messages: messages })
    });
    if (!response.ok) throw new Error('AI request failed: ' + response.status);
    var reader = response.body.getReader();
    var decoder = new TextDecoder();
    var buffer = '';
    while (true) {
      var result = await reader.read();
      if (result.done) break;
      buffer += decoder.decode(result.value, { stream: true });
      var lines = buffer.split('\n');
      buffer = lines.pop();
      for (var line of lines) {
        if (line.startsWith('data: ')) {
          var data = line.slice(6).trim();
          if (data === '[DONE]') return;
          try {
            var parsed = JSON.parse(data);
            if (parsed.text) onChunk(parsed.text);
            if (parsed.error) throw new Error(parsed.error);
          } catch (e) {
            if (e.message !== 'AI request failed') continue;
            throw e;
          }
        }
      }
    }
  }

  window.aiSendMessage = async function() {
    var input = document.getElementById('ai-input');
    var text = input.value.trim();
    if (!text) return;
    input.value = '';
    input.style.height = 'auto';
    addMessage(text, 'user');
    chatHistory.push({ role: 'user', content: text });
    showTyping();
    document.getElementById('ai-send').disabled = true;
    try {
      var response = '';
      var msgDiv = null;
      await streamChat(chatHistory, function(chunk) {
        if (!msgDiv) { hideTyping(); msgDiv = addMessage('', 'assistant'); }
        response += chunk;
        msgDiv.innerHTML = formatText(response);
        document.getElementById('ai-messages').scrollTop = document.getElementById('ai-messages').scrollHeight;
      });
      chatHistory.push({ role: 'assistant', content: response });
    } catch (err) {
      hideTyping();
      addMessage('错误: ' + err.message, 'error');
    }
    document.getElementById('ai-send').disabled = false;
  };

  window.aiSummarize = async function() {
    var email = getCurrentEmail();
    if (!email) { addMessage('请先打开一封邮件，然后再点击"总结当前邮件"。', 'error'); return; }
    addMessage('正在总结邮件...', 'user');
    showTyping();
    chatHistory.push({ role: 'user', content: '请总结这封邮件的要点' });
    try {
      var response = '';
      var msgDiv = null;
      await streamChat([
        { role: 'system', content: 'You are an email assistant. Summarize the following email concisely in Chinese. Reply in the same language as the email.' },
        { role: 'user', content: 'Subject: ' + email.subject + '\nFrom: ' + email.from + '\nBody:\n' + email.body }
      ], function(chunk) {
        if (!msgDiv) { hideTyping(); msgDiv = addMessage('', 'assistant'); }
        response += chunk;
        msgDiv.innerHTML = formatText(response);
        document.getElementById('ai-messages').scrollTop = document.getElementById('ai-messages').scrollHeight;
      });
      chatHistory.push({ role: 'assistant', content: response });
    } catch (err) { hideTyping(); addMessage('总结失败: ' + err.message, 'error'); }
  };

  window.aiReply = async function() {
    var email = getCurrentEmail();
    if (!email) { addMessage('请先打开一封邮件，然后再点击"帮我回复"。', 'error'); return; }
    addMessage('正在生成回复...', 'user');
    showTyping();
    chatHistory.push({ role: 'user', content: '请帮我写一封回复邮件' });
    try {
      var response = '';
      var msgDiv = null;
      await streamChat([
        { role: 'system', content: 'You are an email assistant. Help the user write a reply to the following email. Be professional and concise. Reply in the same language as the original email.' },
        { role: 'user', content: 'Original email:\nSubject: ' + email.subject + '\nFrom: ' + email.from + '\nBody:\n' + email.body + '\n\nPlease draft a reply.' }
      ], function(chunk) {
        if (!msgDiv) { hideTyping(); msgDiv = addMessage('', 'assistant'); }
        response += chunk;
        msgDiv.innerHTML = formatText(response);
        document.getElementById('ai-messages').scrollTop = document.getElementById('ai-messages').scrollHeight;
      });
      chatHistory.push({ role: 'assistant', content: response });
    } catch (err) { hideTyping(); addMessage('生成回复失败: ' + err.message, 'error'); }
  };

  window.aiTranslate = async function() {
    var email = getCurrentEmail();
    if (!email) { addMessage('请先打开一封邮件，然后再点击"翻译"。', 'error'); return; }
    addMessage('正在翻译邮件...', 'user');
    showTyping();
    chatHistory.push({ role: 'user', content: '请翻译这封邮件' });
    try {
      var response = '';
      var msgDiv = null;
      await streamChat([
        { role: 'system', content: 'You are a translator. Translate the following email to Chinese. Keep the original formatting.' },
        { role: 'user', content: 'Subject: ' + email.subject + '\nFrom: ' + email.from + '\nBody:\n' + email.body }
      ], function(chunk) {
        if (!msgDiv) { hideTyping(); msgDiv = addMessage('', 'assistant'); }
        response += chunk;
        msgDiv.innerHTML = formatText(response);
        document.getElementById('ai-messages').scrollTop = document.getElementById('ai-messages').scrollHeight;
      });
      chatHistory.push({ role: 'assistant', content: response });
    } catch (err) { hideTyping(); addMessage('翻译失败: ' + err.message, 'error'); }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createUI);
  } else {
    createUI();
  }
})();

// redirect to mailcow login form
document.addEventListener('DOMContentLoaded', function () {
    var loginForm = document.forms.namedItem("loginForm");
    if (loginForm) {
        window.location.href = '/user';
    }
});

// logout function
function mc_logout() {
    fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "logout=1"
    }).then(() => window.location.href = '/');
}

// Custom SOGo JS
if (typeof CKEDITOR !== 'undefined') {
  CKEDITOR.addCss("body {font-size: 16px !important}");
}
