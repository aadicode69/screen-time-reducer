const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", 
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

let inMemoryVisits = [];
let inMemorySettings = { dailyLimit: 120 };

// MongoDB connection with fallback
let isMongoConnected = false;

const connectToMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/screentime', {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });
    console.log('Connected to MongoDB');
    isMongoConnected = true;
    
    // If we have in-memory data, migrate it to MongoDB
    if (inMemoryVisits.length > 0) {
      await Visit.insertMany(inMemoryVisits);
      inMemoryVisits = [];
    }
    
    if (inMemorySettings) {
      await Settings.findOneAndUpdate(
        {},
        inMemorySettings,
        { upsert: true, new: true }
      );
    }
  } catch (err) {
    console.error('MongoDB connection error:', err);
    console.log('Using in-memory storage as fallback');
    isMongoConnected = false;
  }
};

// Try to connect to MongoDB
connectToMongoDB();

// Website visit schema
const visitSchema = new mongoose.Schema({
  url: String,
  duration: Number,
  timestamp: { type: Date, default: Date.now }
});

const Visit = mongoose.model('Visit', visitSchema);

// Settings schema
const settingsSchema = new mongoose.Schema({
  dailyLimit: { type: Number, default: 120 },
  lastUpdated: { type: Date, default: Date.now }
});

const Settings = mongoose.model('Settings', settingsSchema);

// Track active connections by session ID
const activeSessions = new Map();

// API Routes
// Get daily stats
app.get('/api/stats/daily', async (req, res) => {
  try {
    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let totalTime = 0;
    
    if (isMongoConnected) {
      // Find all visits from today
      const visits = await Visit.find({
        timestamp: { $gte: today }
      });
      
      // Calculate total time
      totalTime = visits.reduce((total, visit) => total + visit.duration, 0);
    } else {
      // Use in-memory data
      totalTime = inMemoryVisits
        .filter(visit => visit.timestamp >= today)
        .reduce((total, visit) => total + visit.duration, 0);
    }
    
    res.json({ totalTime });
  } catch (error) {
    console.error('Error fetching daily stats:', error);
    res.status(500).json({ error: 'Failed to fetch daily stats' });
  }
});

// Get website stats
app.get('/api/stats/websites', async (req, res) => {
  try {
    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let websites = [];
    
    if (isMongoConnected) {
      // Find all visits from today
      const visits = await Visit.find({
        timestamp: { $gte: today }
      });
      
      // Group by URL
      const websiteStats = {};
      visits.forEach(visit => {
        if (!websiteStats[visit.url]) {
          websiteStats[visit.url] = 0;
        }
        websiteStats[visit.url] += visit.duration;
      });
      
      // Convert to array format
      websites = Object.entries(websiteStats).map(([url, duration]) => ({
        url,
        duration
      }));
    } else {
      // Use in-memory data
      const todayVisits = inMemoryVisits.filter(visit => visit.timestamp >= today);
      
      // Group by URL
      const websiteStats = {};
      todayVisits.forEach(visit => {
        if (!websiteStats[visit.url]) {
          websiteStats[visit.url] = 0;
        }
        websiteStats[visit.url] += visit.duration;
      });
      
      // Convert to array format
      websites = Object.entries(websiteStats).map(([url, duration]) => ({
        url,
        duration
      }));
    }
    
    // Sort websites by duration (descending)
    websites.sort((a, b) => b.duration - a.duration);
    
    res.json({ websites });
  } catch (error) {
    console.error('Error fetching website stats:', error);
    res.status(500).json({ error: 'Failed to fetch website stats' });
  }
});

// Reset stats
app.post('/api/stats/reset', async (req, res) => {
  try {
    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (isMongoConnected) {
      // Delete all visits from today
      await Visit.deleteMany({
        timestamp: { $gte: today }
      });
    } else {
      // Filter out today's visits from in-memory storage
      inMemoryVisits = inMemoryVisits.filter(visit => visit.timestamp < today);
    }
    
    // Notify all clients about the reset
    io.emit('statsReset');
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error resetting stats:', error);
    res.status(500).json({ error: 'Failed to reset stats' });
  }
});

// Update daily limit
app.post('/api/settings/limit', async (req, res) => {
  try {
    const { limit } = req.body;
    
    if (!limit || isNaN(limit) || limit <= 0) {
      return res.status(400).json({ error: 'Invalid limit value' });
    }
    
    if (isMongoConnected) {
      // Update or create settings
      await Settings.findOneAndUpdate(
        {},
        { dailyLimit: limit, lastUpdated: new Date() },
        { upsert: true, new: true }
      );
    } else {
      // Update in-memory settings
      inMemorySettings = {
        ...inMemorySettings,
        dailyLimit: limit,
        lastUpdated: new Date()
      };
    }
    
    // Notify all clients about the setting change
    io.emit('settingsUpdated', { dailyLimit: limit });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating daily limit:', error);
    res.status(500).json({ error: 'Failed to update daily limit' });
  }
});

// Get settings
app.get('/api/settings', async (req, res) => {
  try {
    let settings;
    
    if (isMongoConnected) {
      settings = await Settings.findOne();
    } else {
      settings = inMemorySettings;
    }
    
    res.json(settings || { dailyLimit: 120 });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Bulk update function to reduce database operations
const saveVisitsInBulk = async () => {
  if (!isMongoConnected || activeSessions.size === 0) return;
  
  const bulkOps = [];
  const visitedUrls = new Set();
  
  for (const [sessionId, sessionData] of activeSessions.entries()) {
    if (sessionData.currentUrl) {
      visitedUrls.add(sessionData.currentUrl);
      bulkOps.push({
        updateOne: {
          filter: { 
            url: sessionData.currentUrl,
            timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
          },
          update: { $inc: { duration: sessionData.incrementAmount } },
          upsert: true
        }
      });
      
      // Reset the increment amount after committing
      sessionData.incrementAmount = 0;
    }
  }
  
  if (bulkOps.length > 0) {
    try {
      await Visit.bulkWrite(bulkOps);
      
      // Send consolidated updates to clients
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Get updated stats for today only for the affected URLs
      const updatedVisits = await Visit.find({
        url: { $in: Array.from(visitedUrls) },
        timestamp: { $gte: today }
      });
      
      // Create a map of URL to total duration
      const urlDurations = {};
      updatedVisits.forEach(visit => {
        if (!urlDurations[visit.url]) {
          urlDurations[visit.url] = 0;
        }
        urlDurations[visit.url] += visit.duration;
      });
      
      // Send batched updates
      Object.entries(urlDurations).forEach(([url, duration]) => {
        io.emit('durationUpdate', { url, duration, isBatchUpdate: true });
      });
      
      // Also send total time update
      const allVisits = await Visit.find({ timestamp: { $gte: today } });
      const totalTime = allVisits.reduce((total, visit) => total + visit.duration, 0);
      io.emit('totalTimeUpdate', { totalTime });
      
    } catch (error) {
      console.error('Error performing bulk write:', error);
    }
  }
};

// Set up periodic bulk updates (every 5 seconds)
setInterval(saveVisitsInBulk, 5000);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Initialize session data
  activeSessions.set(socket.id, {
    currentUrl: null,
    incrementAmount: 0,
    lastUpdate: Date.now()
  });

  socket.on('startTracking', async (url) => {
    console.log('Started tracking:', url);
    
    try {
      const sessionData = activeSessions.get(socket.id);
      sessionData.currentUrl = url;
      sessionData.incrementAmount = 0;
      sessionData.lastUpdate = Date.now();
      
      // Get current duration for this URL today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let currentDuration = 0;
      
      if (isMongoConnected) {
        const visit = await Visit.findOne({ 
          url,
          timestamp: { $gte: today }
        });
        
        if (visit) {
          currentDuration = visit.duration;
        }
      } else {
        // Use in-memory data
        const matchingVisits = inMemoryVisits
          .filter(visit => visit.url === url && visit.timestamp >= today);
          
        currentDuration = matchingVisits.reduce((total, visit) => total + visit.duration, 0);
      }
      
      // Send initial duration
      socket.emit('durationUpdate', { url, duration: currentDuration });
    } catch (error) {
      console.error('Error starting tracking:', error);
    }
  });

  socket.on('updateDuration', async (data) => {
    const { url } = data;
    const incrementAmount = 1; // 1 second increment
    
    try {
      const sessionData = activeSessions.get(socket.id);
      
      if (sessionData) {
        // If URL changed, commit the previous URL's data
        if (sessionData.currentUrl && sessionData.currentUrl !== url && sessionData.incrementAmount > 0) {
          if (isMongoConnected) {
            await Visit.findOneAndUpdate(
              { 
                url: sessionData.currentUrl,
                timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
              },
              { $inc: { duration: sessionData.incrementAmount } },
              { upsert: true, new: true }
            );
          } else {
            // Update in-memory storage
            const visitIndex = inMemoryVisits.findIndex(
              visit => visit.url === sessionData.currentUrl && 
              visit.timestamp >= new Date(Date.now() - 24 * 60 * 60 * 1000)
            );
            
            if (visitIndex !== -1) {
              inMemoryVisits[visitIndex].duration += sessionData.incrementAmount;
            } else {
              inMemoryVisits.push({
                url: sessionData.currentUrl,
                duration: sessionData.incrementAmount,
                timestamp: new Date()
              });
            }
          }
        }
        
        // Update session data for the new URL
        sessionData.currentUrl = url;
        sessionData.incrementAmount += incrementAmount;
        sessionData.lastUpdate = Date.now();
        
        // Don't emit update here - wait for bulk update
      }
    } catch (error) {
      console.error('Error updating duration:', error);
    }
  });

  socket.on('disconnect', async () => {
    console.log('User disconnected:', socket.id);
    
    // Save any pending duration updates
    const sessionData = activeSessions.get(socket.id);
    if (sessionData && sessionData.currentUrl && sessionData.incrementAmount > 0) {
      try {
        if (isMongoConnected) {
          await Visit.findOneAndUpdate(
            { 
              url: sessionData.currentUrl,
              timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            },
            { $inc: { duration: sessionData.incrementAmount } },
            { upsert: true, new: true }
          );
        } else {
          // Update in-memory storage
          const visitIndex = inMemoryVisits.findIndex(
            visit => visit.url === sessionData.currentUrl && 
            visit.timestamp >= new Date(Date.now() - 24 * 60 * 60 * 1000)
          );
          
          if (visitIndex !== -1) {
            inMemoryVisits[visitIndex].duration += sessionData.incrementAmount;
          } else {
            inMemoryVisits.push({
              url: sessionData.currentUrl,
              duration: sessionData.incrementAmount,
              timestamp: new Date()
            });
          }
        }
      } catch (error) {
        console.error('Error saving final duration update:', error);
      }
    }
    
    // Remove from active sessions
    activeSessions.delete(socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});