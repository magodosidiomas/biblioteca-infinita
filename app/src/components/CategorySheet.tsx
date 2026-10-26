import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, Check } from 'lucide-react';
import { Sheet, SheetContent } from './ui/sheet';

interface CategorySheetProps {
  isOpen: boolean;
  onClose: () => void;
  availableTopics: string[];
  selectedTopics: string[];
  onChange: (topics: string[]) => void;
}

export const CategorySheet: React.FC<CategorySheetProps> = ({
  isOpen,
  onClose,
  availableTopics,
  selectedTopics,
  onChange,
}) => {
  const [search, setSearch] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setSearch('');
    }
  }, [isOpen]);

  const filteredTopics = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return availableTopics;
    return availableTopics.filter((t) => t.toLowerCase().includes(q));
  }, [availableTopics, search]);

  const handleToggle = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      onChange(selectedTopics.filter((t) => t !== topic));
    } else {
      onChange([...selectedTopics, topic]);
    }
  };

  const handleRemove = (topic: string) => {
    onChange(selectedTopics.filter((t) => t !== topic));
  };

  const handleClearAll = () => {
    onChange([]);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="!h-[85dvh] min-h-[75dvh] max-h-[88dvh] p-5 bg-[#121215] border-t border-zinc-800 rounded-t-[24px] flex flex-col">
        {/* Cabeçalho Limpo: Título direto e Ação com Respiro Perfeito */}
        <div className="flex items-center justify-between px-1 mb-3 shrink-0">
          <h2 className="text-base font-bold text-zinc-100">
            Categorias
          </h2>
          {selectedTopics.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors whitespace-nowrap cursor-pointer"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Busca Interna */}
        <div className="relative mb-3 shrink-0">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar categoria..."
            className="w-full h-10 pl-9 pr-8 bg-zinc-900/90 border border-zinc-800 focus:border-zinc-600 rounded-xl text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                searchInputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Tópicos Selecionados Ativos */}
        {selectedTopics.length > 0 && (
          <div className="pb-2 mb-2 shrink-0">
            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto custom-scroll pr-1">
              {selectedTopics.map((topic) => (
                <span
                  key={topic}
                  className="inline-flex items-center gap-1.5 pl-2.5 pr-2 py-1 rounded-md bg-[#18181b] border border-zinc-700/60 text-zinc-200 text-xs font-medium"
                >
                  <span>{topic}</span>
                  <button
                    type="button"
                    onClick={() => handleRemove(topic)}
                    className="p-0.5 hover:text-white hover:bg-zinc-700/50 rounded text-zinc-400 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Lista de Opções Rolável (4px de espaçamento, leve e plana) */}
        <div
          data-vaul-no-drag
          className="overflow-y-auto flex-1 min-h-0 custom-scroll space-y-1 pr-1 py-1"
        >
          {filteredTopics.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              Nenhuma categoria encontrada
            </div>
          ) : (
            filteredTopics.map((topic) => {
              const isSelected = selectedTopics.includes(topic);
              return (
                <button
                  key={topic}
                  type="button"
                  onClick={() => handleToggle(topic)}
                  className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-left text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-zinc-800/60 text-zinc-100 font-semibold'
                      : 'bg-transparent hover:bg-white/[0.04] text-zinc-300 hover:text-zinc-100'
                  }`}
                >
                  <span>{topic}</span>
                  {isSelected ? (
                    <Check className="w-4 h-4 text-purple-400 flex-shrink-0 stroke-[2.5]" />
                  ) : (
                    <span className="w-4 h-4" />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Rodapé com Botão Principal */}
        <div className="pt-3 mt-auto shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full h-11 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-purple-950/40"
          >
            <span>Ver resultados</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
