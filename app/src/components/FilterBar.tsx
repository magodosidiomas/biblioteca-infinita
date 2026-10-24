import React from 'react';
import { Search, Check, Heart, ChevronDown } from 'lucide-react';
import { CategoryCombobox } from './CategoryCombobox';
import type { FilterState, MediaCategory, SortOption } from '../types/content';

interface FilterBarProps {
  filters: FilterState;
  activeTab: MediaCategory;
  availableTopics: string[];
  onFilterChange: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onResetFilters: () => void;
  stickyClassName?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  activeTab,
  availableTopics,
  onFilterChange,
  onResetFilters,
  stickyClassName = 'sticky top-[98px]',
}) => {
  const isPosterTab = activeTab === 'series' || activeTab === 'movies';

  const isFiltering =
    Boolean(filters.searchQuery) ||
    filters.filterBeginner ||
    Boolean(filters.filterOriginalAudio) ||
    filters.filterSubs ||
    filters.filterFavs ||
    (filters.selectedTopics && filters.selectedTopics.length > 0);


  return (
    <section className={`bg-[#09090b] pt-4 pb-2 z-40 ${stickyClassName}`}>
      <div className="max-w-[1180px] mx-auto px-6 space-y-3">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange('searchQuery', e.target.value)}
            placeholder={
              isPosterTab
                ? 'Buscar por título, gênero ou plataforma...'
                : 'Buscar por canal, assunto ou palavra-chave...'
            }
            className="w-full pl-10 pr-4 h-10 bg-transparent border border-white/[0.08] focus:border-purple-500 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {activeTab !== 'professores' && (
              <button
                type="button"
                onClick={() => onFilterChange('filterBeginner', !filters.filterBeginner)}
                className={`h-8 px-3 rounded-lg border text-xs transition-all inline-flex items-center cursor-pointer ${
                  filters.filterBeginner
                    ? 'border-emerald-700/60 bg-[#152319] text-emerald-300 font-semibold'
                    : 'border-white/[0.08] bg-transparent text-zinc-300 hover:text-zinc-100 hover:bg-white/[0.03] font-medium'
                }`}
              >
                Para iniciantes
              </button>
            )}

            {isPosterTab && (
              <button
                type="button"
                onClick={() => onFilterChange('filterOriginalAudio', !filters.filterOriginalAudio)}
                className={`h-8 px-3 rounded-lg border text-xs transition-all inline-flex items-center cursor-pointer ${
                  filters.filterOriginalAudio
                    ? 'border-emerald-700/60 bg-[#152319] text-emerald-300 font-semibold'
                    : 'border-white/[0.08] bg-transparent text-zinc-300 hover:text-zinc-100 hover:bg-white/[0.03] font-medium'
                }`}
              >
                Apenas Áudio Original
              </button>
            )}

            <button
              type="button"
              onClick={() => onFilterChange('filterSubs', !filters.filterSubs)}
              className={`h-8 px-3 rounded-lg border text-xs transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                filters.filterSubs
                  ? 'border-purple-700/60 bg-purple-950/40 text-purple-200 font-semibold'
                  : 'border-white/[0.08] bg-transparent text-zinc-300 hover:text-zinc-100 hover:bg-white/[0.03] font-medium'
              }`}
            >
              <Check className="w-3.5 h-3.5 text-zinc-400 stroke-[2.5]" />
              <span>{activeTab === 'podcasts' ? 'Com transcrição' : 'Legendas'}</span>
            </button>

            <button
              type="button"
              onClick={() => onFilterChange('filterFavs', !filters.filterFavs)}
              className={`h-8 px-3 rounded-lg border text-xs transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                filters.filterFavs
                  ? 'border-rose-800/60 bg-rose-950/40 text-rose-200 font-semibold'
                  : 'border-white/[0.08] bg-transparent text-zinc-300 hover:text-zinc-100 hover:bg-white/[0.03] font-medium'
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
              <span>Favoritos</span>
            </button>

            {availableTopics.length > 0 && (
              <CategoryCombobox
                availableTopics={availableTopics}
                selectedTopics={filters.selectedTopics || []}
                onChange={(topics) => onFilterChange('selectedTopics', topics)}
              />
            )}

            {isFiltering && (
              <button
                type="button"
                onClick={onResetFilters}
                className="h-8 px-3 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors inline-flex items-center cursor-pointer"
              >
                Limpar filtros
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">Ordenar:</span>
            <div className="relative inline-flex items-center">
              <select
                value={filters.sortBy}
                onChange={(e) => onFilterChange('sortBy', e.target.value as SortOption)}
                className="h-8 pl-3 pr-8 bg-[#111114] border border-white/[0.08] hover:border-zinc-700 rounded-lg text-xs font-medium text-zinc-300 focus:outline-none focus:border-zinc-500 appearance-none cursor-pointer transition-colors"
              >
                <option value="name-asc" className="bg-[#111114]">Nome (A-Z)</option>
                <option value="name-desc" className="bg-[#111114]">Nome (Z-A)</option>
                <option value="favs-first" className="bg-[#111114]">Favoritos primeiro</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
