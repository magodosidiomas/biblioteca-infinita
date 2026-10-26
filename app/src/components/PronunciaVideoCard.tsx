import React from 'react';
import { ExternalLink, Heart } from 'lucide-react';
import type { ChannelItem } from '../types/content';

interface PronunciaVideoCardProps {
  channel: ChannelItem;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onEdit?: (channel: ChannelItem) => void;
  isPreview?: boolean;
}

export function resolveYouTubeThumbnail(url: string, fallbackAvatar?: string | null): string | null {
  const m = (url || '').match(/(?:youtube\.com\/(?:watch\?.*v=|shorts\/|live\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  if (m && m[1]) {
    return `https://i.ytimg.com/vi/${m[1]}/hqdefault.jpg`;
  }
  return fallbackAvatar || null;
}

export const PronunciaVideoCard: React.FC<PronunciaVideoCardProps> = ({
  channel,
  isFavorite = false,
  onToggleFavorite,
  onEdit,
  isPreview = false,
}) => {
  const thumbUrl = resolveYouTubeThumbnail(channel.url, channel.avatar);
  const displayTopics = (channel.topics || []).filter((t) => t !== 'Vídeo');

  return (
    <div
      onClick={() => {
        if (!isPreview && channel.url) {
          window.open(channel.url, '_blank', 'noopener,noreferrer');
        }
      }}
      className={`bg-[#111114] border border-zinc-800 hover:border-zinc-700/80 rounded-2xl overflow-hidden transition-all flex flex-col justify-between group ${
        isPreview ? '' : 'cursor-pointer'
      }`}
    >
      {/* Thumbnail 16:9 */}
      <div className="relative w-full aspect-video bg-[#18181b] overflow-hidden">
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt={channel.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm font-bold text-zinc-500">
            {channel.initials}
          </div>
        )}

        {onToggleFavorite && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(channel.id);
            }}
            title={isFavorite ? 'Desfavoritar' : 'Favoritar'}
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-lg bg-zinc-950/80 hover:bg-zinc-950/95 backdrop-blur-md border border-white/10 flex items-center justify-center transition-all text-zinc-300 hover:text-rose-400 active:scale-95 cursor-pointer z-10"
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
            className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-950/85 hover:bg-zinc-900 backdrop-blur-md border border-white/20 rounded-md px-2.5 py-1 text-xs font-medium text-zinc-200 cursor-pointer z-10"
          >
            Editar
          </button>
        )}
      </div>

      {/* Corpo: Canal + Título com ExternalLink + Descrição + Badges */}
      <div className="p-5 flex flex-col justify-between flex-1 gap-3.5">
        <div>
          {channel.platform && (
            <div className="text-xs font-medium text-zinc-400 mb-1 truncate">
              {channel.platform}
            </div>
          )}

          <div className="inline-flex items-baseline gap-1.5 max-w-full mb-2">
            <h3 className="text-[15px] font-bold text-zinc-100 group-hover:text-white transition-colors leading-snug line-clamp-2">
              {channel.title}
            </h3>
            {!isPreview && (
              <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0 self-center" />
            )}
          </div>

          {channel.description && (
            <p className="text-[13.5px] leading-relaxed text-zinc-300 line-clamp-2">
              {channel.description}
            </p>
          )}
        </div>

        {(channel.subtitlesAvailable || displayTopics.length > 0) && (
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            {channel.subtitlesAvailable && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Legendado
              </span>
            )}
            {displayTopics.map((topic) => (
              <span
                key={topic}
                className="text-xs font-medium px-2.5 py-1 rounded-md bg-zinc-800/80 text-zinc-300 border border-zinc-700/50"
              >
                {topic}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
