
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">API Status Check</h1>
      
      <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Eredivisie Matches Data</h2>
        <p className="text-gray-600 mb-6">
          Click the button below to manually fetch and update Eredivisie matches from the API.
        </p>
        
        <Button 
          onClick={refreshEredivisieMatches} 
          disabled={isLoading}
          className="w-full py-6 bg-sport-blue hover:bg-blue-700"
        >
          <RefreshCw className={`mr-2 h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Refreshing...' : 'Refresh Eredivisie Matches'}
        </Button>
        
        {result && (
          <div className="mt-6 p-4 border rounded-md bg-gray-50">
            <h3 className="font-medium text-lg mb-2">Result:</h3>
            <div className="text-sm">
              <p className="text-green-600 font-medium">{result.message}</p>
              
              {result.matches && result.matches.length > 0 && (
                <div className="mt-4">
                  <p className="font-medium mb-2">Sample of updated matches:</p>
                  <ul className="space-y-2">
                    {result.matches.map((match: any) => (
                      <li key={match.id} className="p-2 bg-white border rounded">
                        <div className="font-medium">{match.str_event}</div>
                        <div className="text-gray-500 text-xs">Date: {match.date_event}</div>
                        {(match.int_home_score !== null && match.int_away_score !== null) && (
                          <div className="mt-1 text-sm">
                            Score: {match.int_home_score} - {match.int_away_score}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiCheck;
