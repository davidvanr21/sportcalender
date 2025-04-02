
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchUpcomingEredivisieMatches } from '@/services/footballApiService';
import { formatDateNL } from '@/utils/dateUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ChevronLeft, Code, Share, ArrowRight, InfoIcon } from 'lucide-react';
import type { Match } from '@/types';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';

const ApiCheck: React.FC = () => {
  const [showJson, setShowJson] = useState(false);
  const { toast } = useToast();
  
  const { data: matches, isLoading, error, refetch } = useQuery<Match[]>({
    queryKey: ['upcomingEredivisieMatches'],
    queryFn: fetchUpcomingEredivisieMatches,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Animations for staggered table rows
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

  const handleRefreshData = () => {
    refetch();
    toast({
      title: "Data vernieuwd",
      description: "De wedstrijdgegevens worden opnieuw opgehaald.",
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

  if (isLoading) return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-black text-green-400">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold mb-4">LOADING</h1>
        <div className="flex gap-2 justify-center">
          {[0, 1, 2].map((dot) => (
            <motion.div
              key={dot}
              className="h-4 w-4 bg-green-400 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [1, 0.7, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: dot * 0.2,
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-black text-red-500">
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center max-w-md p-6"
      >
        <h1 className="text-3xl font-bold mb-4">ERROR</h1>
        <p className="mb-4">{(error as Error).message}</p>
        <Button 
          onClick={() => refetch()} 
          className="bg-green-400 hover:bg-green-500 text-black"
        >
          Probeer opnieuw
        </Button>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-green-300">
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="p-6 border-b border-green-400/30"
      >
        <div className="container mx-auto flex justify-between items-center">
          <motion.div whileHover={{ scale: 1.05 }} className="flex-1">
            <h1 className="text-5xl font-bold tracking-tighter">
              EREDIVISIE &<br />LAUNCH
            </h1>
          </motion.div>
          
          <div className="space-x-4 flex">
            <Button 
              variant="outline" 
              onClick={() => setShowJson(!showJson)}
              className="flex items-center gap-2 border-green-400 text-green-400 hover:bg-green-400/10"
            >
              <Code size={18} />
              {showJson ? 'Verberg JSON' : 'More Info'}
            </Button>
            
            <Button 
              variant="outline" 
              asChild
              className="border-green-400 text-green-400 hover:bg-green-400/10"
            >
              <Link to="/" className="flex items-center gap-2">
                <ChevronLeft size={18} /> MENU
              </Link>
            </Button>
          </div>
        </div>
      </motion.header>
      
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="container mx-auto px-4 py-8"
      >
        <motion.div 
          className="flex justify-between items-center mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <motion.h2 
            className="text-2xl font-bold tracking-tight"
            whileHover={{ x: 10 }}
          >
            AANKOMENDE WEDSTRIJDEN
          </motion.h2>
          <div className="space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleRefreshData}
              className="p-3 bg-green-400 text-black rounded-full"
            >
              <InfoIcon size={20} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              className="p-3 bg-green-400 text-black rounded-full"
            >
              <Share size={20} />
            </motion.button>
          </div>
        </motion.div>
        
        {showJson && matches && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-6 overflow-hidden"
          >
            <Card className="bg-black border border-green-400/30">
              <CardHeader>
                <CardTitle className="text-green-400">EREDIVISIE DATA</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-black/80 text-green-300 p-4 rounded-md overflow-auto max-h-96">
                  <pre className="text-xs">{JSON.stringify(matches, null, 2)}</pre>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        {matches && matches.length > 0 ? (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="overflow-hidden rounded-xl border border-green-400/30"
          >
            <div className="p-6 bg-green-300 text-black">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold tracking-tight">FIXTURES</h3>
                <p className="text-sm font-medium">
                  {matches.length} wedstrijden gevonden
                </p>
              </div>
            </div>
            <div className="overflow-x-auto bg-black">
              <Table>
                <TableHeader>
                  <TableRow className="border-green-400/30">
                    <TableHead className="text-green-300">DATUM</TableHead>
                    <TableHead className="text-green-300">THUISTEAM</TableHead>
                    <TableHead className="text-green-300">UITTEAM</TableHead>
                    <TableHead className="text-green-300 hidden md:table-cell">STADION</TableHead>
                    <TableHead className="text-green-300 hidden md:table-cell">STATUS</TableHead>
                    <TableHead className="text-green-300"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matches.map((match) => (
                    <motion.tr
                      key={match.id}
                      variants={item}
                      className="group border-green-400/10 hover:bg-green-400/5 cursor-pointer transition-colors"
                    >
                      <TableCell className="font-mono">
                        {formatDateNL(new Date(match.date), 'PP')}
                        <div className="text-xs opacity-70">
                          {formatDateNL(new Date(match.date), 'HH:mm')}
                        </div>
                      </TableCell>
                      <TableCell>{match.homeTeam}</TableCell>
                      <TableCell>{match.awayTeam}</TableCell>
                      <TableCell className="hidden md:table-cell">{match.venue}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="px-2 py-1 bg-green-400/10 rounded-full text-xs font-medium text-green-300">
                          {match.status || 'SCHEDULED'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <motion.span
                          whileHover={{ x: 5 }}
                          className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ArrowRight size={16} />
                        </motion.span>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="bg-black/70 border border-green-400/30 rounded-xl p-8 text-center"
          >
            <p className="text-xl font-bold mb-2">GEEN WEDSTRIJDEN GEVONDEN</p>
            <p className="text-green-400/70 mb-6">Er zijn momenteel geen aankomende Eredivisie wedstrijden beschikbaar.</p>
            <Button 
              onClick={handleRefreshData}
              className="bg-green-400 hover:bg-green-500 text-black"
            >
              Vernieuwen
            </Button>
          </motion.div>
        )}
      </motion.main>
      
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="p-6 border-t border-green-400/30 mt-12"
      >
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold tracking-tight mb-6">KLAAR OM TE BEGINNEN?</h3>
          <p className="text-green-400 text-lg max-w-md mx-auto leading-relaxed mb-6">
            Wij streven ernaar gepersonaliseerde informatie te bieden en een geweldige gebruikerservaring.
          </p>
          <motion.div 
            whileHover={{ scale: 1.03 }}
            className="inline-block"
          >
            <Button asChild className="bg-green-400 hover:bg-green-500 text-black p-6 text-lg">
              <Link to="/" className="flex items-center gap-2">
                Terug naar Home <ArrowRight size={18} />
              </Link>
            </Button>
          </motion.div>
        </div>
      </motion.footer>
    </div>
  );
};

export default ApiCheck;
