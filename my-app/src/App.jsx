import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import Scorecard from "./components/Scorecard";
import "./App.css";

function App() {
  const [url, setUrl] = useState("");
  const [isMonitoring, setIsMonitoring] = useState(false);
  const socketRef = useRef(null);
  const [htmlData, setHtmlData] = useState("");
  const [error, setError] = useState(null);

  // Function to transform URL to fullScorecard format
  const transformUrl = (inputUrl) => {
    try {
      // Check if the URL contains InternationalScores/
      if (inputUrl.includes("InternationalScores/")) {
        // Replace any word between InternationalScores/ and .do with fullScorecard
        return inputUrl.replace(/InternationalScores\/[^/]+\.do/, "InternationalScores/fullScorecard.do");
      }
      return inputUrl;
    } catch (error) {
      console.error("Error transforming URL:", error);
      return inputUrl;
    }
  };

  useEffect(() => {
    // Initialize Socket.IO connection
    socketRef.current = io("http://localhost:5000");

    socketRef.current.on("connect", () => {
      console.log("Socket.IO Connected");
    });

    socketRef.current.on("disconnect", () => {
      console.log("Socket.IO Disconnected");
      setIsMonitoring(false);
    });

    socketRef.current.on("pageUpdate", (data) => {
      console.log("Received page update:", data);
      // Extract HTML from the data structure
      if (data.type === "pageContent" && data.elements?.html) {
        setHtmlData(data.elements.html);
      } else if (data.type === "mutation" && data.data?.html) {
        setHtmlData(data.data.html);
      } else if (data.html) {
        setHtmlData(data.html);
      }
    });

    socketRef.current.on("error", (error) => {
      console.error("Socket error:", error);
      setError("Connection error: " + (error.message || "Unknown error"));
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const handleStartMonitoring = () => {
    if (url && socketRef.current) {
      socketRef.current.emit("startMonitoring", url);
      setIsMonitoring(true);
    }
  };

  const handleStopMonitoring = () => {
    if (socketRef.current) {
      socketRef.current.emit("stopMonitoring");
      setIsMonitoring(false);
      setHtmlData("");
    }
  };

  if (error) {
    return <div className="error">{error}</div>;
  }

  const handleUrlChange = (e) => {
    const transformedUrl = transformUrl(e.target.value);
    setUrl(transformedUrl);
    setHtmlData("");
  };
  return (
    <div className="app-container">
      <div className="header">
        <h1>Cricket Live Scorecard</h1>
      </div>

      <div className="monitoring-controls">
        {!isMonitoring ? (
          <div className="url-input-container">
            <input
              type="url"
              value={url}
              onChange={handleUrlChange}
              placeholder="Enter URL to monitor"
              className="url-input"
            />
            <button
              onClick={handleStartMonitoring}
              disabled={!url}
              className="start-button"
            >
              Start Monitoring
            </button>
          </div>
        ) : (
          <div className="stop-container">
            <button onClick={handleStopMonitoring} className="stop-button flex justify-center items-center ">
             {!htmlData&& <span className="flex justify-center items-center mr-3">
                <span className="w-6 h-6 border-4 border-t-transparent border-white rounded-full animate-spin"></span>
              </span>}
              Stop Monitoring
            </button>
          </div>
        )}
      </div>

      {htmlData && isMonitoring && <Scorecard htmlData={htmlData} />}
    </div>
  );
}

export default App;
