
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
    
    // Fetch data from the TheSportsDB API
    const apiUrl = "https://www.thesportsdb.com/api/v1/json/1/eventsseason.php?id=4337";
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check if we have events in the response
    if (!data.events || !Array.isArray(data.events)) {
      throw new Error("No events found in API response or invalid format");
    }
    
    console.log(`Found ${data.events.length} Eredivisie matches in API response`);
    
    // Transform the events into the format we want to store
    const matches = data.events.map((event) => ({
      id: event.idEvent,
      date_event: event.dateEvent,
      str_event: event.strEvent,
      str_home_team: event.strHomeTeam,
      str_away_team: event.strAwayTeam,
      int_home_score: event.intHomeScore !== "" ? parseInt(event.intHomeScore) : null,
      int_away_score: event.intAwayScore !== "" ? parseInt(event.intAwayScore) : null,
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
