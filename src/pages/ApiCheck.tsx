
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchUpcomingEredivisieMatches } from '@/services/footballApiService';
import { formatDateNL } from '@/utils/dateUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Match } from '@/types';

const ApiCheck: React.FC = () => {
  const { data: matches, isLoading, error } = useQuery<Match[]>({
    queryKey: ['upcomingEredivisieMatches'],
    queryFn: fetchUpcomingEredivisieMatches,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Aankomende Eredivisie Wedstrijden</h1>
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
