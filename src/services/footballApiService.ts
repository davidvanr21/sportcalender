import { Match } from "../types";

// TheSportsDB API information
const API_URL = "https://www.thesportsdb.com/api/v1/json/3";

// Cache for API responses to prevent reload differences
let cachedEredivisieMatches: Match[] | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
let lastFetchTime = 0;

// Function to fetch upcoming Eredivisie matches
export const fetchUpcomingEredivisieMatches = async (): Promise<Match[]> => {
  try {
    // Check if we have cached data that's still fresh
    const now = Date.now();
    if (cachedEredivisieMatches && now - lastFetchTime < CACHE_DURATION) {
      console.log("📋 Using cached Eredivisie matches data");
      return cachedEredivisieMatches;
    }
    
    console.log("📋 Starting API process for Eredivisie matches from TheSportsDB...");
    
    // Eredivisie league ID in TheSportsDB is 4337
    const eredivisieLeagueId = 4337;
    
    console.log(`🔍 Fetching Eredivisie fixtures from TheSportsDB`);
    const fixtures = await fetchLeagueMatches(eredivisieLeagueId);
    
    if (fixtures.length === 0) {
      console.log(`⚠️ No fixtures found, generating sample data`);
      const fallbackMatches = generateSampleMatches();
      cachedEredivisieMatches = fallbackMatches;
      lastFetchTime = now;
      return fallbackMatches; // Fallback if no fixtures
    }
    
    console.log(`✅ Success! Found ${fixtures.length} upcoming Eredivisie matches`);
    
    // Update cache
    cachedEredivisieMatches = fixtures;
    lastFetchTime = now;
    
    return fixtures;
  } catch (error) {
    console.error("❌ Error fetching Eredivisie matches:", error);
    // If we already have cached data, use that instead of generating new samples
    if (cachedEredivisieMatches) {
      console.log("⚠️ Using previously cached data due to API error");
      return cachedEredivisieMatches;
    }
    const fallbackMatches = generateSampleMatches();
    cachedEredivisieMatches = fallbackMatches;
    lastFetchTime = Date.now();
    return fallbackMatches; // Fallback to generated data
  }
};

// Helper to fetch league matches from TheSportsDB
const fetchLeagueMatches = async (leagueId: number): Promise<Match[]> => {
  try {
    // The league endpoint for upcoming events
    const url = `${API_URL}/eventsnextleague.php?id=${leagueId}`;
    console.log(`📡 API Request: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`📊 API Response for fixtures:`, data);
    
    if (!data.events || data.events.length === 0) {
      console.log("No events found in API response");
      return [];
    }
    
    // Filter events to ensure they're from Eredivisie only
    const eredivisieEvents = data.events.filter((event: any) => {
      // Check if the event belongs to Eredivisie
      // Either by checking the league name or ID if available
      return event.strLeague === "Eredivisie" || event.idLeague === "4337";
    });
    
    console.log(`Found ${eredivisieEvents.length} Eredivisie events after filtering`);
    
    // Map TheSportsDB data to our Match format
    return eredivisieEvents.map((event: any) => ({
      id: event.idEvent,
      homeTeam: event.strHomeTeam,
      awayTeam: event.strAwayTeam,
      date: new Date(`${event.dateEvent} ${event.strTime || '20:00:00'}`).toISOString(),
      competition: "Eredivisie",
      venue: event.strVenue || "Unknown Venue",
      status: event.strStatus || "Not Started",
    }));
  } catch (error) {
    console.error("❌ Error fetching league fixtures:", error);
    return [];
  }
};

// Helper for generating sample matches as fallback
const generateSampleMatches = (): Promise<Match[]> => {
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
  return Promise.resolve(matches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
};

// Function to fetch matches for a specific team
export const fetchMatchesForTeam = async (teamName: string): Promise<Match[]> => {
  try {
    console.log(`📋 Starting API process for ${teamName} from TheSportsDB...`);
    
    // First lookup the team ID
    console.log(`🔍 Looking up team ID for "${teamName}"`);
    const teamId = await fetchTeamId(teamName);
    
    if (!teamId) {
      console.error(`❌ Team "${teamName}" not found in API`);
      return generateMatchesForTeam(teamName); // Fallback
    }
    
    // Then fetch fixtures for that team
    console.log(`✅ Team found! ID: ${teamId}`);
    console.log(`🔍 Fetching fixtures for team ID ${teamId}`);
    
    const fixtures = await fetchTeamMatches(teamId);
    
    if (fixtures.length === 0) {
      console.log(`⚠️ No fixtures found, falling back to generated data`);
      return generateMatchesForTeam(teamName); // Fallback if no fixtures
    }
    
    // Filter fixtures to only include Eredivisie matches
    const eredivisieFixtures = fixtures.filter(match => 
      match.competition === "Eredivisie" || match.competition.includes("Eredivisie")
    );
    
    console.log(`✅ Success! Found ${eredivisieFixtures.length} upcoming Eredivisie matches for ${teamName}`);
    return eredivisieFixtures;
  } catch (error) {
    console.error("❌ Error in fetch process:", error);
    return generateMatchesForTeam(teamName); // Fallback to generated data
  }
};

// Helper function to get team ID from name
const fetchTeamId = async (teamName: string): Promise<string | null> => {
  try {
    const url = `${API_URL}/searchteams.php?t=${encodeURIComponent(teamName)}`;
    console.log(`📡 API Request: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`📊 API Response for team lookup:`, data);
    
    if (data.teams && data.teams.length > 0) {
      return data.teams[0].idTeam;
    }
    return null;
  } catch (error) {
    console.error("❌ Error fetching team ID:", error);
    return null;
  }
};

// Helper function to fetch team matches
const fetchTeamMatches = async (teamId: string): Promise<Match[]> => {
  try {
    const url = `${API_URL}/eventsnext.php?id=${teamId}`;
    console.log(`📡 API Request: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`📊 API Response for team matches:`, data);
    
    if (!data.events || data.events.length === 0) {
      console.log("No events found in API response");
      return [];
    }
    
    // Map API data to our Match format
    return data.events.map((event: any) => ({
      id: event.idEvent,
      homeTeam: event.strHomeTeam,
      awayTeam: event.strAwayTeam,
      date: new Date(`${event.dateEvent} ${event.strTime || '20:00:00'}`).toISOString(),
      competition: event.strLeague || "Unknown League",
      venue: event.strVenue || "Unknown Venue",
      status: event.strStatus || "Scheduled",
    }));
  } catch (error) {
    console.error("❌ Error fetching team fixtures:", error);
    return [];
  }
};

// Helper for team matches - with added caching
const teamMatchesCache: Record<string, {matches: Match[], timestamp: number}> = {};

// Helper function to generate sample matches for development/fallback
const generateMatchesForTeam = (teamName: string): Promise<Match[]> => {
  // Check if we have cached data for this team
  if (teamMatchesCache[teamName] && Date.now() - teamMatchesCache[teamName].timestamp < CACHE_DURATION) {
    console.log(`🔄 Using cached data for ${teamName}`);
    return Promise.resolve(teamMatchesCache[teamName].matches);
  }
  
  console.log(`🔄 Generating fallback data for ${teamName}`);
  
  const competitions = ["Eredivisie"];
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
    
    matches.push({
      id: `match-${teamName}-${i}`,
      homeTeam: isHome ? teamName : opponent,
      awayTeam: isHome ? opponent : teamName,
      date: matchDate.toISOString(),
      competition: "Eredivisie",
      venue: isHome ? venues[Math.floor(Math.random() * venues.length)] : "Uitstadion",
    });
  }
  
  // Sort matches by date
  const sortedMatches = matches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Cache the result
  teamMatchesCache[teamName] = {
    matches: sortedMatches,
    timestamp: Date.now()
  };
  
  return Promise.resolve(sortedMatches);
};
