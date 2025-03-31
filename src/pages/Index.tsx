
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LeagueSelector from '@/components/LeagueSelector';
import TeamSelector from '@/components/TeamSelector';
import MatchesPreview from '@/components/MatchesPreview';
import { leagues } from '@/data/leagues';
import { teams } from '@/data/teams';
import { getMatchesForTeam, getMatchesForTeamSync } from '@/data/matches';
import { generateICS } from '@/utils/icsGenerator';
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [filteredTeams, setFilteredTeams] = useState(teams);
  const [matches, setMatches] = useState<any[]>([]);
  const [teamName, setTeamName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  // Filter teams based on selected league
  useEffect(() => {
    if (selectedLeague) {
      const teamsInLeague = teams.filter(team => team.leagueId === selectedLeague);
      setFilteredTeams(teamsInLeague);
    } else {
      // If no league is selected, show all teams
      setFilteredTeams(teams);
    }
    // Reset selected team when changing leagues
    setSelectedTeam(null);
    setMatches([]);
  }, [selectedLeague]);

  // Load matches when a team is selected
  useEffect(() => {
    if (selectedTeam) {
      const fetchMatches = async () => {
        setIsLoading(true);
        const teamData = teams.find(team => team.id === selectedTeam);
        
        if (teamData) {
          setTeamName(teamData.name);
          try {
            // Try to fetch matches asynchronously first
            const teamMatches = await getMatchesForTeam(teamData.name);
            setMatches(teamMatches);
          } catch (error) {
            console.error("Error fetching matches, using fallback:", error);
            // Fallback to synchronous method if async fails
            const fallbackMatches = getMatchesForTeamSync(teamData.name);
            setMatches(fallbackMatches);
          }
        }
        setIsLoading(false);
      };
      
      fetchMatches();
    }
  }, [selectedTeam]);

  const handleLeagueSelect = (leagueId: string) => {
    setSelectedLeague(leagueId || null);
  };

  const handleTeamSelect = (teamId: string) => {
    setSelectedTeam(teamId);
  };

  const handleDownloadCalendar = () => {
    if (!selectedTeam || matches.length === 0) {
      toast({
        title: "Geen wedstrijden beschikbaar",
        description: "Er zijn geen wedstrijden om te downloaden.",
        variant: "destructive",
      });
      return;
    }

    // Generate ICS file
    const icsContent = generateICS(matches, teamName);
    
    // Create blob and download
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `${teamName.replace(/\s+/g, '-').toLowerCase()}-wedstrijden.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Kalender gedownload!",
      description: `De wedstrijdagenda voor ${teamName} is gedownload.`,
    });
  };

  return (
    <div className="min-h-screen flex flex-col football-container">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <section className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Voetbalwedstrijden in je agenda</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Selecteer je favoriete club en download hun wedstrijdschema direct naar je agenda.
            Compatibel met Apple Agenda, Google Agenda, en meer.
          </p>
        </section>

        <section className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6 mb-8">
          <LeagueSelector 
            leagues={leagues} 
            selectedLeague={selectedLeague} 
            onLeagueSelect={handleLeagueSelect} 
          />
          
          <TeamSelector 
            teams={filteredTeams} 
            selectedTeam={selectedTeam} 
            onTeamSelect={handleTeamSelect} 
          />
        </section>

        {isLoading ? (
          <section className="max-w-6xl mx-auto mb-8 text-center p-8">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          </section>
        ) : selectedTeam && matches.length > 0 ? (
          <section className="max-w-6xl mx-auto mb-8">
            <MatchesPreview 
              matches={matches} 
              teamName={teamName} 
              onDownload={handleDownloadCalendar} 
            />
          </section>
        ) : null}

        <section className="max-w-4xl mx-auto py-8">
          <h2 className="text-2xl font-bold mb-4 text-center">Hoe werkt het?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-sport-blue text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
              <h3 className="text-lg font-semibold mb-2">Selecteer je club</h3>
              <p className="text-gray-600">Kies je favoriete voetbalclub uit de lijst van beschikbare teams per competitie.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-sport-blue text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
              <h3 className="text-lg font-semibold mb-2">Bekijk de wedstrijden</h3>
              <p className="text-gray-600">Bekijk alle aankomende wedstrijden van je gekozen club.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-sport-blue text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
              <h3 className="text-lg font-semibold mb-2">Download naar agenda</h3>
              <p className="text-gray-600">Download het wedstrijdschema en importeer het in je favoriete agenda-app.</p>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
