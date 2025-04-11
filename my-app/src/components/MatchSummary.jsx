import React from 'react';
import './MatchSummary.css';

const MatchSummary = ({ matchSummaryElement, setBattingTeam, team1Content, team2Content, battingTeam }) => {
  const extractCleanMatchData = (element) => {
    if (!element) return null;

    const teamElements = element.querySelectorAll('.win, .lose');
    const teams = Array.from(teamElements).map((teamEl,index) => {
      const name = teamEl.querySelector('.teamName')?.textContent.trim() || '';
      const score = teamEl.querySelector('span:nth-of-type(2)')?.textContent.trim() || '';
      const overs = teamEl.querySelector('p')?.textContent.trim().replace(/\s+/g, ' ') || '';
      
      // Parse overs to determine if team is batting
      let isBatting = false;
      if (overs && overs.includes('/')) {
        const [current, max] = overs.split('/');
        const currentOvers = parseFloat(current);
        const maxOvers = parseFloat(max.split(' ')[0]);
        
        // Team is batting if they have overs less than max
        isBatting = currentOvers < maxOvers;
      }
      if(isBatting){
        setBattingTeam(index===0?"team1":"team2");
      }
      return { name, score, overs, isBatting };
    });

    const resultElement = element.parentElement.querySelector('h3:not(.ms-league-name)');
    const resultText = resultElement ? resultElement.textContent.trim() : '';

    return { teams, resultText };
  };

  const matchData = extractCleanMatchData(matchSummaryElement);
  
  const trimName = (name) => {
    return name.split(' ')[0];
  }
  
  // Simple function to get not out batsmen
  const getNotOutBatsmen = (content) => {
    if (!content) return [];
    
    const notOutBatsmen = [];
    const rows = content.querySelectorAll('tr');
    
    rows.forEach(row => {
      const nameElement = row.querySelector('a b');
      const dismissalElement = row.querySelector('th:nth-child(2)');
      
      if (nameElement && dismissalElement) {
        const name = nameElement.textContent.trim();
        const dismissal = dismissalElement.textContent.trim();
        
        if (dismissal === 'not out') {
          notOutBatsmen.push(name);
        }
      }
    });
    
    return notOutBatsmen;
  }
  
  const getCurrentBowler = (content) => {
    if (!content) return null;
    
    // Find the match-innings-bottom-all container
    const bottomContainer =  content.querySelector('.match-innings-bottom-all');
    console.log(bottomContainer)
    if (!bottomContainer) return null;
    
    // Find the table with id match-table-innings
    const table = bottomContainer.querySelector('.match-table-innings');
    if (!table) return null;
    
    // Get all rows from the table
    const rows = table.querySelectorAll('tr');
    if (rows.length === 0) return null;
    
    // Get the last row
    const lastRow = rows[rows.length - 1];
    
    // Get the bowler name from the last row
    const bowlerElement = lastRow.querySelector('a b');
    if (!bowlerElement) return null;
    
    return bowlerElement.textContent.trim();
  }
  
  // Create team objects
  const createTeamObjects = () => {
    if (!matchData || !matchData.teams || matchData.teams.length < 2) {
      return { battingTeam: null, bowlingTeam: null };
    }
    
    console.log(matchData.teams)
    
    // If we already know which team is batting from the battingTeam prop
    let battingTeamData, bowlingTeamData;
    
    if (battingTeam === 'team1') {
      battingTeamData = matchData.teams[0];
      bowlingTeamData = matchData.teams[1];
    } else if (battingTeam === 'team2') {
      battingTeamData = matchData.teams[1];
      bowlingTeamData = matchData.teams[0];
    } else {
      // Fallback to using isBatting flag
      battingTeamData = matchData.teams.find(team => team.isBatting);
      bowlingTeamData = matchData.teams.find(team => !team.isBatting);
    }
    
    console.log('Batting Team Data:', battingTeamData);
    console.log('Bowling Team Data:', bowlingTeamData);
    
    // Create the batting team object
    const battingTeamObject = battingTeamData ? {
      name: battingTeamData.name,
      score: battingTeamData.score,
      overs: battingTeamData.overs,
      notOutBatsmen: getNotOutBatsmen(battingTeam==='team1'?team1Content:team2Content)
    } : null;
    
    // Create the bowling team object
    const bowlingTeamObject = bowlingTeamData ? {
      name: bowlingTeamData.name,
      score: bowlingTeamData.score,
      overs: bowlingTeamData.overs,
      currentBowler: getCurrentBowler(battingTeam==='team1'?team2Content:team1Content)
    } : null;
    
    return {
      battingTeam: battingTeamObject,
      bowlingTeam: bowlingTeamObject
    };
  }
  
  // Get the team objects
  const { battingTeam: battingTeamObject, bowlingTeam: bowlingTeamObject } = createTeamObjects();
  
  console.log('Batting Team:', battingTeamObject);
  console.log('Bowling Team:', bowlingTeamObject);
  
  return (
    <div className="w-full h-[50px] bg-gray-900 text-white rounded-lg shadow-lg overflow-hidden">
      {matchData ? (
        <div className="h-full flex">
          {/* Status Indicator */}
          <div className="w-1 bg-green-500"></div>
          
          {/* Teams Score Card - Ultra Compact */}
          <div className="flex-1 grid grid-cols-2 h-full">
            {/* Batting Team */}
            {battingTeamObject && (
              <div className="bg-blue-900 p-1 flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="font-bold text-[10px] truncate">{battingTeamObject.name}</div>
                    <div className="text-base font-bold ml-2">{battingTeamObject.score}</div>
                  </div>
                  <div className="text-yellow-300 text-[8px] bg-yellow-900 px-1 rounded">BATTING</div>
                </div>
                <div className="flex justify-between items-center">
                <div className="text-[8px] text-gray-300">
                  <span className="font-semibold">Overs:</span> {battingTeamObject.overs}
                </div>
                {battingTeamObject.notOutBatsmen && battingTeamObject.notOutBatsmen.length > 0 && (
                  <div className="text-[8px] text-gray-300 truncate">
                    <span className="font-semibold">In Strike:</span> {battingTeamObject.notOutBatsmen.join(', ')}
                  </div>
                )}
                </div>
              </div>
            )}
            
            {/* Bowling Team */}
            {bowlingTeamObject && (
              <div className="bg-red-900 p-1 flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="font-bold text-[10px] truncate">{bowlingTeamObject.name}</div>
                    <div className="text-base font-bold ml-2">{bowlingTeamObject.score}</div>
                  </div>
                  <div className="text-red-300 text-[8px] bg-red-800 px-1 rounded">BOWLING</div>
                </div>
                <div className="flex justify-between items-center">

                <div className="text-[8px] text-gray-300">
                  <span className="font-semibold">Overs:</span> {bowlingTeamObject.overs}
                </div>
                {bowlingTeamObject.currentBowler && (
                  <div className="text-[8px] text-gray-300 truncate">
                    <span className="font-semibold">Bowler:</span> {bowlingTeamObject.currentBowler}
                  </div>
                )}
              </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="h-full flex items-center justify-center text-[10px]">Loading...</div>
      )}
    </div>
  );
};

export default MatchSummary;

