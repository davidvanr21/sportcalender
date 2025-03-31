
import React from 'react';
import { League } from '../types';

interface LeagueSelectorProps {
  leagues: League[];
  selectedLeague: string | null;
  onLeagueSelect: (leagueId: string) => void;
}

const LeagueSelector: React.FC<LeagueSelectorProps> = ({ leagues, selectedLeague, onLeagueSelect }) => {
  const handleLeagueClick = (leagueId: string) => {
    // If the league is already selected, deselect it (null)
    if (selectedLeague === leagueId) {
      onLeagueSelect('');
    } else {
      onLeagueSelect(leagueId);
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Selecteer een competitie</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {leagues.map((league) => (
          <button
            key={league.id}
            onClick={() => handleLeagueClick(league.id)}
            className={`border rounded-lg p-3 transition-all flex flex-col items-center justify-center h-28 hover:shadow-md ${
              selectedLeague === league.id
                ? 'border-sport-blue bg-blue-50 ring-2 ring-sport-blue'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="w-12 h-12 mb-2 flex items-center justify-center">
              <img
                src={league.logo}
                alt={`${league.name} logo`}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  // Fallback if image fails to load
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
            </div>
            <span className="text-sm font-medium text-center">{league.name}</span>
            <span className="text-xs text-gray-500">{league.country}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LeagueSelector;
