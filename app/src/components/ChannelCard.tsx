import React from 'react';
import { ExternalLink, Heart, Clock } from 'lucide-react';
import type { ChannelItem } from '../types/content';
import { formatDurationDisplay } from '../utils/duration';

interface ChannelCardProps {
  channel: ChannelItem;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export const ChannelCard: React.FC<ChannelCardProps> = ({
  channel,
  isFavorite,
  onToggleFavorite,
}) => {
  const isTeacher = channel.category === 'professores';
  const showBeginner = !isTeacher && channel.beginnerFriendly;

  return (
    <div
      onClick={() => window.open(channel.url, '_blank', 'noopener,noreferrer')}
      className="bg-[#111114] border border-zinc-800 hover:border-zinc-700/80 rounded-2xl p-6 transition-all flex flex-col justify-between group min-h-[260px] cursor-pointer"
    >
      <div>
        {/* Header: Avatar Circular + Título com ExternalLink + Coração */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-11 h-11 rounded-full bg-zinc-800 border border-zinc-700/60 overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-xs text-zinc-200 relative">
              {channel.avatar ? (
                <img
                  src={channel.avatar}
                  alt={channel.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const fallback = target.parentElement?.querySelector('.av-fallback');
                    if (fallback) (fallback as HTMLElement).style.display = 'flex';
                  }}
                />
              ) : null}
              <span
                className={`av-fallback w-full h-full items-center justify-center text-xs font-bold text-zinc-300 ${
                  channel.avatar ? 'hidden' : 'flex'
                }`}
              >
                {channel.initials}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-1.5 max-w-full">
                <h3 className="text-base font-bold text-zinc-100 group-hover:text-white transition-colors truncate">
                  {channel.title}
                </h3>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0" />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(channel.id);
            }}
            className="w-8 h-8 rounded-lg hover:bg-zinc-800/60 flex items-center justify-center flex-shrink-0 transition-all text-zinc-600 hover:text-rose-500 active:scale-95 cursor-pointer z-10"
            title={isFavorite ? 'Desfavoritar' : 'Favoritar'}
          >
            <Heart
              className={`w-[18px] h-[18px] transition-colors ${
                isFavorite
                  ? 'fill-rose-500 text-rose-500'
                  : 'text-zinc-600 hover:text-rose-400'
              }`}
            />
          </button>
        </div>

        {/* Descrição Empilhada (Rede Social) */}
        <p className="text-sm leading-relaxed text-zinc-300 line-clamp-3 mb-5">
          {channel.description}
        </p>
      </div>

      {/* Metadados Funcionais + Tags de Assunto + Duração na Base (Zero Dividers) */}
      <div className="flex flex-col gap-2.5 pt-1">
        {(showBeginner || (channel.category !== 'podcasts' && channel.subtitlesAvailable) || channel.transcriptUrl) && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {showBeginner && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Iniciante
              </span>
            )}
            {channel.category !== 'podcasts' && channel.subtitlesAvailable && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Legendado
              </span>
            )}
            {channel.transcriptUrl && (
              <a
                href={channel.transcriptUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/30 hover:bg-purple-500/25 hover:text-purple-100 hover:border-purple-400/50 transition-all cursor-pointer group/link shadow-sm"
                title="Abrir transcrição em nova aba"
              >
                <span>Transcrição</span>
                <ExternalLink className="w-3 h-3 text-purple-400 group-hover/link:text-purple-200 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
              </a>
            )}
          </div>
        )}

        {/* Tags de Assunto */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {channel.topics.map((topic) => (
            <span
              key={topic}
              className="text-xs font-medium px-2.5 py-1 rounded-md bg-zinc-800/80 text-zinc-300 border border-zinc-700/50"
            >
              {topic}
            </span>
          ))}
        </div>

        {/* Duração Editorial Discreta */}
        {channel.category === 'podcasts' && channel.avgDuration && (
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 pt-0.5">
            <Clock className="w-3.5 h-3.5 text-zinc-500 stroke-[2]" />
            <span>Episódios de {formatDurationDisplay(channel.avgDuration)}</span>
          </div>
        )}
      </div>
    </div>
  );
};
