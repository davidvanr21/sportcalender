import { Match } from "../types";

// Football API credentials
const API_KEY = "86a4fba1542ddddc8f7e57215aa37c52";
const API_URL = "https://v3.football.api-sports.io";

// Function to fetch matches for a specific team
export const fetchMatchesForTeam = async (teamName: string): Promise<Match[]> => {
  try {
    console.log(`📋 Starting API process for ${teamName}...`);
    
    // First get the team ID from the API
    console.log(`🔍 Step 1: Looking up team ID for "${teamName}"`);
    const teamData = await fetchTeamId(teamName);
    
    if (!teamData) {
      console.error(`❌ Team "${teamName}" not found in API`);
      console.log(`⚠️ Falling back to generated data`);
      return generateMatchesForTeam(teamName); // Fallback
    }
    
    // Then fetch fixtures for that team
    console.log(`✅ Team found! ID: ${teamData.id}, Name: ${teamData.name}`);
    console.log(`🔍 Step 2: Fetching fixtures for team ID ${teamData.id}`);
    
    const fixtures = await fetchFixtures(teamData.id);
    
    if (fixtures.length === 0) {
      console.log(`⚠️ No fixtures found, falling back to generated data`);
      return generateMatchesForTeam(teamName); // Fallback if no fixtures
    }
    
    console.log(`✅ Success! Found ${fixtures.length} upcoming matches`);
    return fixtures;
  } catch (error) {
    console.error("❌ Error in fetch process:", error);
    console.log(`⚠️ Falling back to generated data due to error`);
    return generateMatchesForTeam(teamName); // Fallback to generated data
  }
};

// Helper function to get team ID from name
const fetchTeamId = async (teamName: string) => {
  try {
    // Using 2023 season instead of 2024 (free plan limitation)
    const url = `${API_URL}/teams?name=${encodeURIComponent(teamName)}&league=88&season=2023`;
    console.log(`📡 API Request: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-apisports-key': API_KEY
      }
    });
    
    const data = await response.json();
    console.log(`📊 API Response for team lookup:`, data);
    
    if (data.response && data.response.length > 0) {
      return {
        id: data.response[0].team.id,
        name: data.response[0].team.name
      };
    }
    return null;
  } catch (error) {
    console.error("❌ Error fetching team ID:", error);
    return null;
  }
};

// Helper function to fetch fixtures
const fetchFixtures = async (teamId: number): Promise<Match[]> => {
  try {
    // Using 2023 season instead of 2024 (free plan limitation)
    const url = `${API_URL}/fixtures?team=${teamId}&league=88&season=2023&status=NS`;
    console.log(`📡 API Request: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-apisports-key': API_KEY
      }
    });
    
    const data = await response.json();
    console.log(`📊 API Response for fixtures:`, data);
    
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
      venue: fixture.fixture.venue?.name || "Stadium",
    }));
  } catch (error) {
    console.error("❌ Error fetching fixtures:", error);
    return [];
  }
};

// Helper function to generate sample matches for development/fallback
const generateMatchesForTeam = (teamName: string): Match[] => {
  console.log(`🔄 Generating fallback data for ${teamName}`);
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
