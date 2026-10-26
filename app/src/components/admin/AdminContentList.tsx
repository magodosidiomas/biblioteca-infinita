import React, { useState, useMemo } from 'react';
import type { ChannelItem, MediaCategory, FilterState } from '../../types/content';
import { FilterBar } from '../FilterBar';
import { EmptyState } from '../EmptyState';
import { AdminEditDrawer } from './AdminEditDrawer';
import { AdminChannelCard } from './AdminChannelCard';
import { PronunciaVideoCard } from '../PronunciaVideoCard';
import { SeriesMovieCard, normalizeLangKey } from '../SeriesMovieCard';

interface AdminContentListProps {
  channels: ChannelItem[];
  selectedLanguage?: string;
  activeTab?: MediaCategory;
  onTabChange?: (tab: MediaCategory) => void;
  initialEditChannel?: ChannelItem | null;
  onClearInitialEdit?: () => void;
  onSaveChannel: (channel: ChannelItem) => void;
  onDeleteChannel: (id: string) => void;
}

const TABS: { id: MediaCategory; label: string }[] = [
  { id: 'youtube', label: 'YouTube' },
  { id: 'professores', label: 'Professores' },
  { id: 'pronuncia', label: 'Pronúncia' },
  { id: 'podcasts', label: 'Podcasts' },
  { id: 'series', label: 'Séries' },
  { id: 'movies', label: 'Filmes' },
  { id: 'sites', label: 'Sites' },
];

const INITIAL_FILTERS: FilterState = {
  searchQuery: '',
  filterBeginner: false,
  filterOriginalAudio: false,
  filterSubs: false,
  filterFavs: false,
  selectedTopics: [],
  sortBy: 'name-asc',
};

export const AdminContentList: React.FC<AdminContentListProps> = ({
  channels,
  selectedLanguage = 'english',
  activeTab: controlledTab,
  onTabChange,
  initialEditChannel = null,
  onClearInitialEdit,
  onSaveChannel,
  onDeleteChannel,
}) => {
  const [internalTab, setInternalTab] = useState<MediaCategory>('youtube');
  const activeTab = controlledTab ?? internalTab;
  const setActiveTab = (tab: MediaCategory) => {
    setInternalTab(tab);
    onTabChange?.(tab);
  };
  const [editingChannel, setEditingChannel] = useState<ChannelItem | null>(null);
  const currentEditing = editingChannel ?? initialEditChannel;
  const closeDrawer = () => {
    setEditingChannel(null);
    onClearInitialEdit?.();
  };
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

  const handleFilterChange = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const currentCategoryItems = useMemo(
    () =>
      channels.filter((item) => {
        const itemLang = item.language || 'english';
        return item.category === activeTab && itemLang === selectedLanguage;
      }),
    [channels, activeTab, selectedLanguage]
  );

  const counts: Record<string, number> = useMemo(() => {
    const res: Record<string, number> = {
      youtube: 0,
      professores: 0,
      pronuncia: 0,
      podcasts: 0,
      series: 0,
      movies: 0,
      sites: 0,
    };
    channels.forEach((c) => {
      const itemLang = c.language || 'english';
      if (itemLang === selectedLanguage && res[c.category] !== undefined) {
        res[c.category]++;
      }
    });
    return res;
  }, [channels, selectedLanguage]);

  const availableTopics = useMemo(() => {
    const set = new Set<string>();
    currentCategoryItems.forEach((item) => {
      item.topics?.forEach((t) => set.add(t));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [currentCategoryItems]);

  const filteredList = useMemo(() => {
    const q = filters.searchQuery.toLowerCase().trim();
    const list = currentCategoryItems.filter((item) => {
      if (
        q &&
        !item.title.toLowerCase().includes(q) &&
        !item.description.toLowerCase().includes(q) &&
        !item.topics.some((t) => t.toLowerCase().includes(q))
      ) {
        return false;
      }
      if (filters.filterBeginner && !item.beginnerFriendly) return false;
      if (filters.filterOriginalAudio && (item.category === 'series' || item.category === 'movies')) {
        const studyLang = normalizeLangKey(item.language, 'english');
        const origLang = normalizeLangKey(item.originalLanguage, studyLang);
        if (origLang !== studyLang) return false;
      }
      if (filters.filterSubs) {
        if (item.category === 'podcasts') {
          if (!item.transcriptUrl) return false;
        } else {
          if (!item.subtitlesAvailable) return false;
        }
      }
      if (
        filters.selectedTopics &&
        filters.selectedTopics.length > 0 &&
        !filters.selectedTopics.some((selected) => item.topics?.includes(selected))
      ) {
        return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (activeTab === 'series' || activeTab === 'movies') {
        const aStudy = normalizeLangKey(a.language, 'english');
        const aOrig = normalizeLangKey(a.originalLanguage, aStudy);
        const aIsOrig = aOrig === aStudy ? 1 : 0;

        const bStudy = normalizeLangKey(b.language, 'english');
        const bOrig = normalizeLangKey(b.originalLanguage, bStudy);
        const bIsOrig = bOrig === bStudy ? 1 : 0;

        if (bIsOrig !== aIsOrig) return bIsOrig - aIsOrig;
      }

      if (filters.sortBy === 'name-desc') return b.title.localeCompare(a.title);
      return a.title.localeCompare(b.title);
    });
  }, [currentCategoryItems, filters, activeTab]);

  const tabLabel =
    activeTab === 'youtube'
      ? 'canais de imersão'
      : activeTab === 'professores'
      ? 'professores'
      : activeTab === 'pronuncia'
      ? 'itens de pronúncia'
      : activeTab === 'podcasts'
      ? 'podcasts'
      : activeTab === 'series'
      ? 'séries'
      : activeTab === 'movies'
      ? 'filmes'
      : 'sites';

  const [toastMsg, setToastMsg] = useState('');

  const handleSaveWithToast = (ch: ChannelItem) => {
    onSaveChannel(ch);
    setToastMsg('Alterações salvas com sucesso.');
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleDeleteWithToast = (id: string) => {
    const isPoster = activeTab === 'series' || activeTab === 'movies';
    onDeleteChannel(id);
    setToastMsg(isPoster ? 'Título excluído com sucesso.' : 'Item excluído com sucesso.');
    setTimeout(() => setToastMsg(''), 3000);
  };

  return (
    <div>
      <nav className="bg-[#09090b]">
        <div className="max-w-[1180px] mx-auto px-6 flex gap-7 overflow-x-auto">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 text-[14px] font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'text-[#f4f4f5] font-semibold border-[#a855f7]'
                    : 'text-[#a1a1aa] hover:text-[#f4f4f5] border-transparent'
                }`}
              >
                {tab.label} ({counts[tab.id] || 0})
              </button>
            );
          })}
        </div>
      </nav>

      <FilterBar
        filters={filters}
        activeTab={activeTab}
        availableTopics={availableTopics}
        onFilterChange={handleFilterChange}
        onResetFilters={() => setFilters(INITIAL_FILTERS)}
        stickyClassName="sticky top-[56px]"
      />

      <div className="max-w-[1180px] mx-auto px-6 py-6">
        <div className="flex justify-between items-center mb-5">
          <div className="text-[13px] text-[#a1a1aa]">
            Exibindo {filteredList.length} {tabLabel}
          </div>
          <div className="text-[12px] text-[#a1a1aa]">Passe o mouse no card para editar</div>
        </div>

        {filteredList.length === 0 ? (
          <EmptyState
            title={
              currentCategoryItems.length === 0
                ? `Nenhum item em ${tabLabel}`
                : 'Nenhum canal encontrado'
            }
            description={
              currentCategoryItems.length === 0
                ? 'Esta categoria ainda não possui conteúdos cadastrados para o idioma selecionado.'
                : 'Tente ajustar o termo pesquisado ou limpe os filtros ativos.'
            }
            onReset={currentCategoryItems.length > 0 ? () => setFilters(INITIAL_FILTERS) : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredList.map((c) =>
              c.category === 'series' || c.category === 'movies' ? (
                <SeriesMovieCard key={c.id} channel={c} onEdit={setEditingChannel} />
              ) : c.category === 'pronuncia' && ((c.topics || []).includes('Vídeo') || /(?:youtube\.com\/(?:watch\?.*v=|shorts\/|live\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i.test(c.url || '')) ? (
                <PronunciaVideoCard key={c.id} channel={c} onEdit={setEditingChannel} />
              ) : (
                <AdminChannelCard key={c.id} channel={c} onEdit={setEditingChannel} />
              )
            )}
          </div>
        )}
      </div>

      <AdminEditDrawer
        channel={currentEditing}
        isOpen={!!currentEditing}
        onClose={closeDrawer}
        onSave={handleSaveWithToast}
        onDelete={handleDeleteWithToast}
      />

      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#18181b] border border-[#3f3f46] text-[#f4f4f5] text-xs font-medium px-4 py-2.5 rounded-lg shadow-2xl z-[110] animate-in fade-in duration-200">
          {toastMsg}
        </div>
      )}
    </div>
  );
};
