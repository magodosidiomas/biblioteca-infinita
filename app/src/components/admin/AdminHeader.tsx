import React, { useState, useRef, useEffect } from 'react';
import type { LanguageItem } from '../../constants/languages';
import { FlagIcon } from '../FlagIcon';

export type AdminView = 'content' | 'new' | 'languages';

interface AdminHeaderProps {
  currentView: AdminView;
  onViewChange: (view: AdminView) => void;
  selectedLanguage?: string;
  languages?: LanguageItem[];
  onLanguageChange?: (langId: string) => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  currentView,
  onViewChange,
  selectedLanguage,
  languages = [],
  onLanguageChange,
}) => {
  const [langOpen, setLangOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = languages.find((l) => l.id === selectedLanguage) || {
    id: selectedLanguage || 'english',
    name: selectedLanguage || 'Inglês',
    flag: '🌐',
    active: true,
  };

  const activeLanguages = languages.filter((l) => l.active);

  useEffect(() => {
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
    <div className="border-b border-[#1f1f23] bg-[#09090b] sticky top-0 z-50">
      <div className="max-w-[1180px] mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-2.5 font-bold text-[15px] text-[#f4f4f5] no-underline">
            <span className="text-xl">🧙🏻‍♂️</span>
            <span>Biblioteca Infinita</span>
          </a>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 tracking-wider">
            ADMIN
          </span>
        </div>

        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onViewChange('content')}
              className={`text-[13px] px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                currentView === 'content'
                  ? 'bg-[#18181b] text-[#f4f4f5] font-semibold border border-[#27272a]'
                  : 'text-[#a1a1aa] hover:text-[#f4f4f5] bg-transparent'
              }`}
            >
              Conteúdos
            </button>

            <button
              type="button"
              onClick={() => onViewChange('languages')}
              className={`text-[13px] px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                currentView === 'languages'
                  ? 'bg-[#18181b] text-[#f4f4f5] font-semibold border border-[#27272a]'
                  : 'text-[#a1a1aa] hover:text-[#f4f4f5] bg-transparent'
              }`}
            >
              Idiomas
            </button>
          </nav>

          <button
            type="button"
            onClick={() => onViewChange('new')}
            className={`text-[13px] px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              currentView === 'new'
                ? 'bg-white text-[#09090b] shadow-sm'
                : 'bg-[#f4f4f5] text-[#09090b] hover:bg-white active:scale-95'
            }`}
          >
            <span>+</span>
            <span>Novo conteúdo</span>
          </button>

          {onLanguageChange && (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setLangOpen((prev) => !prev)}
                aria-expanded={langOpen}
                aria-haspopup="listbox"
                className={`h-8 px-3 rounded-lg bg-[#111114] border text-xs font-medium text-zinc-200 flex items-center gap-2 transition-colors cursor-pointer ${
                  langOpen ? 'border-zinc-700 bg-[#16161a]' : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <FlagIcon languageId={currentLang.id} flag={currentLang.flag} alt={currentLang.name} />
                <span>{currentLang.name}</span>
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

              {langOpen && (
                <div
                  role="listbox"
                  className="absolute right-0 mt-1.5 w-48 max-h-72 overflow-y-auto bg-[#111114] border border-zinc-800 rounded-xl p-1.5 shadow-xl shadow-black/60 z-50 animate-in fade-in zoom-in-95 duration-100 space-y-1"
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
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer text-left transition-colors ${
                          isSelected
                            ? 'text-zinc-100 bg-[#18181b]'
                            : 'text-zinc-300 hover:text-zinc-100 hover:bg-[#18181b]/60'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <FlagIcon languageId={lang.id} flag={lang.flag} alt={lang.name} />
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
          )}

          <a
            href="/"
            className="text-[12px] text-[#a1a1aa] hover:text-[#f4f4f5] pl-3 border-l border-[#27272a] no-underline transition-colors"
          >
            Sair ↗
          </a>
        </div>
      </div>
    </div>
  );
};
