
import { Match } from "../types";

// Generate matches for the next 6 months
const generateMatches = (teamId: string): Match[] => {
  const competitions = ["Competitie", "Champions League", "Europa League", "Beker"];
  const venues = ["Thuis", "Uit"];
  const teams = ["Team A", "Team B", "Team C", "Team D", "Team E", "Team F"];
  const matches: Match[] = [];
  
  // Current date
  const startDate = new Date();
  
  // Generate 20 matches over the next 6 months
  for (let i = 0; i < 20; i++) {
    // Random date within the next 6 months
    const matchDate = new Date(startDate);
    matchDate.setDate(startDate.getDate() + Math.floor(Math.random() * 180));
    
    const isHome = Math.random() > 0.5;
    const opponentIndex = Math.floor(Math.random() * teams.length);
    
    matches.push({
      id: `match-${teamId}-${i}`,
      homeTeam: isHome ? teamId : teams[opponentIndex],
      awayTeam: isHome ? teams[opponentIndex] : teamId,
      date: matchDate.toISOString(),
      competition: competitions[Math.floor(Math.random() * competitions.length)],
      venue: isHome ? "Thuis" : "Uit",
    });
  }
  
  // Sort matches by date
  return matches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

// Function to get matches for a specific team
export const getMatchesForTeam = (teamId: string): Match[] => {
  return generateMatches(teamId);
};
