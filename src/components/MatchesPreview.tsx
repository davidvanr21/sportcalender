
import React, { useState } from 'react';
import { Match } from '../types';
import { Button } from '@/components/ui/button';
import { Calendar, Download, ChevronDown } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface MatchesPreviewProps {
  matches: Match[];
  teamName: string;
  onDownload: () => void;
}

const MatchesPreview: React.FC<MatchesPreviewProps> = ({ matches, teamName, onDownload }) => {
  const isMobile = useIsMobile();
  const [showAllMatches, setShowAllMatches] = useState(false);
  
  // Group matches by month
  const matchesByMonth: Record<string, Match[]> = {};
  
  matches.forEach(match => {
    const date = new Date(match.date);
    const monthYear = `${date.toLocaleString('nl-NL', { month: 'long' })} ${date.getFullYear()}`;
    
    if (!matchesByMonth[monthYear]) {
      matchesByMonth[monthYear] = [];
    }
    
    matchesByMonth[monthYear].push(match);
  });

  // Determine which matches to show (first 5 or all)
  const upcomingMatches = [...matches].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const displayMatches = showAllMatches ? upcomingMatches : upcomingMatches.slice(0, 5);
  
  // Group the filtered matches by month
  const displayMatchesByMonth: Record<string, Match[]> = {};
  displayMatches.forEach(match => {
    const date = new Date(match.date);
    const monthYear = `${date.toLocaleString('nl-NL', { month: 'long' })} ${date.getFullYear()}`;
    
    if (!displayMatchesByMonth[monthYear]) {
      displayMatchesByMonth[monthYear] = [];
    }
    
    displayMatchesByMonth[monthYear].push(match);
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex flex-col gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold">{teamName} Wedstrijdagenda</h2>
          <p className="text-gray-600">{showAllMatches ? matches.length : Math.min(5, matches.length)} van {matches.length} wedstrijden</p>
        </div>
        <Button 
          onClick={onDownload}
          className="bg-sport-blue hover:bg-blue-700 text-white flex items-center gap-2 w-full justify-center py-6"
          size="lg"
        >
          <Download className="h-5 w-5" />
          <span className="font-bold">Download naar je agenda</span>
        </Button>
      </div>
      
      <div className="space-y-6">
        {Object.entries(displayMatchesByMonth).map(([monthYear, monthMatches]) => (
          <div key={monthYear}>
            <h3 className="text-lg font-semibold mb-3 border-b pb-1">{monthYear}</h3>
            <div className="space-y-3">
              {monthMatches.map(match => {
                const date = new Date(match.date);
                const isHome = match.homeTeam === teamName;
                const opponent = isHome ? match.awayTeam : match.homeTeam;
                
                return (
                  <div key={match.id} className="flex flex-col sm:flex-row sm:items-center p-3 rounded-md hover:bg-gray-50 border border-gray-100">
                    <div className="flex items-center mb-1 sm:mb-0">
                      <div className="w-16 text-sm text-gray-600 font-medium">
                        {date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                      </div>
                      <div className="w-16 text-sm text-gray-600">
                        {date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className="flex-grow font-medium mb-1 sm:mb-0">
                      {isHome ? teamName : opponent} vs {isHome ? opponent : teamName}
                    </div>
                    <div className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 self-start sm:self-auto">
                      {match.competition}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      {matches.length > 5 && (
        <div className="mt-4 text-center">
          <Button 
            variant="outline" 
            onClick={() => setShowAllMatches(!showAllMatches)}
            className="w-full"
          >
            {showAllMatches ? "Toon minder wedstrijden" : "Toon alle wedstrijden"}
            <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${showAllMatches ? 'rotate-180' : ''}`} />
          </Button>
        </div>
      )}
    </div>
  );
};

export default MatchesPreview;
