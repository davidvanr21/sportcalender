
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LeagueSelector from '@/components/LeagueSelector';
import TeamSelector from '@/components/TeamSelector';
import MatchesPreview from '@/components/MatchesPreview';
import { leagues } from '@/data/leagues';
import { teams } from '@/data/teams';
import { getMatchesForTeam, getMatchesForTeamSync } from '@/services/footballApiService';
import { generateICS } from '@/utils/icsGenerator';
import { useToast } from "@/components/ui/use-toast";
import { Share, Calendar, Download, ArrowRight, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Index = () => {
  // Set default league to "eredivisie" and make it fixed
  const [selectedLeague, setSelectedLeague] = useState<string | null>("eredivisie");
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [filteredTeams, setFilteredTeams] = useState(teams.filter(team => team.leagueId === "eredivisie"));
  const [matches, setMatches] = useState<any[]>([]);
  const [teamName, setTeamName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  // Filter teams based on selected league - now always "eredivisie"
  useEffect(() => {
    const teamsInLeague = teams.filter(team => team.leagueId === "eredivisie");
    setFilteredTeams(teamsInLeague);
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
            console.log(`🔄 Calling getMatchesForTeam API service`);
            const teamMatches = await getMatchesForTeam(teamData.name);
            console.log(`✅ API call complete. Got ${teamMatches.length} matches`);
            setMatches(teamMatches);
          } catch (error) {
            console.error("❌ Error in match fetching process:", error);
            console.log(`⚠️ Using fallback data generation method`);
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
    // League selection is now disabled, but keeping the handler for future use
    setSelectedLeague("eredivisie");
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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Eredivisie Wedstrijden',
        text: 'Bekijk de aankomende Eredivisie wedstrijden!',
        url: window.location.href,
      }).then(() => {
        toast({
          title: "Gedeeld!",
          description: "De link is succesvol gedeeld.",
        });
      }).catch(console.error);
    } else {
      const url = window.location.href;
      navigator.clipboard.writeText(url).then(() => {
        toast({
          title: "Link gekopieerd!",
          description: "De link is naar je klembord gekopieerd.",
        });
      });
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-green-300">
      <Header />
      
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-grow container mx-auto px-4 py-6"
      >
        <motion.section 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">VOETBALWEDSTRIJDEN DIRECT IN JE AGENDA</h1>
          <motion.p 
            className="text-lg text-green-400/80"
            animate={{ 
              scale: [1, 1.02, 1],
            }}
            transition={{ 
              repeat: Infinity,
              duration: 3,
              ease: "easeInOut" 
            }}
          >
            Selecteer je favoriete club en download hun wedstrijdschema direct naar je agenda.
          </motion.p>
        </motion.section>

        <motion.section 
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-md mx-auto bg-black border border-green-400/30 rounded-lg p-6 mb-8 shadow-lg"
        >
          <motion.div variants={item}>
            <LeagueSelector 
              leagues={leagues} 
              selectedLeague={selectedLeague} 
              onLeagueSelect={handleLeagueSelect} 
            />
          </motion.div>
          
          <motion.div variants={item} className="mt-6">
            <TeamSelector 
              teams={filteredTeams} 
              selectedTeam={selectedTeam} 
              onTeamSelect={handleTeamSelect} 
            />
          </motion.div>
        </motion.section>

        {selectedTeam && (
          <motion.section 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-md mx-auto mb-8"
          >
            <MatchesPreview 
              matches={matches} 
              teamName={teamName} 
              onDownload={handleDownloadCalendar}
              isLoading={isLoading} 
            />
          </motion.section>
        )}

        <motion.section 
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-md mx-auto py-8"
        >
          <motion.h2 variants={item} className="text-2xl font-bold mb-6 text-center text-green-400">HOE WERKT HET?</motion.h2>
          <div className="space-y-4">
            <motion.div variants={item} className="bg-black/80 border border-green-400/30 p-6 rounded-lg shadow-md">
              <div className="w-10 h-10 bg-green-400 text-black rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">1</div>
              <h3 className="text-lg font-semibold mb-2 text-center">Selecteer je club</h3>
              <p className="text-sm text-green-300/80 text-center">Kies je favoriete voetbalclub uit de lijst van beschikbare teams per competitie.</p>
            </motion.div>
            <motion.div variants={item} className="bg-black/80 border border-green-400/30 p-6 rounded-lg shadow-md">
              <div className="w-10 h-10 bg-green-400 text-black rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">2</div>
              <h3 className="text-lg font-semibold mb-2 text-center">Bekijk de wedstrijden</h3>
              <p className="text-sm text-green-300/80 text-center">Bekijk alle aankomende wedstrijden van je gekozen club.</p>
            </motion.div>
            <motion.div variants={item} className="bg-black/80 border border-green-400/30 p-6 rounded-lg shadow-md">
              <div className="w-10 h-10 bg-green-400 text-black rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">3</div>
              <h3 className="text-lg font-semibold mb-2 text-center">Download naar agenda</h3>
              <p className="text-sm text-green-300/80 text-center">Download het wedstrijdschema en importeer het in je favoriete agenda-app.</p>
            </motion.div>
          </div>
        </motion.section>
        
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="max-w-md mx-auto text-center my-8"
        >
          <Button 
            asChild
            className="bg-green-400 hover:bg-green-500 text-black font-bold text-lg p-6"
          >
            <Link to="/api-check" className="flex items-center gap-2">
              Bekijk alle wedstrijden <ArrowRight size={20} />
            </Link>
          </Button>
        </motion.div>
      </motion.main>
      
      <Footer />
    </div>
  );
};

export default Index;
