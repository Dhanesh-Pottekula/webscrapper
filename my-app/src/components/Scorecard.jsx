import React, { useState } from 'react';
import "./Scorecard.css";
import parse from "html-react-parser";
import staticHtml from "../assets/statichtml";

const Scorecard = ({ htmlData }) => {
  // Use either the provided HTML data or the static HTML
  const htmlToParse = htmlData;
  
  // State to track which team's content to display
  const [activeTeam, setActiveTeam] = useState('team1');
  
  const parser = new DOMParser();
  const htmlDoc = parser.parseFromString(htmlToParse, "text/html");
  const team1Content = htmlDoc.getElementById("ballByBallTeam1");
  const team2Content = htmlDoc.getElementById("ballByBallTeam2");
  
  // Function to toggle between teams
  const toggleTeam = (team) => {
    setActiveTeam(team);
  };
  
  return (
    <div className="scorecard">
      <div className="scorecard-container">
        {/* Team Toggle Buttons */}
        <div className="team-toggle">
          <button 
            className={`toggle-btn ${activeTeam === 'team1' ? 'active' : ''}`}
            onClick={() => toggleTeam('team1')}
          >
            New Zealand Innings
          </button>
          <button 
            className={`toggle-btn ${activeTeam === 'team2' ? 'active' : ''}`}
            onClick={() => toggleTeam('team2')}
          >
            Pakistan Innings
          </button>
        </div>
        
        {/* Team 1 Batting */}
        {activeTeam === 'team1' && (
          <div className="team-section">
            <h2 className="team-title">New Zealand Innings</h2>
            <div className="batting-table">
              {team1Content ? parse(team1Content.innerHTML) : "No data available"}
            </div>
          </div>
        )}

        {/* Team 2 Batting */}
        {activeTeam === 'team2' && (
          <div className="team-section">
            <h2 className="team-title">Pakistan Innings</h2>
            <div className="batting-table">
              {team2Content ? parse(team2Content.innerHTML) : "No data available"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Scorecard;
