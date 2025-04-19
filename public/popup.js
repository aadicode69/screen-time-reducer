// DOM Elements
const statusText = document.getElementById('status-text');
const toggleButton = document.getElementById('toggle-button');
const timeSpentElement = document.getElementById('time-spent');
const timeLimitElement = document.getElementById('time-limit');
const progressElement = document.getElementById('progress');
const websitesList = document.getElementById('websites-list');
const dailyLimitInput = document.getElementById('daily-limit');

// Analytics Elements
const avgDailyTimeElement = document.getElementById('avg-daily-time');
const mostActiveDayElement = document.getElementById('most-active-day');
const weeklyAverageElement = document.getElementById('weekly-average');
const limitReachedElement = document.getElementById('limit-reached');
const allTimeWebsitesElement = document.getElementById('all-time-websites');
const weeklyChartCanvas = document.getElementById('weekly-chart');

// State
let isActive = true;
let timeSpent = 0;
let timeLimit = 120; // Default 2 hours in minutes
let websites = [];
let weeklyData = [];
let limitReachedCount = 0;

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  // Load settings and stats from storage
  const data = await chrome.storage.local.get([
    'isActive',
    'timeSpent',
    'timeLimit',
    'websites',
    'weeklyData',
    'limitReachedCount'
  ]);
  
  isActive = data.isActive ?? true;
  timeSpent = data.timeSpent ?? 0;
  timeLimit = data.timeLimit ?? 120;
  websites = data.websites ?? [];
  weeklyData = data.weeklyData ?? [];
  limitReachedCount = data.limitReachedCount ?? 0;
  
  // Update UI
  updateUI();
  updateAnalytics();
  
  // Set up event listeners
  toggleButton.addEventListener('click', toggleTracking);
  dailyLimitInput.addEventListener('change', updateTimeLimit);
  
  // Set up tab switching
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`${tab.dataset.tab}-tab`).classList.add('active');
    });
  });
  
  // Request updated stats from background script
  chrome.runtime.sendMessage({ type: 'getStats' }, (response) => {
    if (response) {
      timeSpent = response.timeSpent;
      websites = response.websites;
      weeklyData = response.weeklyData;
      limitReachedCount = response.limitReachedCount;
      updateUI();
      updateAnalytics();
    }
  });
});

// Update UI elements
function updateUI() {
  // Update status
  statusText.textContent = isActive ? 'Active' : 'Paused';
  statusText.parentElement.className = `status-indicator ${isActive ? 'active' : 'inactive'}`;
  toggleButton.textContent = isActive ? 'Pause' : 'Resume';
  
  // Update time displays
  timeSpentElement.textContent = formatTime(timeSpent);
  timeLimitElement.textContent = formatTime(timeLimit);
  
  // Update progress bar
  const progress = Math.min((timeSpent / timeLimit) * 100, 100);
  progressElement.style.width = `${progress}%`;
  
  // Update websites list
  updateWebsitesList();
  
  // Update settings
  dailyLimitInput.value = timeLimit;
}

// Update analytics
function updateAnalytics() {
  // Calculate average daily time
  const avgDailyTime = weeklyData.reduce((sum, day) => sum + day.timeSpent, 0) / weeklyData.length;
  avgDailyTimeElement.textContent = formatTime(avgDailyTime);
  
  // Find most active day
  const mostActiveDay = weeklyData.reduce((max, day) => 
    day.timeSpent > max.timeSpent ? day : max
  , { timeSpent: 0, date: '-' });
  mostActiveDayElement.textContent = mostActiveDay.date;
  
  // Calculate weekly average
  const weeklyAverage = weeklyData.reduce((sum, day) => sum + day.timeSpent, 0) / 7;
  weeklyAverageElement.textContent = formatTime(weeklyAverage);
  
  // Update limit reached count
  limitReachedElement.textContent = `${limitReachedCount} times`;
  
  // Update weekly chart
  updateWeeklyChart();
  
  // Update all-time websites
  updateAllTimeWebsites();
}

// Update weekly chart
function updateWeeklyChart() {
  const ctx = weeklyChartCanvas.getContext('2d');
  
  // Destroy existing chart if it exists
  if (window.weeklyChart) {
    window.weeklyChart.destroy();
  }
  
  // Create new chart
  window.weeklyChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: weeklyData.map(day => day.date),
      datasets: [{
        label: 'Time Spent (minutes)',
        data: weeklyData.map(day => day.timeSpent),
        backgroundColor: '#4a90e2',
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Minutes'
          }
        }
      }
    }
  });
}

// Update all-time websites
function updateAllTimeWebsites() {
  allTimeWebsitesElement.innerHTML = '';
  
  // Sort websites by total time spent
  const sortedWebsites = [...websites].sort((a, b) => b.timeSpent - a.timeSpent);
  
  // Display top 10 websites
  sortedWebsites.slice(0, 10).forEach(website => {
    const websiteItem = document.createElement('div');
    websiteItem.className = 'website-item';
    
    const websiteName = document.createElement('div');
    websiteName.className = 'website-name';
    
    const websiteIcon = document.createElement('img');
    websiteIcon.className = 'website-icon';
    websiteIcon.src = `https://www.google.com/s2/favicons?domain=${website.url}`;
    websiteIcon.width = 16;
    websiteIcon.height = 16;
    
    const websiteTitle = document.createElement('span');
    websiteTitle.textContent = new URL(website.url).hostname;
    
    const websiteTime = document.createElement('div');
    websiteTime.className = 'website-time';
    websiteTime.textContent = formatTime(website.timeSpent);
    
    websiteName.appendChild(websiteIcon);
    websiteName.appendChild(websiteTitle);
    websiteItem.appendChild(websiteName);
    websiteItem.appendChild(websiteTime);
    allTimeWebsitesElement.appendChild(websiteItem);
  });
}

// Format time in minutes to hours and minutes
function formatTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  return `${hours}h ${mins}m`;
}

// Toggle tracking
function toggleTracking() {
  isActive = !isActive;
  chrome.storage.local.set({ isActive });
  chrome.runtime.sendMessage({ type: 'toggleTracking', isActive });
  updateUI();
}

// Update time limit
function updateTimeLimit() {
  const newLimit = parseInt(dailyLimitInput.value);
  if (newLimit > 0 && newLimit <= 1440) {
    timeLimit = newLimit;
    chrome.storage.local.set({ timeLimit });
    chrome.runtime.sendMessage({ type: 'updateTimeLimit', timeLimit });
    updateUI();
  }
}

// Update websites list
function updateWebsitesList() {
  websitesList.innerHTML = '';
  
  // Sort websites by time spent
  const sortedWebsites = [...websites].sort((a, b) => b.timeSpent - a.timeSpent);
  
  // Display top 5 websites
  sortedWebsites.slice(0, 5).forEach(website => {
    const websiteItem = document.createElement('div');
    websiteItem.className = 'website-item';
    
    const websiteName = document.createElement('div');
    websiteName.className = 'website-name';
    
    const websiteIcon = document.createElement('img');
    websiteIcon.className = 'website-icon';
    websiteIcon.src = `https://www.google.com/s2/favicons?domain=${website.url}`;
    websiteIcon.width = 16;
    websiteIcon.height = 16;
    
    const websiteTitle = document.createElement('span');
    websiteTitle.textContent = new URL(website.url).hostname;
    
    const websiteTime = document.createElement('div');
    websiteTime.className = 'website-time';
    websiteTime.textContent = formatTime(website.timeSpent);
    
    websiteName.appendChild(websiteIcon);
    websiteName.appendChild(websiteTitle);
    websiteItem.appendChild(websiteName);
    websiteItem.appendChild(websiteTime);
    websitesList.appendChild(websiteItem);
  });
}

// Listen for updates from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'statsUpdate') {
    timeSpent = message.timeSpent;
    websites = message.websites;
    weeklyData = message.weeklyData;
    limitReachedCount = message.limitReachedCount;
    updateUI();
    updateAnalytics();
  }
}); 