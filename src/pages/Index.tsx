
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
  // Set default league to "eredivisie"
  const [selectedLeague, setSelectedLeague] = useState<string | null>("eredivisie");
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [filteredTeams, setFilteredTeams] = useState(teams.filter(team => team.leagueId === "eredivisie"));
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
        console.log(`🏁 Starting match fetch process for team ID: ${selectedTeam}`);
        
        const teamData = teams.find(team => team.id === selectedTeam);
        
        if (teamData) {
          setTeamName(teamData.name);
          console.log(`📋 Fetching matches for team: ${teamData.name}`);
          
          try {
            // Try to fetch matches asynchronously first
            console.log(`🔄 Calling getMatchesForTeam API service`);
            const teamMatches = await getMatchesForTeam(teamData.name);
            console.log(`✅ API call complete. Got ${teamMatches.length} matches`);
            setMatches(teamMatches);
          } catch (error) {
            console.error("❌ Error in match fetching process:", error);
            console.log(`⚠️ Using fallback data generation method`);
            // Fallback to synchronous method if async fails
            const fallbackMatches = getMatchesForTeamSync(teamData.name);
            setMatches(fallbackMatches);
          }
        } else {
          console.error(`❌ Could not find team with ID: ${selectedTeam}`);
        }
        
        console.log(`🏁 Match fetching process completed`);
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
      
      <main className="flex-grow container mx-auto px-4 py-6">
        <section className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Voetbalwedstrijden in je agenda</h1>
          <p className="text-md text-gray-600">
            Selecteer je favoriete club en download hun wedstrijdschema direct naar je agenda.
          </p>
        </section>

        <section className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-4 mb-6">
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

        {selectedTeam && (
          <section className="max-w-md mx-auto mb-6">
            <MatchesPreview 
              matches={matches} 
              teamName={teamName} 
              onDownload={handleDownloadCalendar}
              isLoading={isLoading} 
            />
          </section>
        )}

        <section className="max-w-md mx-auto py-6">
          <h2 className="text-xl font-bold mb-4 text-center">Hoe werkt het?</h2>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="w-8 h-8 bg-sport-blue text-white rounded-full flex items-center justify-center mx-auto mb-2 text-md font-bold">1</div>
              <h3 className="text-md font-semibold mb-1 text-center">Selecteer je club</h3>
              <p className="text-sm text-gray-600 text-center">Kies je favoriete voetbalclub uit de lijst van beschikbare teams per competitie.</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="w-8 h-8 bg-sport-blue text-white rounded-full flex items-center justify-center mx-auto mb-2 text-md font-bold">2</div>
              <h3 className="text-md font-semibold mb-1 text-center">Bekijk de wedstrijden</h3>
              <p className="text-sm text-gray-600 text-center">Bekijk alle aankomende wedstrijden van je gekozen club.</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="w-8 h-8 bg-sport-blue text-white rounded-full flex items-center justify-center mx-auto mb-2 text-md font-bold">3</div>
              <h3 className="text-md font-semibold mb-1 text-center">Download naar agenda</h3>
              <p className="text-sm text-gray-600 text-center">Download het wedstrijdschema en importeer het in je favoriete agenda-app.</p>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
