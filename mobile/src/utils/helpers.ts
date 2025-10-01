export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function getCategoryColor(category: string): string {
  const colors: any = {
    climate: '#34D399',
    housing: '#3B82F6',
    healthcare: '#A855F7',
    education: '#FBBF24',
    labor: '#F59E0B',
  };
  return colors[category] || '#6B7280';
}

export function getCategoryIcon(category: string): string {
  const icons: any = {
    climate: 'leaf',
    housing: 'home',
    healthcare: 'heart',
    education: 'school',
    labor: 'briefcase',
  };
  return icons[category] || 'flag';
}

export function calculatePowerIndex(pledged: number, totalVoters: number): number {
  if (totalVoters === 0) return 0;
  return Math.round((pledged / totalVoters) * 100 * 10) / 10;
}

export function validateZipCode(zip: string): boolean {
  return /^\d{5}(-\d{4})?$/.test(zip);
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
