
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = "https://tryskxsqfbzozhixozuf.supabase.co";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Log that we're starting the fetch
    console.log("📊 Fetching Eredivisie matches from TheSportsDB API");
    
    // Updated API URL to use the all leagues endpoint which is free to access
    const apiUrl = "https://www.thesportsdb.com/api/v1/json/3/search_all_leagues.php?c=Netherlands";
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check if we have leagues in the response
    if (!data.countrys || !Array.isArray(data.countrys)) {
      throw new Error("No leagues found in API response or invalid format");
    }
    
    console.log(`Found ${data.countrys.length} Dutch leagues in API response`);
    
    // Find the Eredivisie league
    const eredivisieLeague = data.countrys.find(league => 
      league.strLeague === "Dutch Eredivisie" || 
      league.strLeague === "Eredivisie"
    );
    
    if (!eredivisieLeague) {
      throw new Error("Eredivisie league not found in the API response");
    }
    
    console.log("Found Eredivisie league in the API response");
    
    // Now fetch the current season
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const seasonApiUrl = `https://www.thesportsdb.com/api/v1/json/3/eventsseason.php?id=${eredivisieLeague.idLeague}&s=${currentYear-1}-${currentYear}`;
    
    console.log(`Fetching matches for season ${currentYear-1}-${currentYear}`);
    
    const seasonResponse = await fetch(seasonApiUrl);
    
    if (!seasonResponse.ok) {
      throw new Error(`Season API responded with status: ${seasonResponse.status}`);
    }
    
    const seasonData = await seasonResponse.json();
    
    // Check if we have events in the response
    if (!seasonData.events || !Array.isArray(seasonData.events)) {
      throw new Error("No events found in API response or invalid format");
    }
    
    console.log(`Found ${seasonData.events.length} Eredivisie matches in API response`);
    
    // Transform the events into the format we want to store
    const matches = seasonData.events.map((event) => ({
      id: event.idEvent,
      date_event: event.dateEvent,
      str_event: event.strEvent,
      str_home_team: event.strHomeTeam,
      str_away_team: event.strAwayTeam,
      int_home_score: event.intHomeScore !== null && event.intHomeScore !== "" ? parseInt(event.intHomeScore) : null,
      int_away_score: event.intAwayScore !== null && event.intAwayScore !== "" ? parseInt(event.intAwayScore) : null,
    }));
    
    // Upsert the matches into the eredivisie_matches table
    const { data: upsertData, error } = await supabase
      .from('eredivisie_matches')
      .upsert(matches, { onConflict: 'id' });
    
    if (error) {
      throw error;
    }
    
    console.log(`✅ Successfully upserted ${matches.length} Eredivisie matches`);
    
    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully fetched and stored ${matches.length} Eredivisie matches`,
        matches: matches.slice(0, 5), // Return just the first 5 matches as preview
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error("❌ Error fetching or storing Eredivisie matches:", error);
    
    // Return error response
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
