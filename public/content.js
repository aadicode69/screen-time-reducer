chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'CHECK_LIMIT') {
    chrome.storage.local.get(['timeSpent', 'dailyLimit', 'isActive'], (data) => {
      if (data.isActive && data.timeSpent >= data.dailyLimit) {
        showWarning();
      }
    });
  }
});

function showWarning() {
  const overlay = document.createElement('div');
  overlay.id = 'screen-time-warning';
  overlay.innerHTML = `
    <div class="warning-content">
      <h2>Daily Screen Time Limit Reached</h2>
      <p>You've reached your daily screen time limit. Consider taking a break!</p>
      <button id="dismiss-warning">Continue Anyway</button>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    #screen-time-warning {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 999999;
    }

    .warning-content {
      background-color: white;
      padding: 2rem;
      border-radius: 8px;
      text-align: center;
      max-width: 400px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .warning-content h2 {
      color: #e74c3c;
      margin-bottom: 1rem;
    }

    .warning-content p {
      margin-bottom: 1.5rem;
      color: #333;
    }

    #dismiss-warning {
      background-color: #e74c3c;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }

    #dismiss-warning:hover {
      background-color: #c0392b;
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(overlay);
  document.getElementById('dismiss-warning').addEventListener('click', () => {
    overlay.remove();
  });
}

chrome.runtime.sendMessage({ type: 'CHECK_LIMIT' });

document.addEventListener('visibilitychange', () => {
  chrome.runtime.sendMessage({
    type: 'visibilityChange',
    isVisible: document.visibilityState === 'visible'
  });
});

let lastActivityTime = Date.now();
const ACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

function updateActivity() {
  lastActivityTime = Date.now();
}

document.addEventListener('mousemove', updateActivity);
document.addEventListener('keydown', updateActivity);
document.addEventListener('click', updateActivity);
document.addEventListener('scroll', updateActivity);

setInterval(() => {
  const inactiveTime = Date.now() - lastActivityTime;
  if (inactiveTime >= ACTIVITY_TIMEOUT) {
    chrome.runtime.sendMessage({
      type: 'userInactive',
      inactiveTime
    });
  }
}, 60000); // Check every minute 