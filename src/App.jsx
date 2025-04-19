import React, { useState, useEffect } from 'react';

// Check if we're running in a Chrome extension context
const isExtensionContext = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;

function App() {
  const [dailyLimit, setDailyLimit] = useState(120); // Default 2 hours in minutes
  const [timeSpent, setTimeSpent] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [websites, setWebsites] = useState([]);
  const [isExtension, setIsExtension] = useState(isExtensionContext);
  const [showHomepage, setShowHomepage] = useState(!isExtensionContext);

  useEffect(() => {
    if (isExtension) {
      // Load saved data from chrome.storage
      chrome.storage.local.get(['dailyLimit', 'timeSpent', 'isActive', 'websites'], (result) => {
        if (result.dailyLimit) setDailyLimit(result.dailyLimit);
        if (result.timeSpent) setTimeSpent(result.timeSpent);
        if (result.isActive !== undefined) setIsActive(result.isActive);
        if (result.websites) setWebsites(result.websites);
      });
    } else {
      // For development/testing, use localStorage instead
      const savedData = localStorage.getItem('screenTimeData');
      if (savedData) {
        const data = JSON.parse(savedData);
        if (data.dailyLimit) setDailyLimit(data.dailyLimit);
        if (data.timeSpent) setTimeSpent(data.timeSpent);
        if (data.isActive !== undefined) setIsActive(data.isActive);
        if (data.websites) setWebsites(data.websites);
      }
    }
  }, [isExtension]);

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value);
    setDailyLimit(newLimit);
    
    if (isExtension) {
      chrome.storage.local.set({ dailyLimit: newLimit });
    } else {
      // Save to localStorage for development
      const savedData = localStorage.getItem('screenTimeData') || '{}';
      const data = JSON.parse(savedData);
      data.dailyLimit = newLimit;
      localStorage.setItem('screenTimeData', JSON.stringify(data));
    }
  };

  const toggleExtension = () => {
    const newState = !isActive;
    setIsActive(newState);
    
    if (isExtension) {
      chrome.storage.local.set({ isActive: newState });
    } else {
      // Save to localStorage for development
      const savedData = localStorage.getItem('screenTimeData') || '{}';
      const data = JSON.parse(savedData);
      data.isActive = newState;
      localStorage.setItem('screenTimeData', JSON.stringify(data));
    }
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const toggleView = () => {
    setShowHomepage(!showHomepage);
  };

  // Homepage component
  const Homepage = () => (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <header className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mb-2">Screen Time Reducer</h1>
            <p className="text-lg text-gray-600">Take control of your digital wellbeing</p>
          </div>
          <div className="flex space-x-4">
            <button 
              onClick={toggleView}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Open Dashboard
            </button>
            <a 
              href="https://chrome.google.com/webstore/detail/screen-time-reducer/your-extension-id" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Install Extension
            </a>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">Track Your Screen Time</h2>
            <p className="text-gray-600 mb-4">
              Monitor how much time you spend on different websites and apps. Get insights into your browsing habits.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Real-time tracking of your browsing activity
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Detailed statistics and reports
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Website-specific time tracking
              </li>
            </ul>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">Set Healthy Limits</h2>
            <p className="text-gray-600 mb-4">
              Define daily time limits for your browsing sessions and receive gentle reminders when you approach them.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Customizable daily time limits
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Smart notifications and warnings
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Pause/resume tracking as needed
              </li>
            </ul>
          </div>
        </section>

        <section className="bg-white p-8 rounded-xl shadow-lg mb-16">
          <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-800">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Install the Extension</h3>
              <p className="text-gray-600">Add Screen Time Reducer to your Chrome browser with just one click.</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-800">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Set Your Limits</h3>
              <p className="text-gray-600">Define how much time you want to spend browsing each day.</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-800">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Track & Improve</h3>
              <p className="text-gray-600">Monitor your progress and develop healthier browsing habits.</p>
            </div>
          </div>
        </section>

        <section className="bg-blue-50 p-8 rounded-xl shadow-lg">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">Ready to Take Control?</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join thousands of users who have improved their digital wellbeing with Screen Time Reducer.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button 
                onClick={toggleView}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Dashboard
              </button>
              <a 
                href="https://chrome.google.com/webstore/detail/screen-time-reducer/your-extension-id" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Install Extension
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );

  // Dashboard component
  const Dashboard = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <header className="bg-gradient-to-r from-blue-600 to-blue-800 p-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-4 md:mb-0">Screen Time Reducer</h1>
              <div className="flex items-center space-x-4">
                <div className={`px-4 py-2 rounded-full text-sm font-medium ${isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                  {isActive ? 'Active' : 'Paused'}
                </div>
                {!isExtension && (
                  <button 
                    onClick={toggleView}
                    className="px-4 py-2 bg-white text-blue-800 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    View Homepage
                  </button>
                )}
              </div>
            </div>
          </header>

          <main className="p-6">
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Today's Progress</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                    <span className="block text-sm text-gray-500 mb-1">Time Spent</span>
                    <strong className="text-2xl text-blue-800">{formatTime(timeSpent)}</strong>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                    <span className="block text-sm text-gray-500 mb-1">Daily Limit</span>
                    <strong className="text-2xl text-blue-800">{formatTime(dailyLimit)}</strong>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${timeSpent >= dailyLimit ? 'bg-red-500' : 'bg-blue-600'}`}
                    style={{ width: `${Math.min((timeSpent / dailyLimit) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Settings</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="mb-6">
                  <label htmlFor="daily-limit" className="block text-sm font-medium text-gray-700 mb-2">
                    Daily Time Limit (minutes)
                  </label>
                  <input
                    type="number"
                    id="daily-limit"
                    value={dailyLimit}
                    onChange={handleLimitChange}
                    min="1"
                    max="1440"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button 
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    isActive 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                  onClick={toggleExtension}
                >
                  {isActive ? 'Pause Extension' : 'Resume Extension'}
                </button>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Top Websites</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Website
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time Spent
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {websites.length > 0 ? (
                        websites.map((site, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {site.domain}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                              {formatTime(site.time)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="2" className="px-6 py-4 text-center text-sm text-gray-500">
                            No website data available yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
            
            {!isExtension && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm text-center">
                <p>Running in development mode. Chrome extension features are simulated.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );

  return showHomepage ? <Homepage /> : <Dashboard />;
}

export default App;
