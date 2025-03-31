
import { Match } from "../types";

// Function to generate an ICS file from matches
export function generateICS(matches: Match[], teamName: string): string {
  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  
  // Start building the ICS content
  let icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Voetbal Agenda//Wedstrijdschema//NL",
    `X-WR-CALNAME:${teamName} Wedstrijdschema`,
    "X-WR-CALDESC:Voetbal wedstrijdschema",
    "X-WR-TIMEZONE:Europe/Amsterdam",
  ];
  
  // Add events for each match
  matches.forEach((match) => {
    const matchDate = new Date(match.date);
    const endDate = new Date(matchDate);
    endDate.setHours(endDate.getHours() + 2); // Assume matches last 2 hours
    
    const startDateFormatted = formatDateForICS(matchDate);
    const endDateFormatted = formatDateForICS(endDate);
    
    // Determine if home or away game for summary
    const isHome = match.homeTeam === teamName;
    const opponent = isHome ? match.awayTeam : match.homeTeam;
    const location = isHome ? "Thuis" : "Uit";
    
    const summary = `${teamName} ${isHome ? "vs" : "tegen"} ${opponent}`;
    const description = `${match.competition} wedstrijd, ${location}`;
    
    icsContent = icsContent.concat([
      "BEGIN:VEVENT",
      `UID:${match.id}@voetbalagenda.app`,
      `DTSTAMP:${now}`,
      `DTSTART:${startDateFormatted}`,
      `DTEND:${endDateFormatted}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${match.venue}`,
      "END:VEVENT",
    ]);
  });
  
  // Close the calendar
  icsContent.push("END:VCALENDAR");
  
  // Join all lines with CRLF as per ICS spec
  return icsContent.join("\r\n");
}

// Helper function to format dates for ICS
function formatDateForICS(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}
