export function apiErrorMessage(error: any, fallback = 'Something went wrong. Please try again.'): string {
  if (error?.status === 0) return 'Unable to reach the ContractIQ API. Make sure the FastAPI server is running.';
  const detail = error?.error?.detail;
  if (Array.isArray(detail)) {
    return detail.map((x: any) => x?.msg ?? String(x)).join(', ');
  }
  if (typeof detail === 'string' && detail.trim()) return detail;
  return fallback;
}
