import React from 'react';
import { ExternalLink, Heart } from 'lucide-react';
import type { ChannelItem } from '../types/content';

interface SeriesMovieCardProps {
  channel: ChannelItem;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onEdit?: (channel: ChannelItem) => void;
  isPreview?: boolean;
}

const LANG_LABELS: Record<string, string> = {
  english: 'Inglês',
  german: 'Alemão',
  french: 'Francês',
  spanish: 'Espanhol',
  italian: 'Italiano',
  russian: 'Russo',
  japanese: 'Japonês',
  portuguese: 'Português',
  polish: 'Polonês',
  ukrainian: 'Ucraniano',
  arabic: 'Árabe',
  latin: 'Latim',
  korean: 'Coreano',
  chinese: 'Mandarim',
  dutch: 'Holandês',
  swedish: 'Sueco',
  norwegian: 'Norueguês',
  danish: 'Dinamarquês',
  finnish: 'Finlandês',
  turkish: 'Turco',
  greek: 'Grego',
  hebrew: 'Hebraico',
  hindi: 'Hindi',
  vietnamese: 'Vietnamita',
  thai: 'Tailandês',
  indonesian: 'Indonésio',
  czech: 'Tcheco',
  hungarian: 'Húngaro',
  romanian: 'Romeno',
};

const LABEL_TO_KEY: Record<string, string> = Object.fromEntries(
  Object.entries(LANG_LABELS).flatMap(([k, v]) => [
    [k, k],
    [v.toLowerCase(), k],
    [v.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''), k],
  ])
);

export function normalizeLangKey(raw?: string | null, fallback = 'english'): string {
  if (!raw) return fallback;
  const clean = raw.toLowerCase().trim();
  const ascii = clean.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return LABEL_TO_KEY[clean] || LABEL_TO_KEY[ascii] || clean;
}

export function inferPlatformFromUrl(url: string, explicitPlatform?: string | null): string {
  if (explicitPlatform && explicitPlatform.trim()) return explicitPlatform.trim();
  const u = (url || '').toLowerCase();
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'YouTube';
  if (u.includes('disneyplus.com')) return 'Disney+';
  if (u.includes('primevideo.com') || u.includes('amazon.com')) return 'Prime Video';
  if (u.includes('tv.apple.com')) return 'Apple TV+';
  if (u.includes('max.com') || u.includes('hbomax.com')) return 'Max';
  return 'Netflix';
}

export const SeriesMovieCard: React.FC<SeriesMovieCardProps> = ({
  channel,
  isFavorite = false,
  onToggleFavorite,
  onEdit,
  isPreview = false,
}) => {
  const platform = inferPlatformFromUrl(channel.url, channel.platform);
  const studyLang = normalizeLangKey(channel.language, 'english');
  const origLangKey = normalizeLangKey(channel.originalLanguage, studyLang);
  const isDubbed = Boolean(origLangKey && origLangKey !== studyLang);
  const origLabel =
    LANG_LABELS[origLangKey] ||
    channel.originalLanguageLabel ||
    channel.originalLanguage ||
    '';

  const genresText = (channel.topics || []).filter(Boolean).join(' \u00B7 ');

  return (
    <div
      onClick={() => {
        if (!isPreview && channel.url) {
          window.open(channel.url, '_blank', 'noopener,noreferrer');
        }
      }}
      className={`group relative aspect-[2/3] rounded-2xl overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-zinc-600 transition-all duration-200 flex flex-col justify-between select-none ${
        isPreview ? '' : 'cursor-pointer'
      }`}
    >
      {/* Pôster Oficial 2:3 */}
      {channel.avatar ? (
        <img
          src={channel.avatar}
          alt={channel.title}
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            const target = e.currentTarget;
            target.style.display = 'none';
            const fallback = target.parentElement?.querySelector('.poster-fallback');
            if (fallback) (fallback as HTMLElement).style.display = 'flex';
          }}
        />
      ) : null}

      <div
        className={`poster-fallback absolute inset-0 items-center justify-center text-3xl font-bold text-zinc-700 tracking-wider ${
          channel.avatar ? 'hidden' : 'flex'
        }`}
      >
        {channel.initials || channel.title.slice(0, 2).toUpperCase()}
      </div>

      {/* Gradiente Concentrado no Terço Inferior */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to top, #09090b 0%, rgba(9, 9, 11, 0.95) 22%, rgba(9, 9, 11, 0.65) 42%, rgba(9, 9, 11, 0.12) 68%, rgba(9, 9, 11, 0.05) 100%)',
        }}
      />

      {/* Topo: Plataforma + Favorito (ou Editar no Admin) */}
      <div className="relative z-10 p-4 flex items-center justify-between gap-2">
        <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-zinc-950/85 backdrop-blur-md border border-white/15 text-xs font-semibold text-zinc-100 shadow-sm">
          <span>{platform}</span>
        </div>

        {onToggleFavorite && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(channel.id);
            }}
            title={isFavorite ? 'Desfavoritar' : 'Favoritar'}
            className="w-9 h-9 rounded-lg bg-zinc-950/80 hover:bg-zinc-900 backdrop-blur-md border border-white/15 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
          >
            <Heart
              className={`w-[18px] h-[18px] transition-colors ${
                isFavorite
                  ? 'fill-rose-500 text-rose-500'
                  : 'text-zinc-300 hover:text-rose-400'
              }`}
            />
          </button>
        )}

        {onEdit && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(channel);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-950/85 hover:bg-zinc-900 backdrop-blur-md border border-white/20 rounded-md px-2.5 py-1 text-xs font-medium text-zinc-200 cursor-pointer"
          >
            Editar
          </button>
        )}
      </div>

      {/* Base Limpa: Título + Subtítulo com · + 1 Linha de Badges */}
      <div className="relative z-10 p-5 pt-14 flex flex-col justify-end gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 max-w-full">
            <h3 className="text-lg font-bold text-white group-hover:text-zinc-100 transition-colors leading-snug tracking-tight">
              {channel.title || 'Sem título'}
            </h3>
            {!isPreview && (
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0" />
            )}
          </div>

          {(genresText || isDubbed) && (
            <p className="text-xs font-medium text-zinc-300 mt-1">
              {genresText}
              {isDubbed && origLabel && (
                <>
                  {genresText ? ' \u00B7 ' : ''}
                  <span className="text-amber-300 whitespace-nowrap">
                    Original em {origLabel}
                  </span>
                </>
              )}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {channel.beginnerFriendly && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/30 backdrop-blur-sm">
              Iniciante
            </span>
          )}
          {!isDubbed ? (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 backdrop-blur-sm">
              Áudio Original
            </span>
          ) : (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-200 border border-amber-400/30 backdrop-blur-sm">
              Dublado
            </span>
          )}
          {channel.subtitlesAvailable && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-zinc-900/90 text-zinc-200 border border-zinc-700/80">
              Legendado <span className="text-zinc-400 font-bold">[CC]</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
