import React from 'react';
import { ExternalLink, Clock } from 'lucide-react';
import type { ChannelItem } from '../../types/content';
import { formatDurationDisplay } from '../../utils/duration';

interface AdminChannelCardProps {
  channel: ChannelItem;
  onEdit: (channel: ChannelItem) => void;
}

export const AdminChannelCard: React.FC<AdminChannelCardProps> = ({ channel: c, onEdit }) => {
  return (
    <div
      onClick={() => window.open(c.url, '_blank', 'noopener,noreferrer')}
      className="bg-[#111114] border border-[#27272a] hover:border-[#3f3f46] rounded-2xl p-5 flex flex-col justify-between min-h-[240px] relative transition-colors group cursor-pointer"
    >
      <div>
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-[42px] h-[42px] rounded-full bg-[#27272a] border border-[#3f3f46] overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-xs text-[#d4d4d8] relative">
              {c.avatar ? (
                <img
                  src={c.avatar}
                  alt={c.title}
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
                className={`av-fallback w-full h-full items-center justify-center ${
                  c.avatar ? 'hidden' : 'flex'
                }`}
              >
                {c.initials}
              </span>
            </div>
            <div className="font-bold text-[15px] text-[#f4f4f5] truncate">{c.title}</div>
          </div>

          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(c);
              }}
              className="bg-[#18181b] hover:bg-[#27272a] border border-[#3f3f46] rounded-md px-2.5 py-1 text-xs font-medium text-[#d4d4d8] cursor-pointer"
            >
              Editar
            </button>
          </div>
        </div>

        <div className="text-[13.5px] leading-relaxed text-[#d4d4d8] line-clamp-3 mb-4">
          {c.description}
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-1">
        <div className="flex flex-wrap gap-1.5">
          {c.beginnerFriendly && c.category !== 'professores' && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Iniciante
            </span>
          )}
          {c.category !== 'podcasts' && c.subtitlesAvailable && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Legendado
            </span>
          )}
          {c.transcriptUrl && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/30">
              <span>Transcrição</span>
              <ExternalLink className="w-2.5 h-2.5 text-purple-400" />
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {c.topics.map((t) => (
            <span
              key={t}
              className="text-xs font-medium px-2 py-0.5 rounded-md bg-[#18181b] text-[#d4d4d8] border border-[#27272a]"
            >
              {t}
            </span>
          ))}
        </div>
        {c.category === 'podcasts' && c.avgDuration && (
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 pt-0.5">
            <Clock className="w-3.5 h-3.5 text-zinc-500 stroke-[2]" />
            <span>Episódios de {formatDurationDisplay(c.avgDuration)}</span>
          </div>
        )}
      </div>
    </div>
  );
};
