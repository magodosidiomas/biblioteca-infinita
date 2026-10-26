import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, X, Search, Check } from 'lucide-react';
import { CategorySheet } from './CategorySheet';

interface CategoryComboboxProps {
  availableTopics: string[];
  selectedTopics: string[];
  onChange: (topics: string[]) => void;
}

export const CategoryCombobox: React.FC<CategoryComboboxProps> = ({
  availableTopics,
  selectedTopics,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearch('');
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setIsOpen(false);
  };

  const filteredTopics = useMemo(() => {
    const q = search.toLowerCase().trim();
    return q ? availableTopics.filter((t) => t.toLowerCase().includes(q)) : availableTopics;
  }, [availableTopics, search]);

  const handleToggle = (topic: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(
      selectedTopics.includes(topic)
        ? selectedTopics.filter((t) => t !== topic)
        : [...selectedTopics, topic]
    );
  };

  const handleRemove = (topic: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedTopics.filter((t) => t !== topic));
  };

  const handleTriggerClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsMobileSheetOpen(true);
    } else {
      setIsOpen((prev) => !prev);
    }
  };

  const hasSelection = selectedTopics.length > 0;
  const firstSelected = selectedTopics[0];
  const remainingCount = selectedTopics.length - 1;

  return (
    <div className="relative inline-block flex-shrink-0" ref={wrapperRef} onKeyDown={handleKeyDown}>
      <button
        type="button"
        onClick={handleTriggerClick}
        className={`h-9 px-3.5 rounded-lg border text-sm font-medium inline-flex items-center gap-2 transition-colors cursor-pointer ${
          hasSelection
            ? 'border-zinc-700 bg-zinc-800/40 text-zinc-100'
            : 'border-white/[0.08] bg-transparent hover:bg-white/[0.04] text-zinc-300 hover:text-zinc-100'
        }`}
      >
        <div className="flex items-center gap-1.5">
          {!hasSelection ? (
            <span className="text-zinc-300">Categorias</span>
          ) : (
            <>
              <span className="inline-flex items-center gap-1.5 pl-2 pr-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-medium leading-none">
                <span>{firstSelected}</span>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => handleRemove(firstSelected, e)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRemove(firstSelected, e as any)}
                  className="p-0.5 hover:text-white text-zinc-400 cursor-pointer"
                  title="Remover categoria"
                >
                  <X className="w-3 h-3" />
                </span>
              </span>
              {remainingCount > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-xs font-medium leading-none">
                  +{remainingCount}
                </span>
              )}
            </>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-150 pointer-events-none ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover Desktop (>= 768px) */}
      {isOpen && (
        <div className="hidden md:block absolute left-0 top-full mt-1.5 w-[360px] bg-[#121215] border border-zinc-800 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
          {hasSelection && (
            <div className="pb-2.5 mb-2.5 border-b border-zinc-800/80">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Selecionadas</span>
                <button type="button" onClick={() => onChange([])} className="text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer">
                  Limpar
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                {selectedTopics.map((topic) => (
                  <span key={topic} className="inline-flex items-center gap-1.5 pl-2.5 pr-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-medium">
                    <span>{topic}</span>
                    <button type="button" onClick={(e) => handleRemove(topic, e)} className="p-0.5 hover:text-white hover:bg-zinc-800 rounded text-zinc-400 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="relative mb-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar categoria..."
              className="w-full pl-10 pr-3.5 h-[42px] bg-zinc-900 border border-zinc-800 focus:border-zinc-600 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
            {filteredTopics.length === 0 ? (
              <div className="py-6 text-center text-sm text-zinc-500">Nenhuma categoria encontrada</div>
            ) : (
              filteredTopics.map((topic) => {
                const isSelected = selectedTopics.includes(topic);
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={(e) => handleToggle(topic, e)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected ? 'bg-zinc-800/80 text-zinc-100 font-medium' : 'text-zinc-300 hover:bg-zinc-800/40 hover:text-zinc-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'border-zinc-400 bg-zinc-200 text-zinc-900' : 'border-zinc-700 bg-transparent'}`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <span>{topic}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Bottom Sheet Mobile (< 768px) */}
      <CategorySheet
        isOpen={isMobileSheetOpen}
        onClose={() => setIsMobileSheetOpen(false)}
        availableTopics={availableTopics}
        selectedTopics={selectedTopics}
        onChange={onChange}
      />
    </div>
  );
};
