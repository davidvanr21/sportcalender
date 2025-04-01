
export interface League {
  id: string;
  name: string;
  country: string;
  logo: string;
}

export interface Team {
  id: string;
  name: string;
  leagueId: string;
  logo: string;
  colors: {
    primary: string;
    secondary: string;
  };
}

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: string; // ISO date string
  competition: string;
  venue: string;
  status?: string; // Added status field
}
