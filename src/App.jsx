import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard.jsx";
import Homepage from "./Homepage";

function App() {
  const [dailyLimit, setDailyLimit] = useState(120); 
  const [timeSpent, setTimeSpent] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [websites, setWebsites] = useState([]);

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value);
    setDailyLimit(newLimit);
    localStorage.setItem('dailyLimit', newLimit);
  };

  const toggleExtension = () => {
    const newState = !isActive;
    setIsActive(newState);
    localStorage.setItem('isActive', newState);
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={<Homepage />} 
        />
        <Route 
          path="/dashboard" 
          element={
            <Dashboard 
              dailyLimit={dailyLimit}
              timeSpent={timeSpent}
              isActive={isActive}
              websites={websites}
              onLimitChange={handleLimitChange}
              onToggleExtension={toggleExtension}
              formatTime={formatTime}
            />
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
