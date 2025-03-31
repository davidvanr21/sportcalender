
import React from 'react';
import { Team } from '../types';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';

interface TeamSelectorProps {
  teams: Team[];
  selectedTeam: string | null;
  onTeamSelect: (teamId: string) => void;
}

const TeamSelector: React.FC<TeamSelectorProps> = ({ teams, selectedTeam, onTeamSelect }) => {
  const isMobile = useIsMobile();
  
  if (teams.length === 0) {
    return <p className="text-center text-gray-500 mb-6">Geen teams gevonden. Selecteer een competitie of deselecteer voor alle teams.</p>;
  }

  const handleTeamChange = (value: string) => {
    onTeamSelect(value);
  };

  // Find the currently selected team name
  const selectedTeamName = selectedTeam 
    ? teams.find(team => team.id === selectedTeam)?.name || "" 
    : "";

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-2">Selecteer een team</h2>
      <Select value={selectedTeam || ""} onValueChange={handleTeamChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Kies een team">
            {selectedTeamName || "Selecteer team"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {teams.map((team) => (
            <SelectItem key={team.id} value={team.id}>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 flex-shrink-0">
                  <img
                    src={team.logo}
                    alt={`${team.name} logo`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                </div>
                <span>{team.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TeamSelector;
