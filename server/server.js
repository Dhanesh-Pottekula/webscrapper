const express = require("express");
const cors = require("cors");
const http = require('http');
const { Server } = require('socket.io');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Your React app's URL
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(bodyParser.json());

// Store active monitoring sessions
const monitoringSessions = new Map();

// Function to monitor a webpage
async function monitorWebpage(url, socket) {
  try {
    const browser = await puppeteer.launch({ 
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1280, height: 800 });
    
    // Set longer timeout and wait until network is idle
    await page.setDefaultNavigationTimeout(60000); // Increase timeout to 60 seconds
    
    // Navigate to the URL with extended timeout
    await page.goto(url, { 
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 60000 
    });

    // Expose function to handle mutations
    await page.exposeFunction('handleMutation', (data) => {
      console.log('Mutation detected');
      socket.emit('pageUpdate', {
        type: 'mutation',
        data: data,
        timestamp: new Date().toISOString()
      });
    });

    // Set up mutation observer for the entire document
    await page.evaluate(() => {
      const observerTarget = document.documentElement;
      
      const mutationObserver = new MutationObserver((mutationsList) => {
        if (mutationsList.length > 0) {
          window.handleMutation({
            html: document.documentElement.outerHTML
          });
        }
      });

      mutationObserver.observe(observerTarget, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true
      });

      console.log('MutationObserver set up on document root');
    });

    // Get initial data
    const initialData = await page.evaluate(() => {
      return {
        type: 'pageContent',
        url: window.location.href,
        title: document.title,
        timestamp: new Date().toISOString(),
        elements: {
          html: document.documentElement.outerHTML
        }
      };
    });

    // Send initial data
    socket.emit('pageUpdate', initialData);

    // Store the monitoring session
    monitoringSessions.set(socket.id, {
      browser,
      page,
      url
    });
    
  } catch (error) {
    console.error('Error monitoring webpage:', error);
    socket.emit('error', { 
      message: 'Failed to monitor webpage',
      details: error.message 
    });
    
    // Clean up browser if it exists
    if (browser) {
      await browser.close();
    }
  }
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Handle start monitoring request
  socket.on('startMonitoring', async (url) => {
    console.log('Starting monitoring for:', url);
    await monitorWebpage(url, socket);
  });
  
  // Handle stop monitoring request
  socket.on('stopMonitoring', () => {
    const session = monitoringSessions.get(socket.id);
    if (session) {
      session.browser.close();
      monitoringSessions.delete(socket.id);
      console.log('Stopped monitoring for:', session.url);
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    const session = monitoringSessions.get(socket.id);
    if (session) {
      session.browser.close();
      monitoringSessions.delete(socket.id);
      console.log('Client disconnected, stopped monitoring for:', session.url);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



