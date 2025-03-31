
import React from 'react';
import { Team } from '../types';

interface TeamSelectorProps {
  teams: Team[];
  selectedTeam: string | null;
  onTeamSelect: (teamId: string) => void;
}

const TeamSelector: React.FC<TeamSelectorProps> = ({ teams, selectedTeam, onTeamSelect }) => {
  if (teams.length === 0) {
    return <p className="text-center text-gray-500">Selecteer eerst een competitie</p>;
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Selecteer een team</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {teams.map((team) => (
          <button
            key={team.id}
            onClick={() => onTeamSelect(team.id)}
            className={`flex flex-col items-center p-4 border rounded-lg transition-all hover:shadow-md ${
              selectedTeam === team.id
                ? 'ring-2 ring-sport-blue bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            style={{
              background: selectedTeam === team.id 
                ? `linear-gradient(135deg, ${team.colors.primary}15, ${team.colors.secondary}10)` 
                : undefined
            }}
          >
            <div className="w-16 h-16 mb-2 flex items-center justify-center">
              <img
                src={team.logo}
                alt={`${team.name} logo`}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  // Fallback if image fails to load
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
            </div>
            <span className="text-sm font-medium text-center">{team.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TeamSelector;
