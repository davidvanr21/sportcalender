
import React from 'react';
import { Match } from '../types';
import { Button } from '@/components/ui/button';
import { Calendar, Download } from 'lucide-react';

interface MatchesPreviewProps {
  matches: Match[];
  teamName: string;
  onDownload: () => void;
}

const MatchesPreview: React.FC<MatchesPreviewProps> = ({ matches, teamName, onDownload }) => {
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold">{teamName} Wedstrijdagenda</h2>
          <p className="text-gray-600">{matches.length} wedstrijden gevonden</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={onDownload}
            className="bg-sport-blue hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            <span>Downloaden (.ics)</span>
          </Button>
          <Button 
            variant="outline"
            className="flex items-center gap-2 border-sport-blue text-sport-blue hover:bg-blue-50"
          >
            <Calendar className="h-4 w-4" />
            <span>Apple Agenda</span>
          </Button>
        </div>
      </div>
      
      <div className="space-y-6">
        {Object.entries(matchesByMonth).map(([monthYear, monthMatches]) => (
          <div key={monthYear}>
            <h3 className="text-lg font-semibold mb-3 border-b pb-1">{monthYear}</h3>
            <div className="space-y-2">
              {monthMatches.map(match => {
                const date = new Date(match.date);
                const isHome = match.homeTeam === teamName;
                const opponent = isHome ? match.awayTeam : match.homeTeam;
                
                return (
                  <div key={match.id} className="flex items-center p-3 rounded-md hover:bg-gray-50">
                    <div className="w-20 text-sm text-gray-600">
                      {date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                    </div>
                    <div className="w-16 text-sm text-gray-600">
                      {date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex-grow">
                      <span className="font-medium">
                        {isHome ? teamName : opponent} vs {isHome ? opponent : teamName}
                      </span>
                    </div>
                    <div className="text-sm font-medium px-2 py-1 rounded-full bg-gray-100">
                      {match.competition}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MatchesPreview;
