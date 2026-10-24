export function formatDurationDisplay(val?: string | null): string {
  if (!val) return '';
  const trimmed = val.trim();
  if (!trimmed) return '';
  // Se for apenas número (ex: "25"), exibe "~25 min"
  if (/^\d+$/.test(trimmed)) {
    return `~${trimmed} min`;
  }
  // Se já tiver unidade ou til, retorna como está
  return trimmed;
}
