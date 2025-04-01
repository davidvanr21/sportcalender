import { Match } from "../types";

// Sportmonks API credentials
const API_KEY = "WuKof3UMKQxjepACx50Lx62Z7yiV9THJ87QGITx0ob8GL8sfJBDUEnuZiwp9";
const API_URL = "https://api.sportmonks.com/v3";

// Function to fetch upcoming Eredivisie matches
export const fetchUpcomingEredivisieMatches = async (): Promise<Match[]> => {
  try {
    console.log("📋 Starting API process for Eredivisie matches...");
    
    // Eredivisie league ID in SportMonks API
    const eredivisieLeagueId = 1; // This is the ID for Eredivisie in Sportmonks
    
    // Get current season ID - typically the one with the latest start date
    console.log(`🔍 Step 1: Getting current Eredivisie season`);
    const seasonId = await getCurrentEredivisieSeason();
    
    if (!seasonId) {
      console.error("❌ Could not determine current Eredivisie season");
      return generateSampleMatches(); // Fallback
    }
    
    console.log(`✅ Found current Eredivisie season ID: ${seasonId}`);
    console.log(`🔍 Step 2: Fetching Eredivisie fixtures`);
    
    // Get upcoming fixtures
    const fixtures = await fetchEredivisieFixtures(seasonId);
    
    if (fixtures.length === 0) {
      console.log(`⚠️ No fixtures found, generating sample data`);
      return generateSampleMatches(); // Fallback if no fixtures
    }
    
    console.log(`✅ Success! Found ${fixtures.length} upcoming Eredivisie matches`);
    return fixtures;
  } catch (error) {
    console.error("❌ Error fetching Eredivisie matches:", error);
    return generateSampleMatches(); // Fallback to generated data
  }
};

// Helper to get current season ID for Eredivisie
const getCurrentEredivisieSeason = async (): Promise<number | null> => {
  try {
    const url = `${API_URL}/football/leagues/1?include=currentSeason`;
    console.log(`📡 API Request: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `${API_KEY}`
      }
    });
    
    const data = await response.json();
    console.log(`📊 API Response for league:`, data);
    
    if (data.data?.currentSeason?.id) {
      return data.data.currentSeason.id;
    }
    
    // Fallback: get seasons and pick most recent
    const seasonsUrl = `${API_URL}/football/leagues/1/seasons`;
    const seasonsResponse = await fetch(seasonsUrl, {
      method: 'GET',
      headers: {
        'Authorization': `${API_KEY}`
      }
    });
    
    const seasonsData = await seasonsResponse.json();
    
    if (seasonsData.data && seasonsData.data.length > 0) {
      // Sort by start date descending and take first
      const sortedSeasons = seasonsData.data.sort((a: any, b: any) => {
        return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
      });
      return sortedSeasons[0].id;
    }
    
    return null;
  } catch (error) {
    console.error("❌ Error getting current season:", error);
    return null;
  }
};

// Helper to fetch Eredivisie fixtures
const fetchEredivisieFixtures = async (seasonId: number): Promise<Match[]> => {
  try {
    const currentDate = new Date().toISOString().split('T')[0]; // Today's date in YYYY-MM-DD
    const url = `${API_URL}/football/fixtures?filters[league_id]=1&filters[season_id]=${seasonId}&filters[date_from]=${currentDate}&include=participants;venue&sort=starting_at`;
    console.log(`📡 API Request: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `${API_KEY}`
      }
    });
    
    const data = await response.json();
    console.log(`📊 API Response for fixtures:`, data);
    
    if (!data.data) {
      throw new Error("Invalid API response");
    }
    
    // Map API data to our Match format
    return data.data.map((fixture: any) => ({
      id: fixture.id.toString(),
      homeTeam: fixture.participants?.find((p: any) => p.meta.location === 'home')?.name || "Unknown Team",
      awayTeam: fixture.participants?.find((p: any) => p.meta.location === 'away')?.name || "Unknown Team",
      date: fixture.starting_at || new Date().toISOString(),
      competition: "Eredivisie",
      venue: fixture.venue?.name || "Unknown Venue",
      status: fixture.status || "Not Started",
    }));
  } catch (error) {
    console.error("❌ Error fetching fixtures:", error);
    return [];
  }
};

// Helper for generating sample matches as fallback
const generateSampleMatches = (): Match[] => {
  console.log("🔄 Generating sample Eredivisie matches");
  
  const eredivisieTeams = [
    "Ajax Amsterdam", "PSV Eindhoven", "Feyenoord Rotterdam", "AZ Alkmaar", 
    "FC Utrecht", "FC Twente", "Vitesse", "FC Groningen", "SC Heerenveen",
    "Sparta Rotterdam", "RKC Waalwijk", "NEC Nijmegen", "Go Ahead Eagles",
    "Fortuna Sittard", "PEC Zwolle", "Heracles Almelo", "Excelsior", "Willem II"
  ];
  
  const venues = [
    "Johan Cruijff Arena", "Philips Stadion", "De Kuip", "AFAS Stadion", 
    "Galgenwaard", "Grolsch Veste", "GelreDome", "Euroborg", "Abe Lenstra Stadion"
  ];
  
  const matches: Match[] = [];
  const startDate = new Date();
  
  // Generate 20 upcoming matches
  for (let i = 0; i < 20; i++) {
    const matchDate = new Date(startDate);
    matchDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30)); // Next month
    
    const homeTeamIndex = Math.floor(Math.random() * eredivisieTeams.length);
    let awayTeamIndex;
    do {
      awayTeamIndex = Math.floor(Math.random() * eredivisieTeams.length);
    } while (awayTeamIndex === homeTeamIndex);
    
    const homeTeam = eredivisieTeams[homeTeamIndex];
    const awayTeam = eredivisieTeams[awayTeamIndex];
    const venue = venues[Math.floor(Math.random() * venues.length)];
    const status = "Scheduled";
    
    matches.push({
      id: `sample-match-${i}`,
      homeTeam: homeTeam,
      awayTeam: awayTeam,
      date: matchDate.toISOString(),
      competition: "Eredivisie",
      venue: venue,
      status: status,
    });
  }
  
  // Sort matches by date
  return matches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

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
    // Search for the team by name
    const url = `${API_URL}/football/teams/search/${encodeURIComponent(teamName)}`;
    console.log(`📡 API Request: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `${API_KEY}`
      }
    });
    
    const data = await response.json();
    console.log(`📊 API Response for team lookup:`, data);
    
    if (data.data && data.data.length > 0) {
      return {
        id: data.data[0].id,
        name: data.data[0].name
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
    // Get upcoming fixtures for the team
    const currentDate = new Date().toISOString().split('T')[0]; // Today's date in YYYY-MM-DD format
    const url = `${API_URL}/football/fixtures/byTeamId/${teamId}?filters=fixtureStartsAt:${currentDate}`;
    console.log(`📡 API Request: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `${API_KEY}`
      }
    });
    
    const data = await response.json();
    console.log(`📊 API Response for fixtures:`, data);
    
    if (!data.data) {
      throw new Error("Invalid API response");
    }
    
    // Map API data to our Match format
    return data.data.map((fixture: any) => ({
      id: fixture.id.toString(),
      homeTeam: fixture.participants.find((p: any) => p.meta.location === 'home')?.name || "Unknown Team",
      awayTeam: fixture.participants.find((p: any) => p.meta.location === 'away')?.name || "Unknown Team",
      date: fixture.starting_at || new Date().toISOString(), // Default to now if no date
      competition: fixture.league?.name || "Unknown League",
      venue: fixture.venue?.name || "Unknown Venue",
    }));
  } catch (error) {
    console.error("❌ Error fetching fixtures:", error);
    return [];
  }
};

// Helper function to generate sample matches for development/fallback
const generateMatchesForTeam = (teamName: string): Promise<Match[]> => {
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
