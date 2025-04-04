import React, { useState } from 'react';
import { Match } from '../types';
import { Button } from '@/components/ui/button';
import { Calendar, Download, ChevronDown } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

interface MatchesPreviewProps {
  matches: Match[];
  teamName: string;
  onDownload: () => void;
  isLoading: boolean;
}

const MatchesPreview: React.FC<MatchesPreviewProps> = ({ matches, teamName, onDownload, isLoading }) => {
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

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
          <div className="flex flex-col gap-2">
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <Progress value={75} className="h-2" />
            </div>
            <p className="text-xs text-gray-500 text-center">Matches ophalen...</p>
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex flex-col gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-black">{teamName} Wedstrijdagenda</h2>
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
      
      {matches.length === 0 ? (
        <div className="text-center p-6 bg-gray-50 rounded-md">
          <p className="text-gray-500 mb-2">Geen wedstrijden gevonden</p>
          <p className="text-sm text-gray-400">Er zijn momenteel geen wedstrijden beschikbaar voor dit team.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(displayMatchesByMonth).map(([monthYear, monthMatches]) => (
            <div key={monthYear}>
              <h3 className="text-lg font-semibold mb-3 border-b pb-1 text-black">{monthYear}</h3>
              <div className="space-y-3">
                {monthMatches.map(match => {
                  const date = new Date(match.date);
                  const isHome = match.homeTeam === teamName;
                  const opponent = isHome ? match.awayTeam : match.homeTeam;
                  
                  return (
                    <div key={match.id} className="flex flex-col sm:flex-row sm:items-center p-3 rounded-md hover:bg-gray-50 border border-gray-100">
                      <div className="flex items-center mb-1 sm:mb-0">
                        <div className="w-16 text-sm text-black font-medium">
                          {date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                        </div>
                        <div className="w-16 text-sm text-black">
                          {match.time || "TBD"}
                        </div>
                      </div>
                      <div className="flex-grow font-medium mb-1 sm:mb-0 text-black">
                        {isHome ? teamName : opponent} vs {isHome ? opponent : teamName}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 self-start sm:self-auto text-black">
                          {match.competition}
                        </span>
                        {/* Status badges removed as requested */}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {matches.length > 5 && (
        <div className="mt-4 text-center">
          <Button 
            variant="outline" 
            onClick={() => setShowAllMatches(!showAllMatches)}
            className="w-full text-black"
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
