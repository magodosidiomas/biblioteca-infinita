import React from 'react';
import type { MediaCategory } from '../types/content';
import type { LanguageItem } from '../constants/languages';

interface HeaderProps {
  activeTab: MediaCategory;
  onTabChange: (tab: MediaCategory) => void;
  selectedLanguage: string;
  languages: LanguageItem[];
  onLanguageChange: (langId: string) => void;
}

const TABS: { id: MediaCategory; label: string }[] = [
  { id: 'youtube', label: 'YouTube' },
  { id: 'podcasts', label: 'Podcasts' },
  { id: 'series', label: 'Séries' },
  { id: 'movies', label: 'Filmes' },
  { id: 'sites', label: 'Sites' },
  { id: 'professores', label: 'Professores' },
];

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  selectedLanguage,
  languages,
  onLanguageChange,
}) => {
  const [langOpen, setLangOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const currentLang = languages.find((l) => l.id === selectedLanguage) || {
    id: selectedLanguage,
    name: selectedLanguage,
    flag: '🌐',
    active: true,
  };

  const activeLanguages = languages.filter((l) => l.active);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLangOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setLangOpen(false);
      }
    }

    if (langOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [langOpen]);

  return (
    <header className="bg-[#09090b] sticky top-0 z-50">
      {/* Tier 1: Brand & TopNav Actions */}
      <div className="border-b border-zinc-800/80">
        <div className="max-w-[1180px] mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-2.5 flex-shrink-0 text-zinc-100 no-underline">
            <span className="text-xl">🧙🏻‍♂️</span>
            <span className="font-bold text-base tracking-tight text-zinc-100">
              Biblioteca Infinita
            </span>
          </a>

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setLangOpen((prev) => !prev)}
              aria-expanded={langOpen}
              aria-haspopup="listbox"
              className={`h-9 px-3.5 rounded-lg bg-[#111114] border text-sm font-medium text-zinc-200 flex items-center gap-2.5 transition-colors cursor-pointer ${
                langOpen ? 'border-zinc-700 bg-[#16161a]' : 'border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <span className="text-base leading-none">{currentLang.flag}</span>
              <span>{currentLang.name}</span>
              <svg
                className={`w-4 h-4 text-zinc-400 -mr-0.5 transition-transform duration-200 ${
                  langOpen ? 'rotate-180 text-zinc-200' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {langOpen && (
              <div
                role="listbox"
                className="absolute right-0 mt-1.5 w-52 max-h-72 overflow-y-auto bg-[#111114] border border-zinc-800 rounded-xl p-1.5 shadow-xl shadow-black/60 z-50 animate-in fade-in zoom-in-95 duration-100 space-y-1"
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
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tier 2: Tabs (sem linhas cortando acima ou abaixo) */}
      <nav className="bg-[#09090b]">
        <div className="max-w-[1180px] mx-auto px-6 flex items-center gap-8 text-sm font-medium overflow-x-auto whitespace-nowrap">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`py-3.5 border-b-2 transition-colors cursor-pointer ${
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
    </header>
  );
};
