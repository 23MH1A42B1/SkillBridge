export const downloadICS = (title, description, date) => {
  const startDate = new Date(date).toISOString().replace(/-|:|\.\d+/g, "");
  const endDate = new Date(new Date(date).getTime() + 60 * 60 * 1000).toISOString().replace(/-|:|\.\d+/g, "");
  
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SkillBridge//NONSGML Event//EN
BEGIN:VEVENT
UID:${Math.random().toString(36).substring(2)}@skillbridge.ai
DTSTAMP:${new Date().toISOString().replace(/-|:|\.\d+/g, "")}
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${title}
DESCRIPTION:${description}
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${title.replace(/\s+/g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
