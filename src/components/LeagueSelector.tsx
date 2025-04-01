
import React from 'react';
import { League } from '../types';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';

interface LeagueSelectorProps {
  leagues: League[];
  selectedLeague: string | null;
  onLeagueSelect: (leagueId: string) => void;
}

const LeagueSelector: React.FC<LeagueSelectorProps> = ({ leagues, selectedLeague, onLeagueSelect }) => {
  const isMobile = useIsMobile();
  
  const handleLeagueChange = (value: string) => {
    // If "all_leagues" is selected, it means "All leagues"
    onLeagueSelect(value === "all_leagues" ? "" : value);
  };

  // Find the currently selected league name or use "Alle competities" as default
  const selectedLeagueName = selectedLeague 
    ? leagues.find(league => league.id === selectedLeague)?.name || "" 
    : "Alle competities";

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-2">Selecteer een competitie</h2>
      <Select 
        value={selectedLeague || "all_leagues"} 
        onValueChange={handleLeagueChange}
        defaultValue="eredivisie"
        disabled={true}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Kies een competitie">
            {selectedLeagueName}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all_leagues" className="flex items-center">Alle competities</SelectItem>
          {leagues.map((league) => (
            <SelectItem 
              key={league.id} 
              value={league.id} 
              className="flex items-center"
              disabled={league.id !== "eredivisie"}
            >
              <div className="flex items-center gap-2 justify-between w-full">
                <div className="flex items-center gap-2">
                  <img 
                    src={league.logo} 
                    alt={league.name} 
                    className="w-5 h-5 object-contain mr-2"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                  <span>{league.name}</span>
                </div>
                {league.id !== "eredivisie" && 
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full ml-2">
                    Binnenkort
                  </span>
                }
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LeagueSelector;
