
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, Trophy, ArrowLeft } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ApiCheck = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const refreshEredivisieMatches = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-eredivisie-matches');
      
      if (error) {
        throw error;
      }
      
      setResult(data);
      toast({
        title: "Eredivisie matches updated",
        description: data.message || "Successfully refreshed Eredivisie matches data",
      });
    } catch (error) {
      console.error("Error invoking function:", error);
      toast({
        title: "Error refreshing matches",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen football-pattern">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link to="/" className="inline-flex items-center text-sport-green hover:text-sport-blue mb-6 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Terug naar home
        </Link>
        
        <h1 className="text-3xl font-bold mb-6 text-center text-sport-green">API Status Check</h1>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="max-w-lg mx-auto grass-card shadow-md p-6 rounded-lg"
      >
        <div className="flex items-center justify-center mb-4">
          <Trophy className="h-8 w-8 text-sport-accent mr-2" />
          <h2 className="text-xl font-semibold text-sport-green">Eredivisie Matches Data</h2>
        </div>
        
        <p className="text-sport-green/80 mb-6 text-center">
          Klik op de knop hieronder om de Eredivisie wedstrijden handmatig bij te werken.
        </p>
        
        <Button 
          onClick={refreshEredivisieMatches} 
          disabled={isLoading}
          className="w-full py-6 football-btn group"
        >
          <RefreshCw className={`mr-2 h-5 w-5 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          {isLoading ? 'Vernieuwen...' : 'Vernieuw Eredivisie Wedstrijden'}
        </Button>
        
        {result && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6 p-4 border rounded-md bg-white/80 border-sport-green/30"
          >
            <h3 className="font-medium text-lg mb-2 text-sport-green">Resultaat:</h3>
            <div className="text-sm">
              <p className="text-sport-green font-medium">{result.message}</p>
              
              {result.matches && result.matches.length > 0 && (
                <div className="mt-4">
                  <p className="font-medium mb-2 text-sport-green">Voorbeelden van bijgewerkte wedstrijden:</p>
                  <ul className="space-y-2">
                    {result.matches.slice(0, 5).map((match: any) => (
                      <li key={match.id} className="p-2 bg-white border border-sport-green/20 rounded football-stitching">
                        <div className="font-medium text-sport-green">{match.str_event}</div>
                        <div className="text-sport-green/70 text-xs">Datum: {match.date_event}</div>
                        {(match.int_home_score !== null && match.int_away_score !== null) && (
                          <div className="mt-1 text-sm text-sport-blue font-semibold">
                            Score: {match.int_home_score} - {match.int_away_score}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ApiCheck;
