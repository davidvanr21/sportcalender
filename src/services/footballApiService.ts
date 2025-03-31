
import { Match } from "../types";

// Football API credentials
const API_KEY = "86a4fba1542ddddc8f7e57215aa37c52";
const API_URL = "https://v3.football.api-sports.io";

// Function to fetch matches for a specific team
export const fetchMatchesForTeam = async (teamName: string): Promise<Match[]> => {
  try {
    console.log(`Fetching matches for ${teamName}...`);
    
    // First get the team ID from the API
    const teamData = await fetchTeamId(teamName);
    
    if (!teamData) {
      console.error(`Team ${teamName} not found in API`);
      return generateMatchesForTeam(teamName); // Fallback
    }
    
    // Then fetch fixtures for that team
    const fixtures = await fetchFixtures(teamData.id);
    return fixtures;
  } catch (error) {
    console.error("Error fetching matches:", error);
    return generateMatchesForTeam(teamName); // Fallback to generated data
  }
};

// Helper function to get team ID from name
const fetchTeamId = async (teamName: string) => {
  try {
    const response = await fetch(`${API_URL}/teams?name=${encodeURIComponent(teamName)}&league=88&season=2024`, {
      method: 'GET',
      headers: {
        'x-apisports-key': API_KEY
      }
    });
    
    const data = await response.json();
    
    if (data.response && data.response.length > 0) {
      return {
        id: data.response[0].team.id,
        name: data.response[0].team.name
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching team ID:", error);
    return null;
  }
};

// Helper function to fetch fixtures
const fetchFixtures = async (teamId: number): Promise<Match[]> => {
  try {
    // Fetch upcoming fixtures for this team
    const response = await fetch(`${API_URL}/fixtures?team=${teamId}&league=88&season=2024&status=NS`, {
      method: 'GET',
      headers: {
        'x-apisports-key': API_KEY
      }
    });
    
    const data = await response.json();
    
    if (!data.response) {
      throw new Error("Invalid API response");
    }
    
    // Map API data to our Match format
    return data.response.map((fixture: any) => ({
      id: fixture.fixture.id.toString(),
      homeTeam: fixture.teams.home.name,
      awayTeam: fixture.teams.away.name,
      date: fixture.fixture.date, // ISO string
      competition: "Eredivisie",
      venue: fixture.fixture.venue?.name || (fixture.teams.home.name === teamId ? "Thuis" : "Uit"),
    }));
  } catch (error) {
    console.error("Error fetching fixtures:", error);
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
