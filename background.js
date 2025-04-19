// Initialize extension state
let isActive = true;
let dailyLimit = 120; // minutes
let timeSpent = 0;
let websiteDurations = {};
let focusMode = false;
let focusTimer = 0;
let maxFocusTime = 25;
let breakTimer = 0;
let onBreak = false;

// Load saved state when extension starts
chrome.storage.local.get(
  ['isActive', 'dailyLimit', 'timeSpent', 'websiteDurations', 'focusMode', 'maxFocusTime'],
  (result) => {
    isActive = result.isActive ?? true;
    dailyLimit = result.dailyLimit ?? 120;
    timeSpent = result.timeSpent ?? 0;
    websiteDurations = result.websiteDurations ?? {};
    focusMode = result.focusMode ?? false;
    maxFocusTime = result.maxFocusTime ?? 25;
  }
);

// Track tab changes and time spent
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  if (!isActive) return;
  
  const tab = await chrome.tabs.get(activeInfo.tabId);
  const url = new URL(tab.url).hostname;
  
  if (focusMode && !onBreak) {
    focusTimer++;
    if (focusTimer >= maxFocusTime * 60) {
      onBreak = true;
      focusTimer = 0;
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'Focus Session Complete',
        message: 'Great job! Time for a short break.'
      });
    }
  } else if (focusMode && onBreak) {
    breakTimer++;
    if (breakTimer >= 5 * 60) {
      onBreak = false;
      breakTimer = 0;
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'Break Complete',
        message: 'Time to focus again!'
      });
    }
  }

  if (!focusMode) {
    websiteDurations[url] = (websiteDurations[url] || 0) + 1;
    timeSpent++;
    
    if (timeSpent >= dailyLimit) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'Screen Time Limit Reached',
        message: 'You\'ve reached your daily screen time limit!'
      });
    }
    
    // Save updated durations
    chrome.storage.local.set({ websiteDurations, timeSpent });
  }
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'GET_STATE':
      sendResponse({
        isActive,
        dailyLimit,
        timeSpent,
        websiteDurations,
        focusMode,
        focusTimer,
        maxFocusTime,
        breakTimer,
        onBreak
      });
      break;
      
    case 'TOGGLE_ACTIVE':
      isActive = !isActive;
      chrome.storage.local.set({ isActive });
      sendResponse({ isActive });
      break;
      
    case 'SET_DAILY_LIMIT':
      dailyLimit = request.limit;
      chrome.storage.local.set({ dailyLimit });
      sendResponse({ dailyLimit });
      break;
      
    case 'TOGGLE_FOCUS_MODE':
      focusMode = !focusMode;
      if (focusMode) {
        focusTimer = 0;
        onBreak = false;
      }
      chrome.storage.local.set({ focusMode });
      sendResponse({ focusMode });
      break;
      
    case 'SET_FOCUS_TIME':
      maxFocusTime = request.time;
      chrome.storage.local.set({ maxFocusTime });
      sendResponse({ maxFocusTime });
      break;
      
    case 'RESET_TIME':
      timeSpent = 0;
      websiteDurations = {};
      chrome.storage.local.set({ timeSpent, websiteDurations });
      sendResponse({ timeSpent, websiteDurations });
      break;
  }
  return true;
});

// Reset daily stats at midnight
chrome.alarms.create('dailyReset', {
  periodInMinutes: 1440 // 24 hours
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'dailyReset') {
    timeSpent = 0;
    websiteDurations = {};
    chrome.storage.local.set({ timeSpent, websiteDurations });
  }
}); 