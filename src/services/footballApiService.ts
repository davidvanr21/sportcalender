
import { Match } from "../types";

const API_KEY = "demo"; // Replace with your actual API key if needed

// Base URL for the football-data.org API
const API_BASE_URL = "https://api.football-data.org/v4";

// Function to fetch matches for a specific team
export const fetchMatchesForTeam = async (teamName: string): Promise<Match[]> => {
  try {
    // For demo purposes, simulate API fetch with the existing data generator
    // In a real implementation, you would make an actual API call here
    console.log(`Fetching matches for ${teamName}...`);
    
    // This is a fallback for demo/development
    return generateMatchesForTeam(teamName);
  } catch (error) {
    console.error("Error fetching matches:", error);
    return [];
  }
};

// Helper function to generate sample matches for development/fallback
const generateMatchesForTeam = (teamName: string): Match[] => {
  const competitions = ["Eredivisie", "KNVB Beker", "Champions League", "Europa League"];
  const venues = ["Johan Cruijff Arena", "Philips Stadion", "De Kuip", "AFAS Stadion", "Grolsch Veste"];
  const eredivisieTeams = [
    "Ajax Amsterdam", "PSV Eindhoven", "Feyenoord Rotterdam", "AZ Alkmaar", 
    "FC Utrecht", "FC Twente", "Vitesse", "FC Groningen", "SC Heerenveen",
    "Sparta Rotterdam", "RKC Waalwijk", "NEC Nijmegen", "Go Ahead Eagles",
    "Fortuna Sittard", "PEC Zwolle", "Heracles Almelo", "Excelsior", "Willem II"
  ];
  
  const matches: Match[] = [];
  const startDate = new Date();
  
  // Generate upcoming matches
  for (let i = 0; i < 20; i++) {
    const matchDate = new Date(startDate);
    matchDate.setDate(startDate.getDate() + Math.floor(Math.random() * 90)); // Next 3 months
    
    const isHome = Math.random() > 0.5;
    // Remove the current team from possible opponents
    const possibleOpponents = eredivisieTeams.filter(team => team !== teamName);
    const opponent = possibleOpponents[Math.floor(Math.random() * possibleOpponents.length)];
    
    const competition = i < 15 ? "Eredivisie" : competitions[Math.floor(Math.random() * competitions.length)];
    const venue = isHome ? 
      venues[Math.floor(Math.random() * venues.length)] :
      "Uitstadion"; // Generic away stadium
    
    matches.push({
      id: `match-${teamName}-${i}`,
      homeTeam: isHome ? teamName : opponent,
      awayTeam: isHome ? opponent : teamName,
      date: matchDate.toISOString(),
      competition: competition,
      venue: venue,
    });
  }
  
  // Sort matches by date
  return matches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};
