import React, { useState, useEffect } from "react";
import "./Scorecard.css";
import parse from "html-react-parser";
import staticHtml from "../assets/statichtml";

const Scorecard = ({ htmlData }) => {
  // Use either the provided HTML data or the static HTML
  const htmlToParse = htmlData || staticHtml;

  // State to track which team's content to display
  const [activeTeam, setActiveTeam] = useState("team1");

  const parser = new DOMParser();
  const htmlDoc = parser.parseFromString(htmlToParse, "text/html");
  const team1Content = htmlDoc.getElementById("ballByBallTeam1");
  const team2Content = htmlDoc.getElementById("ballByBallTeam2");
  const team1Title = htmlDoc.getElementById("ballByBallTeamTab1");
  const team2Title = htmlDoc.getElementById("ballByBallTeamTab2");
  const matchSummaryElement = htmlDoc.querySelector(".match-summary");
  // Function to toggle between teams
  const toggleTeam = (team) => {
    setActiveTeam(team);
  };

  const getMatchSummaryHtml = (matchSummaryElement) => {
    if (matchSummaryElement) {
      // Get the parent container
      const container = matchSummaryElement.parentElement;

      // Extract the result text (the h3 after match-summary)
      const resultElement = container.querySelector("h3:not(.ms-league-name)");
      const resultText = resultElement ? resultElement.textContent : "";

      // Create a clean version of the HTML with just the match summary and result
      const cleanHtml = `
          <div class="match-summary-container">
            ${matchSummaryElement.outerHTML}
            ${resultText ? `<h3 class="match-result">${resultText}</h3>` : ""}
          </div>
        `;

      return cleanHtml;
    }
  };

  return (
    <div className="scorecard">
      <div className="scorecard-container">
        {getMatchSummaryHtml(matchSummaryElement) ? (
          <div
            className="match-summary-wrapper"
            dangerouslySetInnerHTML={{
              __html: getMatchSummaryHtml(matchSummaryElement),
            }}
          />
        ) : (
          <div className="loading">Loading match data...</div>
        )}

        {/* Team Toggle Buttons */}
        <div className="team-toggle">
          <button
            className={`toggle-btn ${activeTeam === "team1" ? "active" : ""}`}
            onClick={() => toggleTeam("team1")}
          >
            {team1Title.textContent.trim()}
          </button>
          <button
            className={`toggle-btn ${activeTeam === "team2" ? "active" : ""}`}
            onClick={() => toggleTeam("team2")}
          >
            {team2Title.textContent.trim()}
          </button>
        </div>

        {/* Team 1 Batting */}
        {activeTeam === "team1" && (
          <div className="team-section">
            <div className="batting-table">
              {team1Content
                ? parse(team1Content.innerHTML)
                : "No data available"}
            </div>
          </div>
        )}

        {/* Team 2 Batting */}
        {activeTeam === "team2" && (
          <div className="team-section">
            <div className="batting-table">
              {team2Content
                ? parse(team2Content.innerHTML)
                : "No data available"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Scorecard;
