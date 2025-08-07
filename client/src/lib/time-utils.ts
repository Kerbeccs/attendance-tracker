export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getCurrentTime(): string {
  return formatTime(new Date());
}

export function getCurrentDate(): string {
  return formatDate(new Date());
}

export function calculateHours(clockIn: string, clockOut: string): string {
  const start = new Date(clockIn);
  const end = new Date(clockOut);
  const diffMs = end.getTime() - start.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return Math.round(diffHours * 100) / 100 + "h";
}
