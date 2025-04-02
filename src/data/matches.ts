
import { Match } from "../types";
import { fetchMatchesForTeam } from "../services/footballApiService";

// Function to get matches for a specific team
export const getMatchesForTeam = async (teamName: string): Promise<Match[]> => {
  return await fetchMatchesForTeam(teamName);
};

// Fallback for non-async contexts
export const getMatchesForTeamSync = (teamName: string): Match[] => {
  console.log("Using synchronous fallback for team matches");
  const competitions = ["Dutch Eredivisie", "KNVB Beker", "Champions League", "Europa League"];
  const venues = ["Thuis", "Uit"];
  const teams = ["Ajax Amsterdam", "PSV Eindhoven", "Feyenoord Rotterdam", "AZ Alkmaar"];
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
    const opponent = teams[opponentIndex] === teamName ? teams[(opponentIndex + 1) % teams.length] : teams[opponentIndex];
    
    matches.push({
      id: `match-${teamName}-${i}`,
      homeTeam: isHome ? teamName : opponent,
      awayTeam: isHome ? opponent : teamName,
      date: matchDate.toISOString().split('T')[0],
      time: "20:00",
      competition: competitions[Math.floor(Math.random() * competitions.length)],
      venue: isHome ? "Thuis" : "Uit",
      status: "Scheduled"
    });
  }
  
  // Sort matches by date
  return matches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};
