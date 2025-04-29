/**
 * Formats a date string to a display format (e.g., "Mar 15, 2023")
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'No date';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * Returns a relative time string (e.g., "2 days ago", "in 3 hours")
 * @param dateString - ISO date string
 * @returns Relative time string
 */
export const getRelativeTime = (dateString: string | null | undefined): string => {
  if (!dateString) return 'No date';
  
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);
  
  // Future date
  if (diffInSeconds > 0) {
    if (diffInSeconds < 60) return `in ${diffInSeconds} seconds`;
    if (diffInSeconds < 3600) return `in ${Math.floor(diffInSeconds / 60)} minutes`;
    if (diffInSeconds < 86400) return `in ${Math.floor(diffInSeconds / 3600)} hours`;
    if (diffInSeconds < 604800) return `in ${Math.floor(diffInSeconds / 86400)} days`;
    return formatDate(dateString);
  }
  
  // Past date
  const absDiff = Math.abs(diffInSeconds);
  if (absDiff < 60) return `${absDiff} seconds ago`;
  if (absDiff < 3600) return `${Math.floor(absDiff / 60)} minutes ago`;
  if (absDiff < 86400) return `${Math.floor(absDiff / 3600)} hours ago`;
  if (absDiff < 604800) return `${Math.floor(absDiff / 86400)} days ago`;
  return formatDate(dateString);
}; 