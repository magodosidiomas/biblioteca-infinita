import { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { ChannelCard } from './components/ChannelCard';
import { SeriesMovieCard, normalizeLangKey } from './components/SeriesMovieCard';
import { EmptyState } from './components/EmptyState';
import { CHANNELS } from './data/channels';
import { INITIAL_LANGS, LANG_STORAGE_KEY, SELECTED_LANG_KEY, mergeWithInitialLangs, type LanguageItem } from './constants/languages';
import type { MediaCategory, FilterState } from './types/content';

const TAB_TITLES: Record<MediaCategory, string> = {
  youtube: 'YouTube',
  professores: 'Professores',
  podcasts: 'Podcasts',
  series: 'Séries',
  movies: 'Filmes',
  sites: 'Sites',
};

const INITIAL_FILTERS: FilterState = {
  searchQuery: '',
  filterBeginner: false,
  filterOriginalAudio: false,
  filterSubs: false,
  filterFavs: false,
  selectedTopics: [],
  sortBy: 'name-asc',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<MediaCategory>('youtube');
  const [languages] = useState<LanguageItem[]>(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return mergeWithInitialLangs(parsed);
      }
    } catch {
      // ignore
    }
    return INITIAL_LANGS;
  });

  const [selectedLanguage, setSelectedLanguage] = useState<string>(() => {
    try {
      return localStorage.getItem(SELECTED_LANG_KEY) || 'english';
    } catch {
      return 'english';
    }
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('immersion_favs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [channels, setChannels] = useState<typeof CHANNELS>(CHANNELS);

  useEffect(() => {
    try {
      localStorage.setItem('immersion_favs', JSON.stringify(favorites));
    } catch {
      // ignore
    }
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem(SELECTED_LANG_KEY, selectedLanguage);
    } catch {
      // ignore
    }
  }, [selectedLanguage]);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    fetch('/api/get-channels')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setChannels(data);
      })
      .catch(() => {});
  }, []);

  const handleFilterChange = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => setFilters(INITIAL_FILTERS);

  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const currentCategoryItems = useMemo(
    () =>
      channels.filter((item) => {
        const itemLang = item.language || 'english';
        return item.category === activeTab && itemLang === selectedLanguage;
      }),
    [channels, activeTab, selectedLanguage]
  );

  const availableTopics = useMemo(() => {
    const set = new Set<string>();
    currentCategoryItems.forEach((item) => item.topics?.forEach((t) => set.add(t)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [currentCategoryItems]);

  const filteredChannels = useMemo(() => {
    const q = filters.searchQuery.toLowerCase().trim();
    const list = currentCategoryItems.filter((item) => {
      if (
        q &&
        !item.title.toLowerCase().includes(q) &&
        !item.description.toLowerCase().includes(q) &&
        !(item.platform && item.platform.toLowerCase().includes(q)) &&
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
        } else if (!item.subtitlesAvailable) {
          return false;
        }
      }
      if (filters.filterFavs && !favorites.includes(item.id)) return false;
      if (
        filters.selectedTopics?.length > 0 &&
        !filters.selectedTopics.some((selected) => item.topics?.includes(selected))
      ) {
        return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (filters.sortBy === 'favs-first') {
        const aFav = favorites.includes(a.id) ? 1 : 0;
        const bFav = favorites.includes(b.id) ? 1 : 0;
        if (bFav !== aFav) return bFav - aFav;
      }

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
  }, [currentCategoryItems, filters, favorites, activeTab]);

  const isPosterTab = activeTab === 'series' || activeTab === 'movies';
  const unitSingular = isPosterTab ? 'título' : 'canal';
  const unitPlural = isPosterTab ? 'títulos' : 'canais';

  return (
    <div className="min-h-screen pb-28 text-zinc-100 bg-[#09090b]">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedLanguage={selectedLanguage}
        languages={languages}
        onLanguageChange={setSelectedLanguage}
      />

      <FilterBar
        filters={filters}
        activeTab={activeTab}
        availableTopics={availableTopics}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      <main className="max-w-[1180px] mx-auto px-6 pt-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-bold text-zinc-100">{TAB_TITLES[activeTab]}</h2>
          <span className="text-xs text-zinc-500">
            {filteredChannels.length} {filteredChannels.length === 1 ? unitSingular : unitPlural}
          </span>
        </div>

        {filteredChannels.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChannels.map((channel) =>
              channel.category === 'series' || channel.category === 'movies' ? (
                <SeriesMovieCard
                  key={channel.id}
                  channel={channel}
                  isFavorite={favorites.includes(channel.id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ) : (
                <ChannelCard
                  key={channel.id}
                  channel={channel}
                  isFavorite={favorites.includes(channel.id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              )
            )}
          </div>
        ) : (
          <EmptyState
            title={
              currentCategoryItems.length === 0
                ? `Nenhum item em ${TAB_TITLES[activeTab]}`
                : 'Nenhum resultado encontrado'
            }
            description={
              currentCategoryItems.length === 0
                ? 'Esta categoria ainda não possui conteúdos cadastrados para o idioma selecionado.'
                : 'Tente ajustar o termo pesquisado ou limpe os filtros ativos.'
            }
            onReset={currentCategoryItems.length > 0 ? handleResetFilters : undefined}
          />
        )}
      </main>
    </div>
  );
}
