import React from 'react';
import { Check, ExternalLink } from 'lucide-react';
import { Sheet, SheetContent } from './ui/sheet';
import type { LanguageItem } from '../constants/languages';

interface LanguageDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  languages: LanguageItem[];
  selectedLanguage: string;
  onLanguageChange: (langId: string) => void;
}

export const LanguageDrawer: React.FC<LanguageDrawerProps> = ({
  isOpen,
  onClose,
  languages,
  selectedLanguage,
  onLanguageChange,
}) => {
  const activeLanguages = languages.filter((l) => l.active);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="max-h-[75vh] p-4 bg-[#121215] border-t border-zinc-800 rounded-t-[24px]">
        {/* Header */}
        <div className="px-2 mb-3">
          <h2 className="text-base font-semibold tracking-tight text-zinc-100">
            Idioma
          </h2>
        </div>

        {/* Lista de Idiomas Ativos */}
        <div className="space-y-1 overflow-y-auto max-h-[50vh] pr-1 custom-scroll">
          {activeLanguages.length === 0 ? (
            <div className="py-6 text-center text-sm text-zinc-500">
              Nenhum idioma ativo
            </div>
          ) : (
            activeLanguages.map((lang) => {
              const isSelected = lang.id === selectedLanguage;
              return (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => {
                    onLanguageChange(lang.id);
                    onClose();
                  }}
                  className={`w-full min-h-[48px] flex items-center justify-between py-2.5 px-3.5 rounded-xl transition-all text-left cursor-pointer ${
                    isSelected
                      ? 'bg-zinc-800/80 font-medium text-zinc-100'
                      : 'hover:bg-zinc-800/40 text-zinc-300 hover:text-zinc-100 active:bg-zinc-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="text-xl shrink-0 leading-none">{lang.flag}</span>
                    <span className="text-sm font-semibold text-zinc-100 truncate">
                      {lang.name}
                    </span>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-purple-400 shrink-0 stroke-[2.25px]" />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Gerenciar Idiomas (Imerso pattern) */}
        {import.meta.env.DEV && (
          <div className="pt-2 mt-2">
            <a
              href="/admin"
              onClick={onClose}
              className="w-full h-11 min-h-[44px] rounded-xl bg-zinc-800/40 hover:bg-zinc-800/80 text-zinc-200 text-sm font-semibold transition-colors flex items-center justify-center gap-2 no-underline cursor-pointer"
            >
              <span>Gerenciar idiomas</span>
              <ExternalLink className="w-4 h-4 text-zinc-400" />
            </a>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
