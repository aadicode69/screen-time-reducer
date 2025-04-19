import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import Homepage from './Homepage';

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
      chrome.storage.local.get(['dailyLimit', 'timeSpent', 'isActive', 'websites'], (result) => {
        if (result.dailyLimit) setDailyLimit(result.dailyLimit);
        if (result.timeSpent) setTimeSpent(result.timeSpent);
        if (result.isActive !== undefined) setIsActive(result.isActive);
        if (result.websites) setWebsites(result.websites);
      });
    } else {
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

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage toggleView={toggleView} />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
