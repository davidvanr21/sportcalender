
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
    
    console.log("🔄 Fetching Eredivisie matches from TheSportsDB API");
    
    // Fetch data from the external API
    const apiResponse = await fetch("https://www.thesportsdb.com/api/v1/json/1/eventsseason.php?id=4337");
    
    if (!apiResponse.ok) {
      throw new Error(`API responded with status: ${apiResponse.status}`);
    }
    
    const data = await apiResponse.json();
    
    if (!data.events || !Array.isArray(data.events)) {
      throw new Error("Invalid API response format: 'events' array is missing");
    }
    
    console.log(`📊 Fetched ${data.events.length} Eredivisie matches from API`);
    
    // Map the events to the structure needed for our database
    const mappedEvents = data.events.map(event => ({
      id: event.idEvent,
      date_event: event.dateEvent,
      str_event: event.strEvent,
      str_home_team: event.strHomeTeam,
      str_away_team: event.strAwayTeam,
      int_home_score: event.intHomeScore !== null ? parseInt(event.intHomeScore) : null,
      int_away_score: event.intAwayScore !== null ? parseInt(event.intAwayScore) : null
    }));
    
    // Upsert the events into the eredivisie_matches table
    const { data: upsertData, error } = await supabase
      .from('eredivisie_matches')
      .upsert(mappedEvents, { onConflict: 'id' });
    
    if (error) {
      throw error;
    }
    
    console.log(`✅ Successfully upserted ${mappedEvents.length} Eredivisie matches`);
    
    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully fetched and stored ${mappedEvents.length} Eredivisie matches`,
        matches: mappedEvents.slice(0, 5) // Return just the first 5 matches as preview
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
