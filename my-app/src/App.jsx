import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

function App() {
  const [url, setUrl] = useState('');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const socketRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    // Initialize Socket.IO connection
    socketRef.current = io('http://localhost:5000');

    socketRef.current.on('connect', () => {
      console.log('Socket.IO Connected');
      setConnectionStatus('Connected');
    });

    socketRef.current.on('disconnect', () => {
      console.log('Socket.IO Disconnected');
      setConnectionStatus('Disconnected');
      setIsMonitoring(false);
    });

    socketRef.current.on('pageUpdate', (data) => {
      console.log('Received update:', data);
      
      if (contentRef.current) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = data.data?.html || data.elements?.html;
        const bodyContent = tempDiv.querySelector('body')?.innerHTML || tempDiv.innerHTML;
        contentRef.current.innerHTML = bodyContent;
      }
    });

    socketRef.current.on('error', (error) => {
      console.error('Socket error:', error);
      setConnectionStatus('Error');
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const handleStartMonitoring = () => {
    if (url && socketRef.current) {
      socketRef.current.emit('startMonitoring', url);
      setIsMonitoring(true);
    }
  };

  const handleStopMonitoring = () => {
    if (socketRef.current) {
      socketRef.current.emit('stopMonitoring');
      setIsMonitoring(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-blue-800 mb-4">Page Content Monitor</h1>
      
      {/* Connection Status */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Connection Status: <span className={connectionStatus === 'Connected' ? 'text-green-500' : 'text-red-500'}>
            {connectionStatus}
          </span>
        </p>
      </div>

      {/* URL Input and Controls */}
      <div className="mb-4 space-y-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL to monitor"
          className="w-full p-2 border rounded"
          disabled={isMonitoring}
        />
        <div className="space-x-2">
          <button
            onClick={handleStartMonitoring}
            disabled={!url || isMonitoring}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Start Monitoring
          </button>
          <button
            onClick={handleStopMonitoring}
            disabled={!isMonitoring}
            className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-300"
          >
            Stop Monitoring
          </button>
        </div>
      </div>

      {/* Page Content */}
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2">Page Content</h2>
        <div 
          ref={contentRef}
          className="rendered-content bg-white p-4 rounded overflow-auto max-h-[600px]"
          style={{
            maxWidth: '100%',
            wordWrap: 'break-word'
          }}
        />
      </div>
    </div>
  );
}

export default App;