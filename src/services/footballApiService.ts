
import { Match, League } from '../types';
import { addDays, format } from 'date-fns';

// API URL - using the free Sports DB API
const API_URL = "https://www.thesportsdb.com/api/v1/json/3";

// Cache for API responses to prevent reload differences
let cachedEredivisieMatches: Match[] = []; // Using direct array type
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
let lastFetchTime = 0;

// Fetch Eredivisie matches
export const fetchEredivisieMatches = async (): Promise<Match[]> => {
  try {
    // Check if we have cached data that's still fresh
    const now = Date.now();
    if (cachedEredivisieMatches.length > 0 && now - lastFetchTime < CACHE_DURATION) {
      console.log("📋 Using cached Eredivisie matches data");
      return cachedEredivisieMatches;
    }
    
    console.log("🔄 Fetching Eredivisie matches from API");
    const response = await fetch(`${API_URL}/eventsnextleague.php?id=4337`);
    const data = await response.json();
    
    // Get the events/fixtures array from response
    const fixtures = data.events || [];
    console.log(`📊 Fetched ${fixtures?.length || 0} fixtures from API`);
    
    if (!fixtures || fixtures.length === 0) {
      console.log(`⚠️ No fixtures found, generating sample data`);
      const fallbackMatches = generateSampleMatches();
      cachedEredivisieMatches = fallbackMatches;
      lastFetchTime = now;
      return fallbackMatches;
    }
    
    // Convert API response to our Match type
    const matches = transformApiResponseToMatches(fixtures);
    
    // Sort matches by date ascending and cache them
    const sortedMatches = [...matches].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    cachedEredivisieMatches = sortedMatches;
    lastFetchTime = now;
    return sortedMatches;
  } catch (error) {
    console.error("❌ Error fetching Eredivisie matches:", error);
    // If we already have cached data, use that instead of generating new samples
    if (cachedEredivisieMatches.length > 0) {
      console.log("⚠️ Using previously cached data due to API error");
      return cachedEredivisieMatches;
    }
    const fallbackMatches = generateSampleMatches();
    cachedEredivisieMatches = fallbackMatches;
    lastFetchTime = Date.now();
    return fallbackMatches;
  }
};

// Adding alias for fetchUpcomingEredivisieMatches to match what's imported in ApiCheck.tsx
export const fetchUpcomingEredivisieMatches = fetchEredivisieMatches;

// Fetch matches for a specific team
export const fetchMatchesForTeam = async (teamName: string): Promise<Match[]> => {
  try {
    // First get all Eredivisie matches
    const allMatches = await fetchEredivisieMatches();
    
    // Filter for matches where the team is playing
    const teamMatches = allMatches.filter(match => {
      return match.homeTeam.toLowerCase().includes(teamName.toLowerCase()) || 
             match.awayTeam.toLowerCase().includes(teamName.toLowerCase());
    });
    
    console.log(`📊 Found ${teamMatches.length} matches for ${teamName}`);
    return teamMatches;
  } catch (error) {
    console.error(`❌ Error fetching matches for ${teamName}:`, error);
    throw error;
  }
};

// Helper to transform API response to our Match type
const transformApiResponseToMatches = (fixtures: any[]): Match[] => {
  return fixtures.map(fixture => ({
    id: fixture.idEvent,
    homeTeam: fixture.strHomeTeam,
    awayTeam: fixture.strAwayTeam,
    date: fixture.dateEvent,
    competition: "Eredivisie", // Add this to match the Match type
    venue: fixture.strVenue || "TBD",
    status: "SCHEDULED" // Add status field since it's optional in the Match type
  }));
};

// Helper for generating sample matches
const generateSampleMatches = (): Match[] => {
  console.log("🔄 Generating sample Eredivisie matches");
  
  const eredivisieTeams = [
    "Ajax",
    "PSV",
    "Feyenoord",
    "AZ Alkmaar",
    "FC Utrecht",
    "FC Twente",
    "Vitesse",
    "FC Groningen",
    "Heerenveen", 
    "Sparta Rotterdam",
    "NEC Nijmegen",
    "Go Ahead Eagles",
    "FC Emmen",
    "Excelsior",
    "RKC Waalwijk",
    "Fortuna Sittard"
  ];
  
  const venues = [
    "Johan Cruijff Arena",
    "Philips Stadion",
    "De Kuip",
    "AFAS Stadion",
    "Galgenwaard",
    "De Grolsch Veste",
    "GelreDome",
    "Euroborg",
    "Abe Lenstra Stadion",
    "Het Kasteel",
    "Goffertstadion",
    "De Adelaarshorst",
    "De Oude Meerdijk",
    "Van Donge & De Roo Stadion",
    "Mandemakers Stadion",
    "Fortuna Sittard Stadion"
  ];
  
  const matches: Match[] = [];
  
  // Generate matches for the next 3 months
  for (let i = 0; i < 80; i++) {
    // Randomly select two different teams
    const homeIndex = Math.floor(Math.random() * eredivisieTeams.length);
    let awayIndex = homeIndex;
    
    // Make sure home and away teams are different
    while (awayIndex === homeIndex) {
      awayIndex = Math.floor(Math.random() * eredivisieTeams.length);
    }
    
    // Generate a date within next 3 months
    const matchDate = addDays(new Date(), Math.floor(Math.random() * 90));
    
    // Format date as YYYY-MM-DD
    const formattedDate = format(matchDate, 'yyyy-MM-dd');
    
    // Generate a random time, typically on the hour or half-hour
    const hours = Math.floor(Math.random() * 6) + 15; // Between 15:00 - 20:00
    const minutes = Math.random() > 0.5 ? '00' : '30'; // Either on the hour or half past
    
    matches.push({
      id: `sample-${i}`,
      homeTeam: eredivisieTeams[homeIndex],
      awayTeam: eredivisieTeams[awayIndex],
      date: formattedDate,
      competition: "Eredivisie", // Match the Match type requirements
      venue: venues[homeIndex],
      status: "SCHEDULED" // Add status field
    });
  }
  
  // Sort by date
  return matches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

// Synchronous version for getMatchesForTeam for fallback 
export const getMatchesForTeamSync = (teamName: string): Match[] => {
  if (cachedEredivisieMatches.length === 0) {
    cachedEredivisieMatches = generateSampleMatches();
    lastFetchTime = Date.now();
  }
  
  return cachedEredivisieMatches.filter(match => 
    match.homeTeam.toLowerCase().includes(teamName.toLowerCase()) ||
    match.awayTeam.toLowerCase().includes(teamName.toLowerCase())
  );
};

// Main function that wraps the async API call for component usage
export const getMatchesForTeam = async (teamName: string): Promise<Match[]> => {
  try {
    return await fetchMatchesForTeam(teamName);
  } catch (error) {
    console.error(`❌ Error in getMatchesForTeam for ${teamName}:`, error);
    // Fall back to sync version if async fails
    return getMatchesForTeamSync(teamName);
  }
};
