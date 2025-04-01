
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchUpcomingEredivisieMatches } from '@/services/footballApiService';
import { formatDateNL } from '@/utils/dateUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ChevronLeft, Code } from 'lucide-react';
import type { Match } from '@/types';

const ApiCheck: React.FC = () => {
  const [showJson, setShowJson] = useState(false);
  
  const { data: matches, isLoading, error } = useQuery<Match[]>({
    queryKey: ['upcomingEredivisieMatches'],
    queryFn: fetchUpcomingEredivisieMatches,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" asChild>
          <Link to="/" className="flex items-center gap-2">
            <ChevronLeft size={16} /> Terug naar Home
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Aankomende Eredivisie Wedstrijden</h1>
        <Button 
          variant="outline" 
          onClick={() => setShowJson(!showJson)}
          className="flex items-center gap-2"
        >
          <Code size={16} />
          {showJson ? 'Verberg JSON' : 'Toon JSON'}
        </Button>
      </div>
      
      {showJson && matches && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>JSON Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-auto max-h-96">
              <pre className="text-xs">{JSON.stringify(matches, null, 2)}</pre>
            </div>
          </CardContent>
        </Card>
      )}
      
      {matches && matches.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Wedstrijden Data</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum</TableHead>
                  <TableHead>Thuisteam</TableHead>
                  <TableHead>Uitteam</TableHead>
                  <TableHead>Stadion</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matches.map((match) => (
                  <TableRow key={match.id}>
                    <TableCell>{formatDateNL(new Date(match.date), 'PP HH:mm')}</TableCell>
                    <TableCell>{match.homeTeam}</TableCell>
                    <TableCell>{match.awayTeam}</TableCell>
                    <TableCell>{match.venue}</TableCell>
                    <TableCell>{match.status || 'Onbekend'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div>Geen wedstrijden gevonden</div>
      )}
    </div>
  );
};

export default ApiCheck;
