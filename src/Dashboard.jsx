import React, { useState, useEffect } from "react";
import {
  Clock,
  Settings,
  AlertTriangle,
  PieChart,
  Lock,
  Unlock,
  Bell,
  ChevronRight,
  Home,
  RefreshCw,
  Globe,
  Brain,
  Coffee,
  Calendar,
  Target,
  Award,
  BarChart2,
  Activity,
  Smile,
  Frown,
  Smartphone,
  Sun,
  Moon,
  Check,
  X,
  Zap,
  BookOpen,
  Eye,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";


const socket = io("http://localhost:3000");
const API_URL = "http://localhost:3000";

const Dashboard = () => {
  const navigate = useNavigate();

  // Main state variables
  const [isActive, setIsActive] = useState(true);
  const [timeSpent, setTimeSpent] = useState(0);
  const [dailyLimit, setDailyLimit] = useState(120);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isExtension, setIsExtension] = useState(true); // Set to true by default for extension
  const [showSettings, setShowSettings] = useState(false);
  const [viewMode, setViewMode] = useState("dashboard");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notificationPermission, setNotificationPermission] =
    useState("default");
  const [currentUrl, setCurrentUrl] = useState("");
  const [websiteDurations, setWebsiteDurations] = useState({});
  const [isLoading, setIsLoading] = useState(false); // Set to false by default

  // New state variables
  const [focusMode, setFocusMode] = useState(false);
  const [focusTimer, setFocusTimer] = useState(0);
  const [maxFocusTime, setMaxFocusTime] = useState(25);
  const [breakTimer, setBreakTimer] = useState(0);
  const [onBreak, setOnBreak] = useState(false);
  const [productivityScore, setProductivityScore] = useState(0);
  const [productivityHistory, setProductivityHistory] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [websiteCategories, setWebsiteCategories] = useState({});
  const [categoryColors, setCategoryColors] = useState({
    "Social Media": "#FF6384",
    Entertainment: "#36A2EB",
    Productivity: "#4BC0C0",
    Shopping: "#FFCE56",
    News: "#9966FF",
    Education: "#FF9F40",
    Other: "#C9CBCF",
  });
  const [activeTab, setActiveTab] = useState("overview");
  const [goals, setGoals] = useState([
    {
      id: 1,
      name: "Reduce social media to 30 min/day",
      target: 30,
      progress: 60,
      category: "Social Media",
      completed: false,
    },
    {
      id: 2,
      name: "Study for 2 hours daily",
      target: 120,
      progress: 85,
      category: "Education",
      completed: false,
    },
    {
      id: 3,
      name: "Limit entertainment to 1 hour",
      target: 60,
      progress: 40,
      category: "Entertainment",
      completed: false,
    },
  ]);
  const [distractionCount, setDistractionCount] = useState(0);
  const [savedTime, setSavedTime] = useState(0);
  const [streaks, setStreaks] = useState({ current: 3, best: 5 });
  const [digitalWellbeing, setDigitalWellbeing] = useState({
    score: 72,
    status: "Good",
  });
  const [achievementPoints, setAchievementPoints] = useState(120);
  const [isEditingFocusTime, setIsEditingFocusTime] = useState(false);
  const [tempFocusTime, setTempFocusTime] = useState(25);

  // Settings
  const [selectedTimeZone, setSelectedTimeZone] = useState(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (e) {
      return "UTC";
    }
  });
  const [availableTimeZones, setAvailableTimeZones] = useState([]);
  const [dayStart, setDayStart] = useState("00:00");
  const [websites, setWebsites] = useState([
    { domain: "youtube.com", time: 22, icon: "🎬", category: "Entertainment" },
    { domain: "twitter.com", time: 18, icon: "🐦", category: "Social Media" },
    { domain: "facebook.com", time: 15, icon: "👥", category: "Social Media" },
    { domain: "instagram.com", time: 12, icon: "📷", category: "Social Media" },
    { domain: "reddit.com", time: 8, icon: "🔍", category: "Social Media" },
  ]);

  // Helper functions
  const formatTime = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = ((minutes % 60) + Number.EPSILON).toFixed(1);
    return `${hrs > 0 ? `${hrs}h ` : ""}${mins}m`;
  };

  const getTimeInZone = (timezone) => {
    try {
      return new Date().toLocaleString("en-US", { timeZone: timezone });
    } catch (e) {
      return new Date().toLocaleString();
    }
  };

  const formatDateInZone = (timezone) => {
    try {
      const options = {
        weekday: "long",
        month: "long",
        day: "numeric",
        timeZone: timezone,
      };
      return new Date().toLocaleDateString("en-US", options);
    } catch (e) {
      return new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
    }
  };

  const formatTimeInZone = (timezone) => {
    try {
      const options = {
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        timeZone: timezone,
      };
      return new Date().toLocaleTimeString("en-US", options);
    } catch (e) {
      return new Date().toLocaleTimeString();
    }
  };

  const getTimeZoneOffset = (timezone) => {
    try {
      const date = new Date();
      const utcDate = new Date(
        date.toLocaleString("en-US", { timeZone: "UTC" })
      );
      const tzDate = new Date(
        date.toLocaleString("en-US", { timeZone: timezone })
      );
      const offset = (tzDate - utcDate) / (60 * 60 * 1000);
      return `UTC${offset >= 0 ? "+" : ""}${offset}`;
    } catch (e) {
      return "";
    }
  };

  const formatTimeZone = (timezone) => {
    try {
      const parts = timezone.split("/");
      const city = parts[parts.length - 1].replace(/_/g, " ");
      const offset = getTimeZoneOffset(timezone);
      return `${city} (${offset})`;
    } catch (e) {
      return timezone;
    }
  };

  // Calculate productivity score based on website categories
  const calculateProductivityScore = () => {
    // Sample scoring algorithm
    if (websites.length === 0) return 0;

    const productiveCategories = ["Education", "Productivity"];
    const neutralCategories = ["News", "Other"];
    const unproductiveCategories = [
      "Social Media",
      "Entertainment",
      "Shopping",
    ];

    let totalTime = websites.reduce((sum, site) => sum + site.time, 0);
    if (totalTime === 0) return 50; // Neutral score if no data

    let productiveTime = websites
      .filter((site) => productiveCategories.includes(site.category))
      .reduce((sum, site) => sum + site.time, 0);

    let unproductiveTime = websites
      .filter((site) => unproductiveCategories.includes(site.category))
      .reduce((sum, site) => sum + site.time, 0);

    // Calculate score (0-100)
    let score = 50; // Start with neutral score

    // Add points for productive time (max +50)
    score += Math.min(50, (productiveTime / totalTime) * 100);

    // Subtract points for unproductive time (max -50)
    score -= Math.min(50, (unproductiveTime / totalTime) * 80);

    // Ensure score is within 0-100 range
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  // Generate sample weekly data
  const generateWeeklyData = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const data = days.map((day) => {
      const screenTime = Math.floor(Math.random() * 120) + 30; // 30-150 minutes
      const productivity = Math.floor(Math.random() * 100);
      return {
        day,
        screenTime,
        productivity,
        socialMedia: Math.floor(screenTime * 0.4),
        entertainment: Math.floor(screenTime * 0.3),
        education: Math.floor(screenTime * 0.2),
        other: Math.floor(screenTime * 0.1),
      };
    });
    setWeeklyData(data);
  };

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch screen time data
        const screenTimeData = await getScreenTimeData();
        setTimeSpent(screenTimeData.timeSpent);
        setDailyLimit(screenTimeData.dailyLimit);
        setIsActive(screenTimeData.isActive);
        
        // Fetch focus mode data
        const focusModeData = await getFocusModeData();
        setFocusMode(focusModeData.isActive);
        setFocusTimer(focusModeData.timer);
        setMaxFocusTime(focusModeData.maxTime);
        
        // Fetch website categories
        const categories = await getWebsiteCategories();
        setWebsiteCategories(categories);
        
        // Fetch weekly data
        const weeklyStats = await getWeeklyData();
        setWeeklyData(weeklyStats);
        
        // Fetch goals
        const goalsData = await getGoals();
        setGoals(goalsData);
        
        // Fetch digital wellbeing data
        const wellbeingData = await getDigitalWellbeing();
        setDigitalWellbeing(wellbeingData);
        
        // Fetch settings
        const settings = await getSettings();
        setSelectedTimeZone(settings.timeZone);
        setDayStart(settings.dayStart);
        
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Update screen time
  useEffect(() => {
    if (isActive) {
      const timer = setInterval(async () => {
        try {
          const newTime = timeSpent + 1/60;
          setTimeSpent(newTime);
          
          // Update screen time in the backend
          await updateScreenTime({
            timeSpent: newTime,
            dailyLimit,
            isActive
          });
          
          if (newTime >= dailyLimit && !isBlocked) {
            setIsBlocked(true);
          }
        } catch (error) {
          console.error('Error updating screen time:', error);
        }
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [isActive, dailyLimit, isBlocked]);

  // Update focus mode
  useEffect(() => {
    if (focusMode && !onBreak) {
      const interval = setInterval(async () => {
        try {
          const newTimer = focusTimer + 1;
          setFocusTimer(newTimer);
          
          // Update focus mode in the backend
          await updateFocusMode({
            isActive: focusMode,
            timer: newTimer,
            maxTime: maxFocusTime
          });
          
          if (newTimer >= maxFocusTime * 60) {
            setOnBreak(true);
            setBreakTimer(0);
          }
        } catch (error) {
          console.error('Error updating focus mode:', error);
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [focusMode, onBreak, maxFocusTime]);

  // Handle settings updates
  const handleSettingsUpdate = async (newSettings) => {
    try {
      await updateSettings(newSettings);
      // Update local state
      setSelectedTimeZone(newSettings.timeZone);
      setDayStart(newSettings.dayStart);
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  // Handle goal updates
  const handleGoalUpdate = async (goalId, updatedGoal) => {
    try {
      await updateGoal(goalId, updatedGoal);
      // Update local state
      setGoals(goals.map(goal => 
        goal.id === goalId ? { ...goal, ...updatedGoal } : goal
      ));
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  // Setup and effect hooks
  useEffect(() => {
    const commonTimeZones = [
      "UTC",
      "America/New_York",
      "America/Chicago",
      "America/Denver",
      "America/Los_Angeles",
      "Europe/London",
      "Europe/Paris",
      "Europe/Berlin",
      "Asia/Tokyo",
      "Asia/Shanghai",
      "Australia/Sydney",
      "Pacific/Auckland",
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

    // Generate sample weekly data
    const generateWeeklyData = () => {
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const data = days.map((day) => {
        const screenTime = Math.floor(Math.random() * 120) + 30; // 30-150 minutes
        const productivity = Math.floor(Math.random() * 100);
        return {
          day,
          screenTime,
          productivity,
          socialMedia: Math.floor(screenTime * 0.4),
          entertainment: Math.floor(screenTime * 0.3),
          education: Math.floor(screenTime * 0.2),
          other: Math.floor(screenTime * 0.1),
        };
      });
      setWeeklyData(data);
    };

    generateWeeklyData();

    // Set initial productivity score
    const initialScore = calculateProductivityScore();
    setProductivityScore(initialScore);

    // Sample productivity history
    const now = new Date();
    const history = [];
    for (let i = 0; i < 12; i++) {
      const hour = new Date(now);
      hour.setHours(hour.getHours() - i);
      history.push({
        time: hour.getHours() + ":00",
        score: Math.floor(Math.random() * 50 + 50),
        focus: Math.floor(Math.random() * 100),
      });
    }
    setProductivityHistory(history.reverse());

    // Initialize website categories
    const categories = {};
    websites.forEach((site) => {
      categories[site.domain] = site.category || "Other";
    });
    setWebsiteCategories(categories);
  }, []);

  // Socket.IO for real-time updates
  useEffect(() => {
    // Socket.IO event listeners
    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("durationUpdate", (data) => {
      setWebsiteDurations((prev) => ({
        ...prev,
        [data.url]: data.duration,
      }));

      // Update total time spent
      if (data.url === currentUrl) {
        setTimeSpent((prev) => {
          const newTime = data.duration;
          if (newTime >= dailyLimit && !isBlocked) {
            setIsBlocked(true);

            if (Notification && Notification.permission === "granted") {
              new Notification("Screen Time Limit Reached", {
                body: "You've reached your daily screen time limit!",
                icon: "/logo.png",
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
      socket.emit("startTracking", url);
    };

    getCurrentUrl();

    // Update duration every second
    const durationInterval = setInterval(() => {
      if (currentUrl && isActive) {
        socket.emit("updateDuration", {
          url: currentUrl,
          duration: websiteDurations[currentUrl] || 0,
        });
      }
    }, 1000);

    return () => {
      clearInterval(durationInterval);
      socket.off("connect");
      socket.off("durationUpdate");
    };
  }, [currentUrl, isActive, dailyLimit, isBlocked]);

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
        const websitesResponse = await axios.get(
          `${API_URL}/api/stats/websites`
        );
        if (websitesResponse.data && websitesResponse.data.websites) {
          const websiteData = {};
          websitesResponse.data.websites.forEach((site) => {
            websiteData[site.url] = site.duration;
          });
          setWebsiteDurations(websiteData);

          // Update websites list with real data
          const updatedWebsites = websitesResponse.data.websites.map((site) => {
            const hostname = new URL(site.url).hostname;
            return {
              domain: hostname,
              time: site.duration,
              icon: getWebsiteIcon(hostname),
              category: getWebsiteCategory(hostname),
            };
          });
          setWebsites(updatedWebsites);
        }
      } catch (error) {
        console.error("Error fetching data from backend:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handler functions
  const handleLimitChange = async (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0 && value <= 1440) {
      setDailyLimit(value);
      try {
        await axios.post(`${API_URL}/api/settings/limit`, { limit: value });
      } catch (error) {
        console.error("Error updating daily limit:", error);
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
      const lastResetKey = "lastResetDate";
      const lastReset = localStorage.getItem(lastResetKey);

      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        day: "numeric",
        month: "numeric",
        year: "numeric",
      });
      const currentDate = formatter.format(now);

      const timeFormatter = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        hour: "numeric",
        minute: "numeric",
        hour12: false,
      });
      const currentTime = timeFormatter.format(now);

      const [dayStartHour, dayStartMinute] = dayStart.split(":").map(Number);
      const [currentHour, currentMinute] = currentTime.split(":").map(Number);

      const isPastDayStart =
        currentHour > dayStartHour ||
        (currentHour === dayStartHour && currentMinute >= dayStartMinute);

      if (lastReset !== currentDate && isPastDayStart) {
        resetTimeSpent();
        localStorage.setItem(lastResetKey, currentDate);
      }
    } catch (e) {
      console.error("Error checking day reset:", e);
    }
  };

  const toggleExtension = () => {
    setIsActive((prev) => !prev);
  };

  const toggleFocusMode = () => {
    if (!focusMode) {
      // Starting focus mode
      setFocusMode(true);
      setFocusTimer(0);
      setOnBreak(false);

      // Notify user
      if (Notification && Notification.permission === "granted") {
        new Notification("Focus Mode Activated", {
          body: `Starting ${maxFocusTime} minute focus session. Stay focused!`,
          icon: "/logo.png",
        });
      }
    } else {
      // Stopping focus mode
      setFocusMode(false);

      // Notify user
      if (Notification && Notification.permission === "granted") {
        new Notification("Focus Mode Deactivated", {
          body: "Focus mode has been turned off.",
          icon: "/logo.png",
        });
      }
    }
  };

  const goToHomepage = () => {
    navigate("/");
  };

  const requestNotificationPermission = async () => {
    if (Notification && Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  const resetTimeSpent = async () => {
    try {
      await axios.post(`${API_URL}/api/stats/reset`);
      setTimeSpent(0);
      setIsBlocked(false);
    } catch (error) {
      console.error("Error resetting time spent:", error);
    }
  };

  const [newWebsite, setNewWebsite] = useState("");
  const addWebsite = () => {
    if (newWebsite && !websites.find((site) => site.domain === newWebsite)) {
      setWebsites([
        ...websites,
        {
          domain: newWebsite,
          time: 0,
          icon: "🌐",
          category: "Other",
        },
      ]);
      setNewWebsite("");
    }
  };

  const updateGoalProgress = (id, newProgress) => {
    setGoals(
      goals.map((goal) =>
        goal.id === id
          ? { ...goal, progress: newProgress, completed: newProgress >= 100 }
          : goal
      )
    );
  };

  const addNewGoal = (name, target, category) => {
    const newGoal = {
      id: goals.length + 1,
      name,
      target,
      progress: 0,
      category,
      completed: false,
    };
    setGoals([...goals, newGoal]);
  };

  // Helper functions for website categorization
  const getWebsiteIcon = (domain) => {
    if (domain.includes("youtube")) return "🎬";
    if (domain.includes("twitter") || domain.includes("x.com")) return "🐦";
    if (domain.includes("facebook")) return "👥";
    if (domain.includes("instagram")) return "📷";
    if (domain.includes("reddit")) return "🔍";
    if (domain.includes("amazon") || domain.includes("ebay")) return "🛒";
    if (domain.includes("netflix") || domain.includes("hulu")) return "🎭";
    if (domain.includes("github")) return "💻";
    if (domain.includes("udemy") || domain.includes("coursera")) return "📚";
    if (domain.includes("gmail") || domain.includes("outlook")) return "📧";
    return "🌐";
  };

  const getWebsiteCategory = (domain) => {
    // Social media
    if (
      domain.includes("facebook") ||
      domain.includes("twitter") ||
      domain.includes("x.com") ||
      domain.includes("instagram") ||
      domain.includes("reddit") ||
      domain.includes("tiktok") ||
      domain.includes("linkedin") ||
      domain.includes("pinterest")
    ) {
      return "Social Media";
    }

    // Entertainment
    if (
      domain.includes("youtube") ||
      domain.includes("netflix") ||
      domain.includes("hulu") ||
      domain.includes("disney") ||
      domain.includes("spotify") ||
      domain.includes("twitch") ||
      domain.includes("vimeo")
    ) {
      return "Entertainment";
    }

    // Productivity
    if (
      domain.includes("slack") ||
      domain.includes("notion") ||
      domain.includes("trello") ||
      domain.includes("asana") ||
      domain.includes("monday") ||
      domain.includes("jira") ||
      domain.includes("docs.google") ||
      domain.includes("office") ||
      domain.includes("github")
    ) {
      return "Productivity";
    }

    // Shopping
    if (
      domain.includes("amazon") ||
      domain.includes("ebay") ||
      domain.includes("walmart") ||
      domain.includes("etsy") ||
      domain.includes("bestbuy") ||
      domain.includes("target") ||
      domain.includes("shop")
    ) {
      return "Shopping";
    }

    // News
    if (
      domain.includes("news") ||
      domain.includes("cnn") ||
      domain.includes("bbc") ||
      domain.includes("nytimes") ||
      domain.includes("wsj") ||
      domain.includes("reuters") ||
      domain.includes("bloomberg")
    ) {
      return "News";
    }

    // Education
    if (
      domain.includes("coursera") ||
      domain.includes("udemy") ||
      domain.includes("edx") ||
      domain.includes("khanacademy") ||
      domain.includes("stackoverflow") ||
      domain.includes("w3schools") ||
      domain.includes("edu") ||
      domain.includes("learn")
    ) {
      return "Education";
    }

    // Default
    return "Other";
  };

  const progressPercentage = Math.min((timeSpent / dailyLimit) * 100, 100);
  const timeRemaining = Math.max(dailyLimit - timeSpent, 0);

  const formatFocusTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" + secs : secs}`;
  };

  const handleFocusTimeChange = (e) => {
    const value = parseInt(e.target.value);
    if (value >= 20) {
      setTempFocusTime(value);
    }
  };

  const saveFocusTime = () => {
    if (tempFocusTime >= 20) {
      setMaxFocusTime(tempFocusTime);
      setIsEditingFocusTime(false);
    }
  };

  // If blocked, show block screen
  if (isBlocked && isActive) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-md w-full p-8 text-center">
          <div className="mb-6 text-red-500 flex justify-center">
            <Lock size={64} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Screen Time Limit Reached
          </h1>
          <p className="text-gray-600 mb-2">
            You've used {formatTime(timeSpent)} today, exceeding your limit of{" "}
            {formatTime(dailyLimit)}.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Time Zone: {formatTimeZone(selectedTimeZone)}
          </p>
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

  // Add console log for tab changes
  useEffect(() => {
    console.log("Active tab changed to:", activeTab);
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <header className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
                <Clock className="text-white h-6 w-6 md:h-8 md:w-8" />
                <h1 className="text-xl md:text-3xl font-bold text-white">
                  Screen Time Guardian
                </h1>
              </div>
              <div className="flex items-center space-x-3">
                <div
                  className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-sm font-medium flex items-center ${
                    isActive
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {isActive ? (
                    <Unlock className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  ) : (
                    <Lock className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  )}
                  {isActive ? "Active" : "Paused"}
                </div>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-1.5 md:p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
                >
                  <Settings className="h-4 w-4 md:h-5 md:w-5" />
                </button>
                {!isExtension && (
                  <button
                    onClick={goToHomepage}
                    className="px-3 md:px-4 py-1.5 md:py-2 bg-white text-indigo-700 rounded-lg hover:bg-gray-100 transition-colors text-sm md:text-base"
                  >
                    View Homepage
                  </button>
                )}
              </div>
            </div>
          </header>

          {/* Navigation Tabs */}
          <div className="bg-gray-50 px-4 md:px-6 py-2 md:py-3 border-b border-gray-200">
            <div className="flex overflow-x-auto hide-scrollbar space-x-2 md:space-x-4">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium whitespace-nowrap transition-colors text-sm md:text-base ${
                  activeTab === "overview"
                    ? "bg-indigo-100 text-indigo-800"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                <span className="flex items-center">
                  <Home className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  Overview
                </span>
              </button>
              <button
                onClick={() => setActiveTab("focus")}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center text-sm md:text-base ${
                  activeTab === "focus"
                    ? "bg-indigo-100 text-indigo-800"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Brain className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                Focus
              </button>
              <button
                onClick={() => setActiveTab("goals")}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center text-sm md:text-base ${
                  activeTab === "goals"
                    ? "bg-indigo-100 text-indigo-800"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Target className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                Goals
              </button>
              <button
                onClick={() => setActiveTab("wellbeing")}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center text-sm md:text-base ${
                  activeTab === "wellbeing"
                    ? "bg-indigo-100 text-indigo-800"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Brain className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                Digital Wellbeing
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center text-sm md:text-base ${
                  activeTab === "settings"
                    ? "bg-indigo-100 text-indigo-800"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Settings className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                Settings
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="p-6">
            {/* Settings Panel - Shows when settings button is clicked */}
            {showSettings && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-indigo-600" />
                  Settings
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Daily Screen Time Limit (minutes)
                    </label>
                    <input
                      type="number"
                      value={dailyLimit}
                      onChange={handleLimitChange}
                      min="1"
                      max="1440"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Day Start Time
                    </label>
                    <input
                      type="time"
                      value={dayStart}
                      onChange={handleDayStartChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Zone
                    </label>
                    <select
                      value={selectedTimeZone}
                      onChange={handleTimeZoneChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {availableTimeZones.map((tz) => (
                        <option key={tz} value={tz}>
                          {formatTimeZone(tz)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pomodoro Focus Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={maxFocusTime}
                      onChange={(e) =>
                        setMaxFocusTime(parseInt(e.target.value) || 25)
                      }
                      min="1"
                      max="120"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notifications
                    </label>
                    <button
                      onClick={requestNotificationPermission}
                      className={`px-4 py-2 rounded-md text-white font-medium ${
                        notificationPermission === "granted"
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {notificationPermission === "granted" ? (
                        <span className="flex items-center">
                          <Check className="h-4 w-4 mr-1" /> Notifications
                          Enabled
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Bell className="h-4 w-4 mr-1" /> Enable Notifications
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Content */}
            {activeTab === "overview" && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  {/* Daily Summary Card */}
                  <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Daily Summary
                      </h3>
                      <span className="text-xs font-medium text-gray-500">
                        {formatDateInZone(selectedTimeZone)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-600">Screen Time</span>
                      <span className="font-semibold text-gray-800">
                        {formatTime(timeSpent)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${
                          progressPercentage > 90
                            ? "bg-red-500"
                            : progressPercentage > 75
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-sm">
                      <span className="text-gray-500">
                        {timeRemaining > 0
                          ? `${formatTime(timeRemaining)} remaining`
                          : "Limit exceeded"}
                      </span>
                      <span className="text-gray-500">
                        Limit: {formatTime(dailyLimit)}
                      </span>
                    </div>
                  </div>

                  {/* Focus Mode Card */}
                  <div
                    className={`rounded-lg shadow-md p-6 border border-gray-200 min-h-[280px] flex flex-col ${
                      focusMode ? "bg-indigo-50 border-indigo-200" : "bg-white"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Focus Mode
                      </h3>
                      <div className="relative">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={focusMode}
                            onChange={toggleFocusMode}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>
                    </div>
                    {focusMode ? (
                      <div className="text-center flex-1 flex flex-col justify-center">
                        <div className="text-3xl font-bold mb-1 text-indigo-700">
                          {onBreak ? "Break Time" : "Focusing"}
                        </div>
                        <div className="text-4xl font-mono mb-3">
                          {onBreak
                            ? formatFocusTime(5 * 60 - breakTimer)
                            : formatFocusTime(maxFocusTime * 60 - focusTimer)}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                          <div
                            className={`h-2 rounded-full ${
                              onBreak ? "bg-green-500" : "bg-indigo-600"
                            }`}
                            style={{
                              width: `${
                                onBreak
                                  ? (breakTimer / (5 * 60)) * 100
                                  : (focusTimer / (maxFocusTime * 60)) * 100
                              }%`,
                            }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-600">
                          {onBreak
                            ? "Take a short break. Stand up, stretch, or get some water."
                            : `Focus until ${maxFocusTime} minutes is complete.`}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center flex-1 flex flex-col justify-center">
                        <Brain className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                        <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                          {isEditingFocusTime ? (
                            <div>
                              <div className="flex items-center justify-center space-x-2 mb-3">
                                <div className="relative flex items-center">
                                  <input
                                    type="number"
                                    min="20"
                                    value={tempFocusTime}
                                    onChange={handleFocusTimeChange}
                                    className="w-24 px-3 py-1.5 border-2 border-indigo-200 rounded-lg text-center text-base font-semibold text-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                    style={{
                                      appearance: 'textfield',
                                      MozAppearance: 'textfield'
                                    }}
                                  />
                                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 flex flex-col space-y-0.5 pr-1">
                                    <button 
                                      onClick={() => handleFocusTimeChange({ target: { value: tempFocusTime + 5 }})}
                                      className="text-indigo-400 hover:text-indigo-600 transition-colors text-xs"
                                    >
                                      ▲
                                    </button>
                                    <button 
                                      onClick={() => handleFocusTimeChange({ target: { value: Math.max(20, tempFocusTime - 5) }})}
                                      className="text-indigo-400 hover:text-indigo-600 transition-colors text-xs"
                                    >
                                      ▼
                                    </button>
                                  </div>
                                </div>
                                <span className="text-gray-600 text-sm">min</span>
                              </div>
                              <div className="flex justify-center space-x-2">
                                <button
                                  onClick={saveFocusTime}
                                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors flex items-center"
                                >
                                  <Check className="h-3 w-3 mr-1" /> Save
                                </button>
                                <button
                                  onClick={() => {
                                    setTempFocusTime(maxFocusTime);
                                    setIsEditingFocusTime(false);
                                  }}
                                  className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium transition-colors flex items-center"
                                >
                                  <X className="h-3 w-3 mr-1" /> Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-600">
                                  Current duration
                                </p>
                                <p className="text-base font-semibold text-gray-800">
                                  {maxFocusTime} minutes
                                </p>
                              </div>
                              <button
                                onClick={() => setIsEditingFocusTime(true)}
                                className="px-2.5 py-1 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 text-sm font-medium border border-indigo-200 transition-colors flex items-center"
                              >
                                <Settings className="h-3 w-3 mr-1" /> Change
                              </button>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={toggleFocusMode}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                        >
                          Start Focus Session
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Productivity Score Card */}
                  <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Productivity Score
                      </h3>
                    </div>
                    <div className="flex items-center justify-center my-2">
                      <div className="relative w-24 h-24">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          <circle
                            className="text-gray-200 stroke-current"
                            strokeWidth="10"
                            cx="50"
                            cy="50"
                            r="40"
                            fill="transparent"
                          ></circle>
                          <circle
                            className={`${
                              productivityScore >= 80
                                ? "text-green-500"
                                : productivityScore >= 60
                                ? "text-blue-500"
                                : productivityScore >= 40
                                ? "text-yellow-500"
                                : "text-red-500"
                            } stroke-current`}
                            strokeWidth="10"
                            strokeLinecap="round"
                            strokeDasharray={`${productivityScore * 2.51} 251`}
                            strokeDashoffset="0"
                            cx="50"
                            cy="50"
                            r="40"
                            fill="transparent"
                            transform="rotate(-90 50 50)"
                          ></circle>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold text-gray-800">
                            {productivityScore}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center items-center mt-3">
                      <span className="text-sm text-gray-600">
                        {productivityScore >= 80
                          ? "Excellent"
                          : productivityScore >= 60
                          ? "Good"
                          : productivityScore >= 40
                          ? "Fair"
                          : "Needs Improvement"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Top Sites Card */}
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Top Sites Today
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Website
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Time Spent
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            % of Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {websites
                          .sort((a, b) => b.time - a.time)
                          .slice(0, 5)
                          .map((site, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <span className="text-xl mr-2">
                                    {site.icon}
                                  </span>
                                  <span className="font-medium text-gray-900">
                                    {site.domain}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className="px-2 py-1 text-xs font-medium rounded-full"
                                  style={{
                                    backgroundColor: `${
                                      categoryColors[site.category]
                                    }20`,
                                    color: categoryColors[site.category],
                                  }}
                                >
                                  {site.category}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                                {formatTime(site.time)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                                    <div
                                      className="h-2 rounded-full"
                                      style={{
                                        width: `${
                                          (site.time / timeSpent) * 100
                                        }%`,
                                        backgroundColor:
                                          categoryColors[site.category],
                                      }}
                                    ></div>
                                  </div>
                                  <span className="text-sm text-gray-700">
                                    {Math.round(
                                      (site.time / timeSpent) * 100
                                    ) || 0}
                                    %
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Productivity Chart Card */}
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Today's Productivity
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={productivityHistory}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" />
                        <YAxis
                          yAxisId="left"
                          domain={[0, 100]}
                          tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip
                          formatter={(value, name) => [
                            `${value}${name === "score" ? "%" : " min"}`,
                            name === "score" ? "Productivity" : "Focus Time",
                          ]}
                        />
                        <Legend />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="focus"
                          name="Focus"
                          stroke="#10B981"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "focus" && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="col-span-2 bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Focus Timer
                    </h3>
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
                      {focusMode ? (
                        <div>
                          <div className="text-4xl font-bold mb-6 text-indigo-700">
                            {onBreak ? "Break Time" : "Focus Time"}
                          </div>
                          <div className="text-8xl font-mono mb-6 text-gray-800">
                            {onBreak
                              ? formatFocusTime(5 * 60 - breakTimer)
                              : formatFocusTime(maxFocusTime * 60 - focusTimer)}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
                            <div
                              className={`h-3 rounded-full ${
                                onBreak ? "bg-green-500" : "bg-indigo-600"
                              }`}
                              style={{
                                width: `${
                                  onBreak
                                    ? (breakTimer / (5 * 60)) * 100
                                    : (focusTimer / (maxFocusTime * 60)) * 100
                                }%`,
                              }}
                            ></div>
                          </div>
                          <div className="flex space-x-4 justify-center">
                            <button
                              onClick={toggleFocusMode}
                              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center"
                            >
                              <X className="h-5 w-5 mr-2" /> End Session
                            </button>
                          </div>
                          <p className="mt-6 text-gray-600 text-sm">
                            {onBreak
                              ? "Take a short break. Stand up, stretch, or get some water."
                              : "Stay focused on your current task. Avoid distractions."}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <Brain className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                          <h4 className="text-xl font-semibold text-gray-800 mb-3">
                            Start a Focus Session
                          </h4>
                          <p className="text-gray-600 mb-4">
                            Use the Pomodoro technique to boost your
                            productivity. Focus for {maxFocusTime} minutes, then
                            take a 5-minute break.
                          </p>
                          <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                            {isEditingFocusTime ? (
                              <div>
                                <div className="flex items-center justify-center space-x-2 mb-3">
                                  <div className="relative flex items-center">
                                    <input
                                      type="number"
                                      min="20"
                                      value={tempFocusTime}
                                      onChange={handleFocusTimeChange}
                                      className="w-32 px-4 py-2 border-2 border-indigo-200 rounded-lg text-center text-lg font-semibold text-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                      style={{
                                        appearance: 'textfield',
                                        MozAppearance: 'textfield'
                                      }}
                                    />
                                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 flex flex-col space-y-1 pr-2">
                                      <button 
                                        onClick={() => handleFocusTimeChange({ target: { value: tempFocusTime + 5 }})}
                                        className="text-indigo-400 hover:text-indigo-600 transition-colors"
                                      >
                                        ▲
                                      </button>
                                      <button 
                                        onClick={() => handleFocusTimeChange({ target: { value: Math.max(20, tempFocusTime - 5) }})}
                                        className="text-indigo-400 hover:text-indigo-600 transition-colors"
                                      >
                                        ▼
                                      </button>
                                    </div>
                                  </div>
                                  <span className="text-gray-600 font-medium">minutes</span>
                                </div>
                                <div className="flex justify-center space-x-3">
                                  <button
                                    onClick={saveFocusTime}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors flex items-center"
                                  >
                                    <Check className="h-4 w-4 mr-1" /> Save
                                  </button>
                                  <button
                                    onClick={() => {
                                      setTempFocusTime(maxFocusTime);
                                      setIsEditingFocusTime(false);
                                    }}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium transition-colors flex items-center"
                                  >
                                    <X className="h-4 w-4 mr-1" /> Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-gray-600">
                                    Current duration
                                  </p>
                                  <p className="text-lg font-semibold text-gray-800">
                                    {maxFocusTime} minutes
                                  </p>
                                </div>
                                <button
                                  onClick={() => setIsEditingFocusTime(true)}
                                  className="px-3 py-1.5 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 text-sm font-medium border border-indigo-200 transition-colors flex items-center"
                                >
                                  <Settings className="h-4 w-4 mr-1" /> Change
                                </button>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={toggleFocusMode}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center mx-auto"
                          >
                            <Zap className="h-5 w-5 mr-2" /> Start Focusing
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Focus Stats
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">
                            Focus sessions today
                          </span>
                          <span className="font-semibold text-gray-800">4</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">
                            Total focus time
                          </span>
                          <span className="font-semibold text-gray-800">
                            1h 45m
                          </span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">Current streak</span>
                          <span className="font-semibold text-gray-800">
                            3 days
                          </span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <h4 className="font-medium text-gray-800 mb-3">
                          Focus Tips
                        </h4>
                        <ul className="space-y-2 text-gray-600 text-sm">
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span>Clear your workspace of distractions</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span>
                              Use noise-cancelling headphones or play ambient
                              sounds
                            </span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span>
                              Keep a glass of water nearby to stay hydrated
                            </span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span>
                              Set a specific goal for each focus session
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === "goals" && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Current Goals
                      </h3>
                      <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm flex items-center">
                        <Target className="h-4 w-4 mr-1" /> Add New Goal
                      </button>
                    </div>
                    <div className="space-y-4">
                      {goals.map((goal) => (
                        <div
                          key={goal.id}
                          className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center">
                              <span
                                className="w-3 h-3 rounded-full mr-2"
                                style={{
                                  backgroundColor:
                                    categoryColors[goal.category],
                                }}
                              ></span>
                              <h4 className="font-medium text-gray-800">
                                {goal.name}
                              </h4>
                            </div>
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded-full ${
                                goal.completed
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {goal.completed ? "Completed" : "In Progress"}
                            </span>
                          </div>
                          <div className="mb-2">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Progress</span>
                              <span>{goal.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="h-2 rounded-full"
                                style={{
                                  width: `${goal.progress}%`,
                                  backgroundColor:
                                    categoryColors[goal.category],
                                }}
                              ></div>
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">
                              Target: {formatTime(goal.target)}
                            </span>
                            <div className="flex space-x-2">
                              <button className="text-indigo-600 hover:text-indigo-800 transition-colors">
                                Edit
                              </button>
                              <button className="text-red-600 hover:text-red-800 transition-colors">
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Goal Progress
                    </h3>
                    <div className="space-y-4">
                      <div className="text-center py-4">
                        <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-full mb-2">
                          <Award className="h-6 w-6 text-green-700" />
                        </div>
                        <div className="text-3xl font-bold text-gray-800">
                          {goals.filter((g) => g.completed).length}/
                          {goals.length}
                        </div>
                        <div className="text-sm text-gray-600">
                          Goals Completed
                        </div>
                      </div>
                      <div className="pt-4 border-t border-gray-200">
                        <h4 className="font-medium text-gray-800 mb-3">
                          Achievements
                        </h4>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-gray-600">
                            Achievement Points
                          </span>
                          <span className="font-semibold text-gray-800">
                            {achievementPoints}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-gray-600">Next Milestone</span>
                          <span className="font-semibold text-gray-800">
                            150 points
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                          <div
                            className="h-2 rounded-full bg-indigo-600"
                            style={{
                              width: `${(achievementPoints / 150) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-gray-200">
                        <h4 className="font-medium text-gray-800 mb-3">
                          Recent Achievements
                        </h4>
                        <ul className="space-y-2">
                          <li className="flex items-center justify-between">
                            <span className="text-gray-600 flex items-center">
                              <Award className="h-4 w-4 mr-1 text-yellow-500" />
                              3-Day Focus Streak
                            </span>
                            <span className="text-xs font-medium text-gray-500">
                              +10 pts
                            </span>
                          </li>
                          <li className="flex items-center justify-between">
                            <span className="text-gray-600 flex items-center">
                              <BookOpen className="h-4 w-4 mr-1 text-blue-500" />
                              Study Goal Completed
                            </span>
                            <span className="text-xs font-medium text-gray-500">
                              +20 pts
                            </span>
                          </li>
                          <li className="flex items-center justify-between">
                            <span className="text-gray-600 flex items-center">
                              <Zap className="h-4 w-4 mr-1 text-purple-500" />
                              Productivity Master
                            </span>
                            <span className="text-xs font-medium text-gray-500">
                              +15 pts
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Digital Wellbeing Tab */}
            {activeTab === "wellbeing" && (
              <div>
                {console.log("Rendering digital wellbeing section")}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Digital Wellbeing
                    </h3>
                    <div className="text-center mb-6">
                      <div className="relative inline-block w-36 h-36 mb-4">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          <circle
                            className="text-gray-200 stroke-current"
                            strokeWidth="8"
                            cx="50"
                            cy="50"
                            r="40"
                            fill="transparent"
                          ></circle>
                          <circle
                            className={
                              digitalWellbeing.score >= 80
                                ? "text-green-500 stroke-current"
                                : digitalWellbeing.score >= 60
                                ? "text-blue-500 stroke-current"
                                : digitalWellbeing.score >= 40
                                ? "text-yellow-500 stroke-current"
                                : "text-red-500 stroke-current"
                            }
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={`${
                              digitalWellbeing.score * 2.51
                            } 251`}
                            strokeDashoffset="0"
                            cx="50"
                            cy="50"
                            r="40"
                            fill="transparent"
                            transform="rotate(-90 50 50)"
                          ></circle>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-3xl font-bold text-gray-800">
                            {digitalWellbeing.score}
                          </span>
                        </div>
                      </div>
                      <h4 className="text-xl font-semibold text-gray-800">
                        {digitalWellbeing.status}
                      </h4>
                      <p className="text-gray-600 text-sm mt-1">
                        Your digital wellbeing score
                      </p>
                    </div>
                  </div>

                  <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Wellbeing Insights
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center mb-3">
                          <div className="p-2 bg-blue-100 rounded-full mr-3">
                            <Smartphone className="h-5 w-5 text-blue-700" />
                          </div>
                          <h4 className="font-medium text-gray-800">
                            Screen Time
                          </h4>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">
                          Your daily average is{" "}
                          {formatTime(
                            weeklyData.reduce(
                              (sum, day) => sum + day.screenTime,
                              0
                            ) / 7
                          )}
                          . Try to take regular breaks to reduce eye strain.
                        </p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center mb-3">
                          <div className="p-2 bg-purple-100 rounded-full mr-3">
                            <Moon className="h-5 w-5 text-purple-700" />
                          </div>
                          <h4 className="font-medium text-gray-800">
                            Night Usage
                          </h4>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">
                          You used your device for 35 minutes after 10 PM
                          yesterday. Try to reduce screen time before bed.
                        </p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center mb-3">
                          <div className="p-2 bg-green-100 rounded-full mr-3">
                            <Coffee className="h-5 w-5 text-green-700" />
                          </div>
                          <h4 className="font-medium text-gray-800">
                            Break Recommendations
                          </h4>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">
                          Taking a 5-minute break every 25 minutes can improve
                          focus and reduce eye strain.
                        </p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center mb-3">
                          <div className="p-2 bg-yellow-100 rounded-full mr-3">
                            <Sun className="h-5 w-5 text-yellow-700" />
                          </div>
                          <h4 className="font-medium text-gray-800">
                            Daily Habits
                          </h4>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">
                          Morning hours show your highest productivity. Consider
                          scheduling important tasks early.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Wellbeing Tips
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                        <Eye className="h-5 w-5 text-indigo-600 mr-2" />
                        Reduce Eye Strain
                      </h4>
                      <ul className="space-y-2 text-gray-600 text-sm">
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>
                            Follow the 20-20-20 rule: every 20 minutes, look at
                            something 20 feet away for 20 seconds
                          </span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>
                            Adjust screen brightness to match your surroundings
                          </span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>
                            Use night mode in the evening to reduce blue light
                            exposure
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                        <Brain className="h-5 w-5 text-indigo-600 mr-2" />
                        Mental Wellbeing
                      </h4>
                      <ul className="space-y-2 text-gray-600 text-sm">
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>
                            Practice digital detox for at least 1 hour before
                            bed
                          </span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>
                            Use focus mode to reduce distractions during work
                          </span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>
                            Take regular breaks to prevent mental fatigue
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                        <Activity className="h-5 w-5 text-indigo-600 mr-2" />
                        Physical Wellbeing
                      </h4>
                      <ul className="space-y-2 text-gray-600 text-sm">
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>
                            Stand up and stretch every hour to improve
                            circulation
                          </span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>Maintain good posture while using devices</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>Stay hydrated throughout the day</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab Content */}
            {activeTab === "settings" && (
              <div>
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-6">
                    General Settings
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Daily Screen Time Limit (minutes)
                      </label>
                      <input
                        type="number"
                        value={dailyLimit}
                        onChange={handleLimitChange}
                        min="1"
                        max="1440"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Day Start Time
                      </label>
                      <input
                        type="time"
                        value={dayStart}
                        onChange={handleDayStartChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time Zone
                      </label>
                      <select
                        value={selectedTimeZone}
                        onChange={handleTimeZoneChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        {availableTimeZones.map((tz) => (
                          <option key={tz} value={tz}>
                            {formatTimeZone(tz)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Extension Status
                      </label>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={toggleExtension}
                          className={`px-4 py-2 rounded-md text-white font-medium ${
                            isActive
                              ? "bg-green-500 hover:bg-green-600"
                              : "bg-red-500 hover:bg-red-600"
                          }`}
                        >
                          {isActive ? (
                            <span className="flex items-center">
                              <Unlock className="h-4 w-4 mr-1" /> Active
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <Lock className="h-4 w-4 mr-1" /> Paused
                            </span>
                          )}
                        </button>
                        <button
                          onClick={resetTimeSpent}
                          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md font-medium transition-colors flex items-center"
                        >
                          <RefreshCw className="h-4 w-4 mr-1" /> Reset Timer
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-medium text-gray-800 mb-4">
                      Notifications
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-gray-700">
                            Browser Notifications
                          </h5>
                          <p className="text-sm text-gray-600">
                            Receive alerts when you reach time limits or
                            complete focus sessions
                          </p>
                        </div>
                        <button
                          onClick={requestNotificationPermission}
                          className={`px-4 py-2 rounded-md text-white font-medium ${
                            notificationPermission === "granted"
                              ? "bg-green-500 hover:bg-green-600"
                              : "bg-blue-600 hover:bg-blue-700"
                          }`}
                        >
                          {notificationPermission === "granted" ? (
                            <span className="flex items-center">
                              <Check className="h-4 w-4 mr-1" /> Enabled
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <Bell className="h-4 w-4 mr-1" /> Enable
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
