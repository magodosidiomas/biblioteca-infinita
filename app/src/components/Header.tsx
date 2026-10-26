import React from 'react';
import { ExternalLink } from 'lucide-react';
import { LanguageDrawer } from './LanguageDrawer';
import type { MediaCategory } from '../types/content';
import { getLanguageCode, type LanguageItem } from '../constants/languages';

interface HeaderProps {
  activeTab: MediaCategory;
  onTabChange: (tab: MediaCategory) => void;
  selectedLanguage: string;
  languages: LanguageItem[];
  onLanguageChange: (langId: string) => void;
  categoryCounts?: Record<MediaCategory, number>;
}

const TABS: { id: MediaCategory; label: string }[] = [
  { id: 'youtube', label: 'YouTube' },
  { id: 'podcasts', label: 'Podcasts' },
  { id: 'series', label: 'Séries' },
  { id: 'movies', label: 'Filmes' },
  { id: 'sites', label: 'Sites' },
  { id: 'professores', label: 'Professores' },
  { id: 'pronuncia', label: 'Pronúncia' },
];

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  selectedLanguage,
  languages,
  onLanguageChange,
  categoryCounts,
}) => {
  const [langOpen, setLangOpen] = React.useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const visibleTabs = React.useMemo(() => {
    if (!categoryCounts) return TABS;
    const filtered = TABS.filter((t) => (categoryCounts[t.id] || 0) > 0);
    return filtered.length > 0 ? filtered : [TABS[0]];
  }, [categoryCounts]);

  const currentLang = languages.find((l) => l.id === selectedLanguage) || {
    id: selectedLanguage, name: selectedLanguage, flag: '🌐', active: true,
  };

  const activeLanguages = languages.filter((l) => l.active);

  React.useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLangOpen(false);
    };
    if (langOpen) {
      document.addEventListener('mousedown', handleOutside);
      document.addEventListener('keydown', handleKey);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [langOpen]);

  const handleLangButtonClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setMobileDrawerOpen(true);
    } else {
      setLangOpen((prev) => !prev);
    }
  };

  return (
    <header className="bg-[#09090b] w-full max-w-full">
      {/* Tier 1: Brand & TopNav Actions */}
      <div className="border-b border-zinc-800/80">
        <div className="max-w-[1180px] mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-3">
          <a href="/" className="flex items-center gap-2 flex-shrink-0 text-zinc-100 no-underline">
            <span className="text-xl">🧙🏻‍♂️</span>
            <span className="font-bold text-base tracking-tight text-zinc-100">
              Biblioteca Infinita
            </span>
          </a>

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={handleLangButtonClick}
              aria-expanded={langOpen || mobileDrawerOpen}
              aria-haspopup="listbox"
              className={`h-9 px-3 rounded-lg bg-[#111114] border text-sm font-medium text-zinc-200 flex items-center gap-2 transition-colors cursor-pointer hover:border-zinc-700 active:scale-95 ${
                langOpen ? 'border-zinc-700 bg-[#16161a]' : 'border-zinc-800'
              }`}
            >
              <span className="text-base leading-none">{currentLang.flag}</span>
              <span className="sm:hidden text-xs font-semibold tracking-wider text-zinc-300">
                {getLanguageCode(currentLang.id)}
              </span>
              <span className="hidden sm:inline">{currentLang.name}</span>
              <svg
                className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${
                  langOpen ? 'rotate-180 text-zinc-200' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Popover Desktop (>= 768px) */}
            {langOpen && (
              <div
                role="listbox"
                className="hidden md:block absolute right-0 mt-1.5 w-56 max-h-80 overflow-y-auto bg-[#111114] border border-zinc-800 rounded-xl p-1.5 shadow-xl shadow-black/60 z-50 animate-in fade-in zoom-in-95 duration-100 space-y-1 custom-scroll"
              >
                {activeLanguages.map((lang) => {
                  const isSelected = lang.id === selectedLanguage;
                  return (
                    <button
                      key={lang.id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onLanguageChange(lang.id);
                        setLangOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium cursor-pointer text-left transition-colors ${
                        isSelected
                          ? 'text-zinc-100 bg-[#18181b]'
                          : 'text-zinc-300 hover:text-zinc-100 hover:bg-[#18181b]/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base leading-none">{lang.flag}</span>
                        <span>{lang.name}</span>
                      </div>
                      {isSelected && (
                        <span className="text-xs text-purple-400 font-semibold">✓</span>
                      )}
                    </button>
                  );
                })}

                {import.meta.env.DEV && (
                  <div className="pt-1 mt-1">
                    <a
                      href="/admin"
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-zinc-100 hover:bg-[#18181b]/60 no-underline cursor-pointer transition-colors"
                    >
                      <span>Gerenciar idiomas</span>
                      <ExternalLink className="w-4 h-4 text-zinc-400" />
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tier 2: Tabs */}
      <nav className="bg-[#09090b] w-full max-w-full">
        <div className="max-w-[1180px] mx-auto px-4 md:px-6 flex items-center gap-6 sm:gap-8 text-sm font-medium overflow-x-auto whitespace-nowrap no-scrollbar w-full min-w-0">
          {visibleTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`py-3.5 border-b-2 transition-colors cursor-pointer flex-shrink-0 ${
                  isActive
                    ? 'border-purple-500 text-zinc-100 font-semibold'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Drawer de Idiomas (< 768px, padrão Imerso) */}
      <LanguageDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        languages={languages}
        selectedLanguage={selectedLanguage}
        onLanguageChange={onLanguageChange}
      />
    </header>
  );
};
