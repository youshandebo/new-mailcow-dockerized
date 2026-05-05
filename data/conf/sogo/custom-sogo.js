// Modern SOGo Theme + AI Assistant
(function() {
  'use strict';

  var css = `
    /* ===== Modern SOGo Theme ===== */

    :root {
      --mc-primary: #2563eb;
      --mc-primary-hover: #1d4ed8;
      --mc-primary-light: #eef2ff;
      --mc-bg: #f8fafc;
      --mc-surface: #ffffff;
      --mc-text: #1e293b;
      --mc-text-secondary: #64748b;
      --mc-text-muted: #94a3b8;
      --mc-border: #e2e8f0;
      --mc-border-hover: #cbd5e1;
      --mc-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
      --mc-shadow-md: 0 4px 6px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.06);
      --mc-shadow-lg: 0 10px 15px rgba(0,0,0,0.06), 0 4px 6px rgba(0,0,0,0.04);
      --mc-radius: 8px;
      --mc-radius-lg: 12px;
      --mc-transition: 0.2s ease;
    }

    /* --- Global --- */
    body, body.ng-scope, main {
      font-family: 'Noto Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif !important;
      color: var(--mc-text) !important;
      background: var(--mc-bg) !important;
    }

    /* --- Toolbar --- */
    md-toolbar, md-toolbar.md-default-theme, md-toolbar.md-hue-2 {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
      color: #fff !important;
      box-shadow: 0 2px 12px rgba(37,99,235,0.2) !important;
      z-index: 100 !important;
      transition: box-shadow 0.3s ease !important;
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
      border-radius: var(--mc-radius) !important;
      transition: all var(--mc-transition) !important;
    }
    md-toolbar a:hover, md-toolbar button:hover, md-toolbar .md-button:hover {
      color: #fff !important;
      background: rgba(255,255,255,0.15) !important;
    }
    md-toolbar md-icon {
      color: rgba(255,255,255,0.9) !important;
    }
    md-toolbar .md-toolbar-tools .md-button {
      margin: 0 2px !important;
      padding: 6px 12px !important;
      font-size: 13px !important;
    }

    /* Hide default brand */
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
      letter-spacing: 0.5px !important;
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
    md-toolbar .mc-qq-brand span { font-size: 20px !important; }

    /* --- Sidebar --- */
    md-sidenav, md-sidenav.md-sidenav-left {
      background: var(--mc-surface) !important;
      border-right: 1px solid var(--mc-border) !important;
    }
    md-sidenav md-list-item, md-sidenav md-list-item .md-button {
      color: var(--mc-text) !important;
      font-size: 13px !important;
      min-height: 38px !important;
      height: 38px !important;
      line-height: 38px !important;
      border-radius: var(--mc-radius) !important;
      transition: all var(--mc-transition) !important;
    }
    md-sidenav md-list-item:hover, md-sidenav md-list-item .md-button:hover {
      background: var(--mc-primary-light) !important;
      color: var(--mc-primary) !important;
    }
    md-sidenav md-list-item.md-active .md-button,
    md-sidenav md-list-item.selected .md-button,
    md-sidenav md-list-item .md-button.selected,
    md-sidenav md-list-item .md-button.md-focused {
      background: linear-gradient(135deg, #2563eb, #1d4ed8) !important;
      color: #fff !important;
      font-weight: 500 !important;
      box-shadow: 0 2px 8px rgba(37,99,235,0.3) !important;
    }
    md-sidenav md-list-item .badge,
    md-sidenav md-list-item .badgeContainer {
      background: #ef4444 !important;
      color: #fff !important;
      font-size: 11px !important;
      padding: 2px 7px !important;
      border-radius: 10px !important;
      min-width: 18px !important;
      text-align: center !important;
      font-weight: 600 !important;
      animation: badgePulse 2s ease infinite;
    }
    @keyframes badgePulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    md-sidenav md-list-item md-icon {
      font-size: 18px !important;
      width: 18px !important;
      height: 18px !important;
      margin-right: 8px !important;
      color: var(--mc-primary) !important;
    }
    md-sidenav md-list-item.md-active md-icon,
    md-sidenav md-list-item.selected md-icon {
      color: #fff !important;
    }
    md-sidenav md-divider {
      margin: 4px 12px !important;
      border-color: var(--mc-border) !important;
    }
    md-sidenav .folder-name, md-sidenav .panel-heading {
      background: var(--mc-bg) !important;
      border-bottom: 1px solid var(--mc-border) !important;
      padding: 12px 16px !important;
      font-size: 14px !important;
      font-weight: 600 !important;
      color: var(--mc-text) !important;
    }

    /* --- Mail List --- */
    md-content {
      background: var(--mc-surface) !important;
    }
    md-content md-list-item,
    md-content md-list-item.md-no-proxy {
      border-bottom: 1px solid #f1f5f9 !important;
      padding: 12px 16px !important;
      min-height: 64px !important;
      transition: all var(--mc-transition) !important;
    }
    md-content md-list-item:hover {
      background: var(--mc-primary-light) !important;
    }
    md-content md-list-item.md-active,
    md-content md-list-item.selected,
    md-content md-list-item.active {
      background: #e0e7ff !important;
      border-left: 3px solid var(--mc-primary) !important;
      padding-left: 13px !important;
    }
    md-content md-list-item.unread,
    md-content md-list-item .unread {
      font-weight: 600 !important;
    }
    md-content md-list-item .subject {
      color: var(--mc-text) !important;
      font-size: 14px !important;
      font-weight: 500 !important;
    }
    md-content md-list-item .from {
      color: var(--mc-text) !important;
      font-size: 13px !important;
    }
    md-content md-list-item .preview,
    md-content md-list-item .snippet {
      color: var(--mc-text-muted) !important;
      font-size: 12px !important;
      margin-top: 2px !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      white-space: nowrap !important;
    }
    md-content md-list-item .date {
      color: var(--mc-text-muted) !important;
      font-size: 12px !important;
    }
    md-content md-list-item .badge {
      background: #ef4444 !important;
      color: #fff !important;
      font-size: 11px !important;
      padding: 2px 7px !important;
      border-radius: 10px !important;
      font-weight: 600 !important;
    }

    /* --- Buttons --- */
    .md-button.md-primary, md-button.md-primary {
      background: linear-gradient(135deg, #2563eb, #1d4ed8) !important;
      color: #fff !important;
      border-radius: var(--mc-radius) !important;
      font-size: 13px !important;
      padding: 6px 16px !important;
      box-shadow: 0 2px 8px rgba(37,99,235,0.25) !important;
      transition: all var(--mc-transition) !important;
    }
    .md-button.md-primary:hover, md-button.md-primary:hover {
      background: linear-gradient(135deg, #1d4ed8, #1e40af) !important;
      box-shadow: 0 4px 12px rgba(37,99,235,0.35) !important;
      transform: translateY(-1px) !important;
    }
    .md-button.md-raised, md-button.md-raised {
      border-radius: var(--mc-radius) !important;
      box-shadow: var(--mc-shadow) !important;
      transition: all var(--mc-transition) !important;
    }
    .md-button.md-raised:hover, md-button.md-raised:hover {
      box-shadow: var(--mc-shadow-md) !important;
      transform: translateY(-1px) !important;
    }
    .md-button:not(.md-raised):not(.md-primary) {
      border-radius: var(--mc-radius) !important;
      transition: all var(--mc-transition) !important;
    }
    .md-button:not(.md-raised):not(.md-primary):hover {
      background: rgba(37,99,235,0.08) !important;
    }
    .md-button.md-fab, md-fab-trigger .md-button {
      background: linear-gradient(135deg, #2563eb, #1d4ed8) !important;
      box-shadow: 0 4px 16px rgba(37,99,235,0.4) !important;
      transition: all var(--mc-transition) !important;
    }
    .md-button.md-fab:hover, md-fab-trigger .md-button:hover {
      box-shadow: 0 6px 20px rgba(37,99,235,0.5) !important;
      transform: translateY(-2px) !important;
    }

    /* --- Links --- */
    a { color: var(--mc-primary) !important; }
    a:hover { color: var(--mc-primary-hover) !important; text-decoration: underline !important; }

    /* --- Input Fields --- */
    md-input-container input, md-input-container textarea,
    md-input-container .md-input {
      border-color: var(--mc-border) !important;
      border-radius: var(--mc-radius) !important;
      padding: 8px 12px !important;
      font-size: 14px !important;
      transition: all var(--mc-transition) !important;
    }
    md-input-container input:focus, md-input-container textarea:focus,
    md-input-container .md-input:focus {
      border-color: var(--mc-primary) !important;
      box-shadow: 0 0 0 3px rgba(37,99,235,0.1) !important;
    }

    /* --- Tabs --- */
    md-tabs md-tab-item, md-tab-item {
      color: var(--mc-text-secondary) !important;
      font-size: 14px !important;
      transition: all var(--mc-transition) !important;
    }
    md-tabs md-tab-item.md-active, md-tab-item.md-active {
      color: var(--mc-primary) !important;
      font-weight: 600 !important;
    }
    md-ink-bar {
      background: var(--mc-primary) !important;
      height: 3px !important;
      border-radius: 2px !important;
    }

    /* --- Checkbox / Switch --- */
    md-checkbox.md-checked .md-icon {
      background: var(--mc-primary) !important;
      border-color: var(--mc-primary) !important;
    }
    md-switch.md-checked .md-thumb { background: var(--mc-primary) !important; }
    md-switch.md-checked .md-bar { background: rgba(37,99,235,0.4) !important; }

    /* --- Cards, Dialogs --- */
    md-card {
      border-radius: var(--mc-radius-lg) !important;
      box-shadow: var(--mc-shadow) !important;
      border: 1px solid var(--mc-border) !important;
      transition: all 0.25s ease !important;
    }
    md-card:hover {
      box-shadow: var(--mc-shadow-md) !important;
    }
    md-dialog {
      border-radius: 16px !important;
      box-shadow: 0 20px 40px rgba(0,0,0,0.12) !important;
      overflow: hidden !important;
    }
    md-toast {
      background: #1e293b !important;
      border-radius: var(--mc-radius) !important;
    }
    md-divider {
      border-color: var(--mc-border) !important;
    }

    /* --- Scrollbar --- */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

    /* --- General UI --- */
    .contact-image, .avatar {
      border-radius: 50% !important;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1) !important;
    }
    md-select-menu md-content, md-menu-content {
      border-radius: var(--mc-radius-lg) !important;
      box-shadow: var(--mc-shadow-lg) !important;
      border: 1px solid var(--mc-border) !important;
      padding: 4px !important;
    }
    md-option {
      font-size: 13px !important;
      min-height: 36px !important;
      border-radius: 6px !important;
      transition: all var(--mc-transition) !important;
    }
    md-option:hover, md-option:focus {
      background: var(--mc-primary-light) !important;
    }
    table { border-collapse: separate !important; border-spacing: 0 !important; }
    table th {
      background: var(--mc-bg) !important;
      font-weight: 600 !important;
      font-size: 13px !important;
      color: var(--mc-text-secondary) !important;
      border-bottom: 2px solid var(--mc-border) !important;
      padding: 12px 14px !important;
      text-transform: uppercase !important;
      letter-spacing: 0.3px !important;
    }
    table td {
      border-bottom: 1px solid #f1f5f9 !important;
      padding: 12px 14px !important;
      font-size: 13px !important;
    }
    table tr:hover td { background: var(--mc-primary-light) !important; }
    md-tooltip {
      font-size: 12px !important;
      background: #1e293b !important;
      border-radius: 6px !important;
      padding: 4px 10px !important;
    }

    /* ===== AI Assistant Panel ===== */
    #ai-assistant-btn {
      position: fixed; bottom: 24px; right: 24px; z-index: 9999;
      width: 56px; height: 56px; border-radius: 50%;
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      color: #fff; border: none; cursor: pointer;
      box-shadow: 0 4px 16px rgba(37,99,235,0.4);
      display: flex; align-items: center; justify-content: center;
      font-size: 24px; transition: all 0.25s ease;
    }
    #ai-assistant-btn:hover {
      transform: scale(1.1) translateY(-2px);
      box-shadow: 0 8px 24px rgba(37,99,235,0.5);
    }
    #ai-panel {
      position: fixed; bottom: 90px; right: 24px; z-index: 9998;
      width: 400px; height: 560px;
      background: #fff; border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.15);
      display: none; flex-direction: column;
      overflow: hidden; font-family: 'Noto Sans', sans-serif;
      border: 1px solid #e2e8f0;
      animation: panelSlideUp 0.3s ease;
    }
    @keyframes panelSlideUp {
      from { opacity: 0; transform: translateY(20px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    #ai-panel.open { display: flex; }
    #ai-panel-header {
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      color: #fff; padding: 18px 22px;
      display: flex; align-items: center; justify-content: space-between;
    }
    #ai-panel-header h3 { margin: 0; font-size: 16px; font-weight: 600; }
    #ai-panel-header button {
      background: rgba(255,255,255,0.2); border: none; color: #fff;
      width: 30px; height: 30px; border-radius: 50%; cursor: pointer;
      font-size: 16px; display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
    }
    #ai-panel-header button:hover { background: rgba(255,255,255,0.3); }
    #ai-panel-actions {
      padding: 12px 18px; border-bottom: 1px solid #f1f5f9;
      display: flex; gap: 8px; flex-wrap: wrap;
    }
    #ai-panel-actions button {
      padding: 6px 14px; border-radius: 20px; border: 1px solid #e2e8f0;
      background: #f8fafc; color: #475569; font-size: 12px; cursor: pointer;
      transition: all 0.2s; font-weight: 500;
    }
    #ai-panel-actions button:hover { background: #eef2ff; border-color: #2563eb; color: #2563eb; }
    #ai-messages {
      flex: 1; overflow-y: auto; padding: 18px;
      display: flex; flex-direction: column; gap: 12px;
    }
    .ai-msg {
      max-width: 85%; padding: 12px 16px; border-radius: 14px;
      font-size: 14px; line-height: 1.5; word-break: break-word;
      animation: msgFadeIn 0.3s ease;
    }
    @keyframes msgFadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .ai-msg.user {
      align-self: flex-end;
      background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #fff;
      border-bottom-right-radius: 4px;
    }
    .ai-msg.assistant {
      align-self: flex-start;
      background: #f1f5f9; color: #1e293b;
      border-bottom-left-radius: 4px;
    }
    .ai-msg.error {
      align-self: center;
      background: #fef2f2; color: #991b1b;
      font-size: 13px;
    }
    .ai-typing {
      align-self: flex-start; padding: 12px 16px;
      background: #f1f5f9; border-radius: 14px;
      font-size: 14px; color: #94a3b8;
    }
    .ai-typing span { animation: ai-dot 1.4s infinite; }
    .ai-typing span:nth-child(2) { animation-delay: 0.2s; }
    .ai-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes ai-dot {
      0%, 80%, 100% { opacity: 0.3; }
      40% { opacity: 1; }
    }
    #ai-input-area {
      padding: 14px 18px; border-top: 1px solid #f1f5f9;
      display: flex; gap: 10px; align-items: flex-end;
    }
    #ai-input {
      flex: 1; border: 1.5px solid #e2e8f0; border-radius: 20px;
      padding: 10px 16px; font-size: 14px; resize: none;
      outline: none; max-height: 80px; min-height: 40px;
      font-family: inherit; line-height: 1.4;
      transition: all 0.2s;
    }
    #ai-input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
    #ai-send {
      width: 40px; height: 40px; border-radius: 50%;
      background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #fff; border: none;
      cursor: pointer; display: flex; align-items: center;
      justify-content: center; font-size: 18px;
      transition: all 0.25s; flex-shrink: 0;
    }
    #ai-send:hover { background: linear-gradient(135deg, #1d4ed8, #1e40af); transform: scale(1.05); }
    #ai-send:disabled { background: #cbd5e1; cursor: not-allowed; transform: none; }
    .ai-msg pre {
      background: #f1f5f9; padding: 10px; border-radius: 8px;
      overflow-x: auto; font-size: 13px; margin: 8px 0;
    }
    .ai-msg code {
      background: #f1f5f9; padding: 2px 6px; border-radius: 4px;
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
  console.log('[Modern Theme] CSS injected');
})();

// Inject brand into toolbar
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

// AI Assistant
(function() {
  'use strict';

  var AI_BASE = '/api/ai-proxy.php';
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
    panel.innerHTML = '<div id="ai-panel-header">' +
      '<h3>&#x1F916; AI 邮件助手</h3>' +
      '<button onclick="document.getElementById(\'ai-panel\').classList.remove(\'open\')">&times;</button>' +
      '</div>' +
      '<div id="ai-panel-actions">' +
      '<button onclick="aiSummarize()">&#x1F4DD; 总结当前邮件</button>' +
      '<button onclick="aiReply()">&#x1F4AC; 帮我回复</button>' +
      '<button onclick="aiTranslate()">&#x1F310; 翻译</button>' +
      '</div>' +
      '<div id="ai-messages">' +
      '<div class="ai-msg assistant">你好！我是 AI 邮件助手。你可以问我任何问题，或者点击上方按钮对当前邮件进行操作。</div>' +
      '</div>' +
      '<div id="ai-input-area">' +
      '<textarea id="ai-input" placeholder="输入消息..." rows="1"></textarea>' +
      '<button id="ai-send" onclick="aiSendMessage()">&#x27A4;</button>' +
      '</div>';
    document.body.appendChild(panel);

    var input = document.getElementById('ai-input');
    input.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 80) + 'px';
    });
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); aiSendMessage(); }
    });
  }

  function togglePanel() {
    var panel = document.getElementById('ai-panel');
    isOpen = !isOpen;
    if (isOpen) { panel.classList.add('open'); document.getElementById('ai-input').focus(); }
    else { panel.classList.remove('open'); }
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
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
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
    } catch (err) { hideTyping(); addMessage('错误: ' + err.message, 'error'); }
    document.getElementById('ai-send').disabled = false;
  };

  window.aiSummarize = async function() {
    var email = getCurrentEmail();
    if (!email) { addMessage('请先打开一封邮件，然后再点击"总结当前邮件"。', 'error'); return; }
    addMessage('正在总结邮件...', 'user');
    showTyping();
    try {
      var response = '';
      var msgDiv = null;
      await streamChat([
        { role: 'system', content: 'You are an email assistant. Summarize the following email concisely in Chinese.' },
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
    try {
      var response = '';
      var msgDiv = null;
      await streamChat([
        { role: 'system', content: 'You are an email assistant. Help the user write a reply. Be professional and concise. Reply in the same language as the original email.' },
        { role: 'user', content: 'Original email:\nSubject: ' + email.subject + '\nFrom: ' + email.from + '\nBody:\n' + email.body }
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

// Login redirect
document.addEventListener('DOMContentLoaded', function() {
  var loginForm = document.forms.namedItem('loginForm');
  if (loginForm) { window.location.href = '/user'; }
});

// Logout
function mc_logout() {
  fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'logout=1' })
    .then(function() { window.location.href = '/'; });
}

if (typeof CKEDITOR !== 'undefined') {
  CKEDITOR.addCss('body {font-size: 16px !important}');
}
