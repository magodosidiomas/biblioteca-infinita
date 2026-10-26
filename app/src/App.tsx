import { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { ChannelCard } from './components/ChannelCard';
import { PronunciaVideoCard } from './components/PronunciaVideoCard';
import { SeriesMovieCard, normalizeLangKey } from './components/SeriesMovieCard';
import { EmptyState } from './components/EmptyState';
import { CHANNELS } from './data/channels';
import { INITIAL_LANGS, SELECTED_LANG_KEY, type LanguageItem } from './constants/languages';
import { useSmartScroll } from './hooks/useSmartScroll';
import type { MediaCategory, FilterState, ChannelItem } from './types/content';

const TAB_TITLES: Record<MediaCategory, string> = {
  youtube: 'YouTube',
  professores: 'Professores',
  pronuncia: 'Pronúncia',
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
  const [languages, setLanguages] = useState<LanguageItem[]>(INITIAL_LANGS);

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<LanguageItem[]>;
      if (customEvent.detail && Array.isArray(customEvent.detail)) {
        setLanguages(customEvent.detail);
      }
    };

    window.addEventListener('immersion_languages_updated', handleUpdate);
    return () => {
      window.removeEventListener('immersion_languages_updated', handleUpdate);
    };
  }, []);

  const [selectedLanguage, setSelectedLanguage] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(SELECTED_LANG_KEY);
      const activeIds = INITIAL_LANGS.filter((l) => l.active).map((l) => l.id);
      if (saved && activeIds.includes(saved)) return saved;
      return activeIds[0] || 'english';
    } catch {
      return 'english';
    }
  });

  useEffect(() => {
    const activeIds = languages.filter((l) => l.active).map((l) => l.id);
    if (activeIds.length > 0 && !activeIds.includes(selectedLanguage)) {
      setSelectedLanguage(activeIds[0] || 'english');
    }
  }, [languages, selectedLanguage]);

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
  const { isHidden, inputFocusedRef } = useSmartScroll();

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
  const isPronunciaTab = activeTab === 'pronuncia';
  const unitSingular = isPosterTab ? 'título' : isPronunciaTab ? 'item' : 'canal';
  const unitPlural = isPosterTab ? 'títulos' : isPronunciaTab ? 'itens' : 'canais';

  const categoryCounts = useMemo(() => {
    const counts: Record<MediaCategory, number> = {
      youtube: 0,
      podcasts: 0,
      series: 0,
      movies: 0,
      sites: 0,
      professores: 0,
      pronuncia: 0,
    };
    for (const c of channels) {
      if (c.language === selectedLanguage && counts[c.category] !== undefined) {
        counts[c.category]++;
      }
    }
    return counts;
  }, [channels, selectedLanguage]);

  useEffect(() => {
    if (categoryCounts[activeTab] === 0) {
      const order: MediaCategory[] = [
        'youtube',
        'podcasts',
        'series',
        'movies',
        'sites',
        'professores',
        'pronuncia',
      ];
      const first = order.find((cat) => (categoryCounts[cat] || 0) > 0);
      if (first && first !== activeTab) {
        setActiveTab(first);
      }
    }
  }, [categoryCounts, activeTab]);

  const isPronunciaVideo = (c: ChannelItem) =>
    (c.topics || []).includes('Vídeo') ||
    /(?:youtube\.com\/(?:watch\?.*v=|shorts\/|live\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i.test(c.url || '');

  const pronunciaVideos = useMemo(
    () => (isPronunciaTab ? filteredChannels.filter(isPronunciaVideo) : []),
    [isPronunciaTab, filteredChannels]
  );

  const pronunciaResources = useMemo(
    () => (isPronunciaTab ? filteredChannels.filter((c) => !isPronunciaVideo(c)) : []),
    [isPronunciaTab, filteredChannels]
  );

  return (
    <div className="min-h-screen pb-28 text-zinc-100 bg-[#09090b] overflow-x-hidden w-full max-w-full">
      {/* Topo Unificado com Smart Auto-hide no Scroll Mobile */}
      <div
        className={`sticky top-0 z-40 bg-[#09090b] w-full max-w-full transition-transform duration-300 ease-out will-change-transform ${
          isHidden ? 'max-md:-translate-y-full max-md:pointer-events-none' : 'translate-y-0'
        }`}
      >
        <Header
          activeTab={activeTab}
          onTabChange={setActiveTab}
          selectedLanguage={selectedLanguage}
          languages={languages}
          onLanguageChange={setSelectedLanguage}
          categoryCounts={categoryCounts}
        />

        <FilterBar
          filters={filters}
          activeTab={activeTab}
          availableTopics={availableTopics}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          onSearchFocus={() => {
            inputFocusedRef.current = true;
          }}
          onSearchBlur={() => {
            inputFocusedRef.current = false;
          }}
        />
      </div>

      <main className="max-w-[1180px] mx-auto px-4 md:px-6 pt-6 w-full min-w-0">
        {!isPronunciaTab && (
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-100">{TAB_TITLES[activeTab]}</h2>
            <span className="text-xs text-zinc-500">
              {filteredChannels.length} {filteredChannels.length === 1 ? unitSingular : unitPlural}
            </span>
          </div>
        )}

        {filteredChannels.length > 0 ? (
          isPronunciaTab ? (
            <div className="space-y-10">
              {pronunciaVideos.length > 0 && (
                <section>
                  <div className="mb-4 flex items-baseline justify-between">
                    <h2 className="text-base font-bold text-zinc-100 tracking-tight">Vídeos</h2>
                    <span className="text-xs font-medium text-zinc-500">
                      {pronunciaVideos.length} {pronunciaVideos.length === 1 ? 'vídeo' : 'vídeos'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pronunciaVideos.map((channel) => (
                      <PronunciaVideoCard
                        key={channel.id}
                        channel={channel}
                        isFavorite={favorites.includes(channel.id)}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    ))}
                  </div>
                </section>
              )}

              {pronunciaResources.length > 0 && (
                <section>
                  <div className="mb-4 flex items-baseline justify-between">
                    <h2 className="text-base font-bold text-zinc-100 tracking-tight">Guias & Recursos</h2>
                    <span className="text-xs font-medium text-zinc-500">
                      {pronunciaResources.length} {pronunciaResources.length === 1 ? 'recurso' : 'recursos'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pronunciaResources.map((channel) => (
                      <ChannelCard
                        key={channel.id}
                        channel={channel}
                        isFavorite={favorites.includes(channel.id)}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          ) : (
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
          )
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
