// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_PAGE_INFO') {
    sendResponse({
      url: window.location.href,
      title: document.title,
      hostname: window.location.hostname
    });
  }
  return true;
});

// Send page load event to background script
chrome.runtime.sendMessage({
  type: 'PAGE_LOADED',
  data: {
    url: window.location.href,
    title: document.title,
    hostname: window.location.hostname
  }
});

// Handle focus mode blocking
let isBlocked = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'SET_BLOCKED') {
    isBlocked = request.blocked;
    if (isBlocked) {
      // Create and show blocking overlay
      const overlay = document.createElement('div');
      overlay.id = 'screentime-blocker-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        z-index: 999999;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: white;
        font-family: Arial, sans-serif;
      `;
      
      overlay.innerHTML = `
        <h1 style="font-size: 24px; margin-bottom: 20px;">Screen Time Limit Reached</h1>
        <p style="font-size: 16px; margin-bottom: 30px;">You've reached your daily screen time limit.</p>
        <button id="screentime-continue-btn" style="
          padding: 10px 20px;
          background: #4F46E5;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
        ">Continue Anyway</button>
      `;
      
      document.body.appendChild(overlay);
      
      document.getElementById('screentime-continue-btn').addEventListener('click', () => {
        overlay.remove();
        chrome.runtime.sendMessage({ type: 'CONTINUE_ANYWAY' });
      });
    } else {
      // Remove blocking overlay if it exists
      const overlay = document.getElementById('screentime-blocker-overlay');
      if (overlay) {
        overlay.remove();
      }
    }
  }
  return true;
});

// Handle warning message
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'SHOW_WARNING') {
    showWarning();
  }
  return true;
});

function showWarning() {
  const overlay = document.createElement('div');
  overlay.id = 'screentime-warning-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999999;
    display: flex;
    justify-content: center;
    align-items: center;
  `;

  const warningBox = document.createElement('div');
  warningBox.style.cssText = `
    background: white;
    padding: 2rem;
    border-radius: 12px;
    max-width: 400px;
    text-align: center;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  `;

  warningBox.innerHTML = `
    <h2 style="font-size: 1.5rem; font-weight: 600; color: #1a1a1a; margin-bottom: 1rem;">
      Site Blocked
    </h2>
    <p style="color: #4a5568; margin-bottom: 1.5rem;">
      This site is currently blocked. Please try again later or adjust your settings.
    </p>
    <button id="close-warning" style="
      background: #4f46e5;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      font-weight: 500;
      cursor: pointer;
    ">
      Close
    </button>
  `;

  overlay.appendChild(warningBox);
  document.body.appendChild(overlay);

  document.getElementById('close-warning').onclick = () => {
    overlay.remove();
  };
} 