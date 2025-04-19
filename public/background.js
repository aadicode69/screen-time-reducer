let isActive = true;
let timeSpent = 0;
let timeLimit = 120; // Default 2 hours in minutes
let websites = [];
let weeklyData = [];
let limitReachedCount = 0;
let startTime = Date.now();
let currentTab = null;

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    isActive: true,
    timeSpent: 0,
    timeLimit: 120,
    websites: [],
    weeklyData: [],
    limitReachedCount: 0
  });
});

chrome.storage.local.get([
  'isActive',
  'timeSpent',
  'timeLimit',
  'websites',
  'weeklyData',
  'limitReachedCount'
], (data) => {
  isActive = data.isActive ?? true;
  timeSpent = data.timeSpent ?? 0;
  timeLimit = data.timeLimit ?? 120;
  websites = data.websites ?? [];
  weeklyData = data.weeklyData ?? [];
  limitReachedCount = data.limitReachedCount ?? 0;
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  if (!isActive) return;
  
  const tab = await chrome.tabs.get(activeInfo.tabId);
  handleTabChange(tab);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!isActive || changeInfo.status !== 'complete') return;
  handleTabChange(tab);
});

function handleTabChange(tab) {
  if (!tab.url || tab.url.startsWith('chrome://')) return;
  
  const now = Date.now();
  if (currentTab) {
    updateTimeSpent(now - startTime);
  }
  
  currentTab = tab;
  startTime = now;
}

function updateTimeSpent(deltaMs) {
  const deltaMinutes = Math.floor(deltaMs / (1000 * 60));
  if (deltaMinutes <= 0) return;
  
  timeSpent += deltaMinutes;
  
  if (currentTab) {
    const url = new URL(currentTab.url);
    const hostname = url.hostname;
    
    const websiteIndex = websites.findIndex(w => w.url === hostname);
    if (websiteIndex >= 0) {
      websites[websiteIndex].timeSpent += deltaMinutes;
    } else {
      websites.push({
        url: hostname,
        timeSpent: deltaMinutes
      });
    }
  }
  
  const today = new Date().toLocaleDateString();
  const todayIndex = weeklyData.findIndex(day => day.date === today);
  
  if (todayIndex >= 0) {
    weeklyData[todayIndex].timeSpent += deltaMinutes;
  } else {
    weeklyData.push({
      date: today,
      timeSpent: deltaMinutes
    });
  }
  
  if (weeklyData.length > 7) {
    weeklyData = weeklyData.slice(-7);
  }
  
  chrome.storage.local.set({ timeSpent, websites, weeklyData });
  
  chrome.runtime.sendMessage({
    type: 'statsUpdate',
    timeSpent,
    websites,
    weeklyData,
    limitReachedCount
  });
  
  if (timeSpent >= timeLimit) {
    limitReachedCount++;
    chrome.storage.local.set({ limitReachedCount });
    
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon48.png',
      title: 'Screen Time Limit Reached',
      message: 'You have reached your daily screen time limit.'
    });
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'getStats':
      sendResponse({
        timeSpent,
        websites,
        weeklyData,
        limitReachedCount
      });
      break;
      
    case 'toggleTracking':
      isActive = message.isActive;
      chrome.storage.local.set({ isActive });
      if (isActive) {
        startTime = Date.now();
      }
      break;
      
    case 'updateTimeLimit':
      timeLimit = message.timeLimit;
      chrome.storage.local.set({ timeLimit });
      break;
  }
});

setInterval(() => {
  const now = new Date();
  if (now.getHours() === 0 && now.getMinutes() === 0) {
    timeSpent = 0;
    websites = [];
    chrome.storage.local.set({ timeSpent, websites });
    chrome.runtime.sendMessage({
      type: 'statsUpdate',
      timeSpent,
      websites,
      weeklyData,
      limitReachedCount
    });
  }
}, 60000); // Check every minute 