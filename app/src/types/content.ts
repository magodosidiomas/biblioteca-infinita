export type MediaCategory =
  | 'youtube'
  | 'podcasts'
  | 'series'
  | 'movies'
  | 'sites'
  | 'professores'
  | 'pronuncia';

export type SortOption = 'name-asc' | 'name-desc' | 'favs-first';

export interface ChannelItem {
  id: string;
  category: MediaCategory;
  title: string;
  url: string;
  avatar: string | null;
  initials: string;
  description: string;
  beginnerFriendly: boolean;
  nonNative?: boolean;
  subtitlesAvailable: boolean;
  transcriptUrl?: string | null;
  avgDuration?: string | null;
  platform?: string | null;
  originalLanguage?: string | null;
  originalLanguageLabel?: string | null;
  accent?: string | null;
  flag?: string | null;
  language?: string;
  topics: string[];
}

export interface FilterState {
  searchQuery: string;
  filterBeginner: boolean;
  filterOriginalAudio?: boolean;
  filterSubs: boolean;
  filterFavs: boolean;
  selectedTopics: string[];
  sortBy: SortOption;
}

