import React, { useState, useEffect } from 'react';
import { Clock, Settings, AlertTriangle, PieChart, Lock, Unlock, Bell, ChevronRight, Home, RefreshCw, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:3000');
const API_URL = 'http://localhost:3000';

const Dashboard = () => {
  const navigate = useNavigate();
  
  const [isActive, setIsActive] = useState(true);
  const [timeSpent, setTimeSpent] = useState(0);
  const [dailyLimit, setDailyLimit] = useState(120);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isExtension, setIsExtension] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [viewMode, setViewMode] = useState('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [currentUrl, setCurrentUrl] = useState('');
  const [websiteDurations, setWebsiteDurations] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedTimeZone, setSelectedTimeZone] = useState(() => {

    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (e) {
      return 'UTC';
    }
  });
  const [availableTimeZones, setAvailableTimeZones] = useState([]);
  const [dayStart, setDayStart] = useState('00:00');

  const [websites, setWebsites] = useState([
    { domain: 'youtube.com', time: 22, icon: '🎬' },
    { domain: 'twitter.com', time: 18, icon: '🐦' },
    { domain: 'facebook.com', time: 15, icon: '👥' },
    { domain: 'instagram.com', time: 12, icon: '📷' },
    { domain: 'reddit.com', time: 8, icon: '🔍' },
  ]);

  const formatTime = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = ((minutes % 60) + Number.EPSILON).toFixed(1);
    return `${hrs > 0 ? `${hrs}h ` : ''}${mins}m`;
  };
  
  const getTimeInZone = (timezone) => {
    try {
      return new Date().toLocaleString('en-US', { timeZone: timezone });
    } catch (e) {
      return new Date().toLocaleString();
    }
  };
  
  const formatDateInZone = (timezone) => {
    try {
      const options = { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric',
        timeZone: timezone
      };
      return new Date().toLocaleDateString('en-US', options);
    } catch (e) {
      return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    }
  };
  
  const formatTimeInZone = (timezone) => {
    try {
      const options = { 
        hour: 'numeric', 
        minute: 'numeric', 
        second: 'numeric',
        timeZone: timezone
      };
      return new Date().toLocaleTimeString('en-US', options);
    } catch (e) {
      return new Date().toLocaleTimeString();
    }
  };

  useEffect(() => {

    const commonTimeZones = [
      'UTC',
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Los_Angeles',
      'Europe/London',
      'Europe/Paris',
      'Europe/Berlin',
      'Asia/Tokyo',
      'Asia/Shanghai',
      'Australia/Sydney',
      'Pacific/Auckland'
    ];
    

    try {
      const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (!commonTimeZones.includes(browserTimeZone)) {
        commonTimeZones.unshift(browserTimeZone);
      }
    } catch (e) {
      console.error("Could not get browser timezone:", e);
    }
    
    setAvailableTimeZones(commonTimeZones);
  }, []);

  const handleLimitChange = async (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0 && value <= 1440) {
      setDailyLimit(value);
      try {
        await axios.post(`${API_URL}/api/settings/limit`, { limit: value });
      } catch (error) {
        console.error('Error updating daily limit:', error);
      }
    }
  };

  const handleDayStartChange = (e) => {
    setDayStart(e.target.value);
  };

  const handleTimeZoneChange = (e) => {
    setSelectedTimeZone(e.target.value);

    checkDayReset(e.target.value);
  };

  const checkDayReset = (timezone = selectedTimeZone) => {
    try {
      const now = new Date();
      const lastResetKey = 'lastResetDate';
      const lastReset = localStorage.getItem(lastResetKey);
      
  
      const formatter = new Intl.DateTimeFormat('en-US', { timeZone: timezone, day: 'numeric', month: 'numeric', year: 'numeric' });
      const currentDate = formatter.format(now);
      
  
      const timeFormatter = new Intl.DateTimeFormat('en-US', { timeZone: timezone, hour: 'numeric', minute: 'numeric', hour12: false });
      const currentTime = timeFormatter.format(now);
      
  
      const [dayStartHour, dayStartMinute] = dayStart.split(':').map(Number);
      const [currentHour, currentMinute] = currentTime.split(':').map(Number);
      
  
      const isPastDayStart = currentHour > dayStartHour || (currentHour === dayStartHour && currentMinute >= dayStartMinute);
      
      if (lastReset !== currentDate && isPastDayStart) {
    
        resetTimeSpent();
        localStorage.setItem(lastResetKey, currentDate);
      }
    } catch (e) {
      console.error("Error checking day reset:", e);
    }
  };

  const toggleExtension = () => {
    setIsActive(prev => !prev);
  };

  const goToHomepage = () => {
    navigate('/'); // Redirect to the homepage
  };

  const requestNotificationPermission = async () => {
    if (Notification && Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  useEffect(() => {
    if (isActive) {
      const timer = setInterval(() => {
        setTimeSpent(prev => {
          const newTime = prev + 1/60; // Incrementing by 1 second (1/60 of a minute)
          if (newTime >= dailyLimit && !isBlocked) {
            setIsBlocked(true);
        
            if (Notification && Notification.permission === "granted") {
              new Notification("Screen Time Limit Reached", {
                body: "You've reached your daily screen time limit!",
                icon: "/logo.png"
              });
            }
          }
          return newTime;
        });
      }, 1000); // Update every second for demo purposes
      return () => clearInterval(timer);
    }
  }, [isActive, dailyLimit, isBlocked]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
  
      checkDayReset();
    }, 1000);
    return () => clearInterval(timer);
  }, [selectedTimeZone, dayStart]);

  const resetTimeSpent = async () => {
    try {
      await axios.post(`${API_URL}/api/stats/reset`);
      setTimeSpent(0);
      setIsBlocked(false);
    } catch (error) {
      console.error('Error resetting time spent:', error);
    }
  };

  const [newWebsite, setNewWebsite] = useState('');
  const addWebsite = () => {
    if (newWebsite && !websites.find(site => site.domain === newWebsite)) {
      setWebsites([...websites, { domain: newWebsite, time: 0, icon: '🌐' }]);
      setNewWebsite('');
    }
  };

  const progressPercentage = Math.min((timeSpent / dailyLimit) * 100, 100);
  const timeRemaining = Math.max(dailyLimit - timeSpent, 0);
  const getTimeZoneOffset = (timezone) => {
    try {
      const date = new Date();
      const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
      const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
      const offset = (tzDate - utcDate) / (60 * 60 * 1000);
      return `UTC${offset >= 0 ? '+' : ''}${offset}`;
    } catch (e) {
      return '';
    }
  };

  const formatTimeZone = (timezone) => {
    try {
      const parts = timezone.split('/');
      const city = parts[parts.length - 1].replace(/_/g, ' ');
      const offset = getTimeZoneOffset(timezone);
      return `${city} (${offset})`;
    } catch (e) {
      return timezone;
    }
  };

  // Fetch initial data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch total time spent today
        const response = await axios.get(`${API_URL}/api/stats/daily`);
        if (response.data && response.data.totalTime) {
          setTimeSpent(response.data.totalTime);
        }
        
        // Fetch website durations
        const websitesResponse = await axios.get(`${API_URL}/api/stats/websites`);
        if (websitesResponse.data && websitesResponse.data.websites) {
          const websiteData = {};
          websitesResponse.data.websites.forEach(site => {
            websiteData[site.url] = site.duration;
          });
          setWebsiteDurations(websiteData);
          
          // Update websites list with real data
          const updatedWebsites = websitesResponse.data.websites.map(site => ({
            domain: new URL(site.url).hostname,
            time: site.duration,
            icon: getWebsiteIcon(new URL(site.url).hostname)
          }));
          setWebsites(updatedWebsites);
        }
      } catch (error) {
        console.error('Error fetching data from backend:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Helper function to get website icon
  const getWebsiteIcon = (domain) => {
    if (domain.includes('youtube')) return '🎬';
    if (domain.includes('twitter')) return '🐦';
    if (domain.includes('facebook')) return '👥';
    if (domain.includes('instagram')) return '📷';
    if (domain.includes('reddit')) return '🔍';
    return '🌐';
  };

  // Socket.IO connection for real-time updates
  useEffect(() => {
    // Socket.IO event listeners
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('durationUpdate', (data) => {
      setWebsiteDurations(prev => ({
        ...prev,
        [data.url]: data.duration
      }));
      
      // Update total time spent
      if (data.url === currentUrl) {
        setTimeSpent(prev => {
          const newTime = data.duration;
          if (newTime >= dailyLimit && !isBlocked) {
            setIsBlocked(true);
            
            if (Notification && Notification.permission === "granted") {
              new Notification("Screen Time Limit Reached", {
                body: "You've reached your daily screen time limit!",
                icon: "/logo.png"
              });
            }
          }
          return newTime;
        });
      }
    });

    // Get current URL when component mounts
    const getCurrentUrl = () => {
      const url = window.location.href;
      setCurrentUrl(url);
      socket.emit('startTracking', url);
    };

    getCurrentUrl();

    // Update duration every second
    const durationInterval = setInterval(() => {
      if (currentUrl && isActive) {
        socket.emit('updateDuration', {
          url: currentUrl,
          duration: websiteDurations[currentUrl] || 0
        });
      }
    }, 1000);

    return () => {
      clearInterval(durationInterval);
      socket.off('connect');
      socket.off('durationUpdate');
    };
  }, [currentUrl, isActive, dailyLimit, isBlocked]);

  if (isBlocked && isActive) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-md w-full p-8 text-center">
          <div className="mb-6 text-red-500 flex justify-center">
            <Lock size={64} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Screen Time Limit Reached</h1>
          <p className="text-gray-600 mb-2">You've used {formatTime(timeSpent)} today, exceeding your limit of {formatTime(dailyLimit)}.</p>
          <p className="text-gray-500 text-sm mb-6">Time Zone: {formatTimeZone(selectedTimeZone)}</p>
          <div className="space-y-4">
            <button 
              onClick={() => setIsActive(false)}
              className="w-full py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
            >
              Disable Blocking
            </button>
            <button 
              onClick={resetTimeSpent}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Reset Timer (Emergency Override)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <header className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
                <Clock className="text-white h-8 w-8" />
                <h1 className="text-2xl md:text-3xl font-bold text-white">Screen Time Reducer</h1>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`px-4 py-2 rounded-full text-sm font-medium flex items-center ${isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                  {isActive ? <Unlock className="h-4 w-4 mr-1" /> : <Lock className="h-4 w-4 mr-1" />}
                  {isActive ? 'Active' : 'Paused'}
                </div>
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
                >
                  <Settings className="h-5 w-5" />
                </button>
                {!isExtension && (
                  <button 
                    onClick={goToHomepage}
                    className="px-4 py-2 bg-white text-indigo-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    View Homepage
                  </button>
                )}
              </div>
            </div>
          </header>

          <main className="p-6">
            <div className="text-center mb-6">
              <p className="text-sm text-gray-500">
                {formatDateInZone(selectedTimeZone)}
              </p>
              <p className="text-lg font-medium text-gray-800">
                {formatTimeInZone(selectedTimeZone)}
              </p>
              <p className="text-xs text-gray-500 mt-1 flex items-center justify-center">
                <Globe className="h-3 w-3 mr-1" />
                {formatTimeZone(selectedTimeZone)}
              </p>
            </div>
            
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <PieChart className="h-5 w-5 mr-2 text-indigo-600" />
                Today's Progress
              </h2>
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <span className="block text-sm text-gray-500 mb-1">Time Spent</span>
                    <strong className="text-2xl text-indigo-700">{formatTime(timeSpent)}</strong>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <span className="block text-sm text-gray-500 mb-1">Daily Limit</span>
                    <strong className="text-2xl text-indigo-700">{formatTime(dailyLimit)}</strong>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <span className="block text-sm text-gray-500 mb-1">Time Remaining</span>
                    <strong className={`text-2xl ${timeRemaining === 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatTime(timeRemaining)}
                    </strong>
                  </div>
                </div>
                
                <div className="mb-2 flex justify-between text-xs text-gray-500">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-1">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ease-in-out ${
                      progressPercentage >= 90 ? 'bg-red-500' : 
                      progressPercentage >= 75 ? 'bg-yellow-500' : 
                      'bg-green-500'
                    }`}
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <button 
                    onClick={resetTimeSpent}
                    className="text-sm flex items-center text-indigo-600 hover:text-indigo-800"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" /> Reset Timer
                  </button>
                  
                  {timeSpent > dailyLimit * 0.8 && (
                    <div className="flex items-center text-yellow-600 text-sm">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {timeSpent > dailyLimit ? 'Limit exceeded!' : 'Approaching limit!'}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {showSettings && (
              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-indigo-600" />
                  Settings
                </h2>
                <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">
                      Time Zone
                    </label>
                    <select
                      id="timezone"
                      value={selectedTimeZone}
                      onChange={handleTimeZoneChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {availableTimeZones.map((tz) => (
                        <option key={tz} value={tz}>
                          {formatTimeZone(tz)}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Your usage data will be tracked based on this time zone.
                    </p>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="day-start" className="block text-sm font-medium text-gray-700 mb-2">
                      Day Starts At
                    </label>
                    <input
                      type="time"
                      id="day-start"
                      value={dayStart}
                      onChange={handleDayStartChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Your daily usage will reset at this time each day.
                    </p>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Notifications
                      </label>
                      <button 
                        onClick={requestNotificationPermission}
                        className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
                      >
                        {notificationPermission === 'granted' ? 'Enabled' : 'Enable'}
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div className="flex items-center">
                        <Bell className="h-5 w-5 text-indigo-600 mr-2" />
                        <span className="text-sm text-gray-700">Limit approaching alert</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <button 
                      className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                        isActive 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                      onClick={toggleExtension}
                    >
                      {isActive ? 'Pause Extension' : 'Resume Extension'}
                    </button>
                    
                    <button 
                      className="py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
                      onClick={() => {
                        setTimeSpent(0);
                        setIsBlocked(false);
                      }}
                    >
                      Reset Today's Data
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Add Website to Track
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        value={newWebsite}
                        onChange={(e) => setNewWebsite(e.target.value)}
                        placeholder="e.g., netflix.com"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <button 
                        onClick={addWebsite}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Home className="h-5 w-5 mr-2 text-indigo-600" />
                Top Websites
              </h2>
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
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
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          % of Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {websites.length > 0 ? (
                        websites.map((site, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                              <span className="mr-2">{site.icon}</span>
                              {site.domain}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                              {formatTime(site.time)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                              <div className="flex items-center justify-end">
                                <span className="text-gray-500 mr-2">
                                  {timeSpent > 0 ? Math.round((site.time / timeSpent) * 100) : 0}%
                                </span>
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-indigo-600 h-2 rounded-full" 
                                    style={{ width: `${timeSpent > 0 ? (site.time / timeSpent) * 100 : 0}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
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
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <p>Running in development mode. Chrome extension features are simulated.</p>
              </div>
            )}

            <div className="website-tracking-section">
              <h3>Current Website Duration</h3>
              {isLoading ? (
                <div className="loading-indicator">Loading data...</div>
              ) : (
                <div className="current-website">
                  <p>Website: {currentUrl}</p>
                  <p>Time spent: {formatTime(websiteDurations[currentUrl] || 0)}</p>
                </div>
              )}
            </div>
          </main>
          
          <footer className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} Screen Time Reducer
              </p>
              <div className="flex space-x-4 mt-2 md:mt-0">
                <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800">Privacy Policy</a>
                <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800">Help</a>
                <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800">About</a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;