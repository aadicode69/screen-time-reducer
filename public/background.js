// Initialize default settings
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    dailyLimit: 120, // 2 hours in minutes
    timeSpent: 0,
    isActive: true,
    websites: [],
    lastReset: new Date().toDateString()
  });
});

// Track active tab time
let activeTabStartTime = Date.now();
let currentTabId = null;

// Update time spent every minute
setInterval(updateTimeSpent, 60000);

// Listen for tab changes
chrome.tabs.onActivated.addListener((activeInfo) => {
  if (currentTabId) {
    updateTimeSpent();
  }
  currentTabId = activeInfo.tabId;
  activeTabStartTime = Date.now();
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabId === currentTabId && changeInfo.status === 'complete') {
    activeTabStartTime = Date.now();
  }
});

// Update time spent and check limits
async function updateTimeSpent() {
  const data = await chrome.storage.local.get(['timeSpent', 'dailyLimit', 'isActive', 'websites', 'lastReset']);
  
  // Reset daily counter if it's a new day
  const today = new Date().toDateString();
  if (data.lastReset !== today) {
    chrome.storage.local.set({
      timeSpent: 0,
      websites: [],
      lastReset: today
    });
    return;
  }

  if (!data.isActive) return;

  const timeSpent = data.timeSpent || 0;
  const timeElapsed = Math.floor((Date.now() - activeTabStartTime) / 60000); // Convert to minutes
  
  if (timeElapsed > 0) {
    // Update total time spent
    const newTimeSpent = timeSpent + timeElapsed;
    chrome.storage.local.set({ timeSpent: newTimeSpent });

    // Update website-specific time
    const currentTab = await chrome.tabs.get(currentTabId);
    if (currentTab.url) {
      const domain = new URL(currentTab.url).hostname;
      const websites = data.websites || [];
      const websiteIndex = websites.findIndex(site => site.domain === domain);
      
      if (websiteIndex === -1) {
        websites.push({ domain, time: timeElapsed });
      } else {
        websites[websiteIndex].time += timeElapsed;
      }
      
      chrome.storage.local.set({ websites });
    }

    // Check if daily limit is reached
    if (newTimeSpent >= data.dailyLimit) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'Daily Limit Reached',
        message: 'You have reached your daily screen time limit. Take a break!'
      });
    }
  }
  
  activeTabStartTime = Date.now();
}

// Listen for alarm to reset daily counter
chrome.alarms.create('dailyReset', {
  periodInMinutes: 1440 // 24 hours
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'dailyReset') {
    chrome.storage.local.set({
      timeSpent: 0,
      websites: [],
      lastReset: new Date().toDateString()
    });
  }
}); 