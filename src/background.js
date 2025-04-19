// Store blocked websites
let blockedSites = [];

// Listen for messages from content script and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_BLOCKED_SITES') {
    // Return list of blocked sites
    sendResponse({ sites: blockedSites });
  } else if (message.type === 'ADD_BLOCKED_SITE') {
    // Add new site to blocked list
    if (!blockedSites.includes(message.site)) {
      blockedSites.push(message.site);
    }
    sendResponse({ success: true });
  } else if (message.type === 'REMOVE_BLOCKED_SITE') {
    // Remove site from blocked list
    blockedSites = blockedSites.filter(site => site !== message.site);
    sendResponse({ success: true });
  }
});

// Check if current site is blocked
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId === 0) { // Only check main frame
    const url = new URL(details.url);
    const domain = url.hostname;
    
    if (blockedSites.includes(domain)) {
      // Show warning instead of auth popup
      chrome.tabs.sendMessage(details.tabId, { type: 'SHOW_WARNING' });
    }
  }
}); 