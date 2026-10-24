import React, { useState, useMemo, useEffect } from 'react';
import { PRESET_CATALOG, INITIAL_LANGS, mergeWithInitialLangs, type LanguageItem } from '../../constants/languages';

const STORAGE_KEY = 'immersion_admin_languages_v1';

export const AdminLanguages: React.FC = () => {
  const [langs, setLangs] = useState<LanguageItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return mergeWithInitialLangs(parsed);
      }
    } catch {
      // fallback
    }
    return INITIAL_LANGS;
  });

  const [showCatalog, setShowCatalog] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'az' | 'active'>('default');

  // Custom language input state
  const [cFlag, setCFlag] = useState('');
  const [cName, setCName] = useState('');
  const [cSlug, setCSlug] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(langs));
    } catch (e) {
      console.error(e);
    }
  }, [langs]);

  const filteredAndSortedLangs = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = langs.filter(
      (l) => l.name.toLowerCase().includes(q) || l.id.toLowerCase().includes(q)
    );

    if (sortBy === 'default') {
      list.sort((a, b) => {
        if (a.id === 'english') return -1;
        if (b.id === 'english') return 1;
        return a.name.localeCompare(b.name, 'pt-BR');
      });
    } else if (sortBy === 'az') {
      list.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    } else if (sortBy === 'active') {
      list.sort((a, b) =>
        b.active === a.active ? a.name.localeCompare(b.name, 'pt-BR') : b.active ? 1 : -1
      );
    }

    return list;
  }, [langs, search, sortBy]);

  const toggleActive = (id: string) => {
    setLangs((prev) =>
      prev.map((l) => (l.id === id ? { ...l, active: !l.active } : l))
    );
  };

  const addFromPreset = (id: string) => {
    const found = PRESET_CATALOG.find((p) => p.id === id);
    if (!found || langs.some((l) => l.id === id)) return;
    setLangs((prev) => [
      ...prev,
      { id: found.id, name: found.name, flag: found.flag, active: true },
    ]);
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const name = cName.trim();
    if (!name) return;
    const flag = cFlag.trim() || '🌐';
    const slug =
      cSlug.trim() || name.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (langs.some((l) => l.id === slug)) return;

    setLangs((prev) => [
      ...prev,
      { id: slug, name, flag, active: true },
    ]);
    setCFlag('');
    setCName('');
    setCSlug('');
    setShowCatalog(false);
  };

  return (
    <div className="max-w-[680px] mx-auto px-6 pt-7 pb-20 text-[#f4f4f5]">
      {/* Header */}
      <div className="flex justify-between items-end mb-5">
        <div>
          <h1 className="text-[20px] font-bold text-zinc-100">Idiomas</h1>
          <div className="text-[13px] text-zinc-400 mt-0.5">
            Gerencie quais idiomas aparecem no seletor e na navegação.
          </div>
        </div>
        <button
          onClick={() => setShowCatalog((prev) => !prev)}
          className="bg-[#f4f4f5] text-[#09090b] hover:bg-white rounded-lg px-3.5 py-[7px] font-semibold text-[13px] transition-colors cursor-pointer"
        >
          + Adicionar idioma
        </button>
      </div>

      {/* Catalog Dropdown Box */}
      {showCatalog && (
        <div className="bg-[#18181b] border border-zinc-700/80 rounded-[10px] p-4 mb-5">
          <div className="text-[13px] font-semibold text-zinc-100 mb-2.5 flex justify-between items-center">
            <span>Idiomas disponíveis para ativação imediata:</span>
            <button
              onClick={() => setShowCatalog(false)}
              className="bg-transparent border-0 text-zinc-400 hover:text-zinc-200 text-[12px] cursor-pointer"
            >
              Fechar ✕
            </button>
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-1.5 max-h-[220px] overflow-y-auto py-1">
            {PRESET_CATALOG.map((p) => {
              const isAdded = langs.some((l) => l.id === p.id);
              return (
                <button
                  key={p.id}
                  disabled={isAdded}
                  onClick={() => addFromPreset(p.id)}
                  className={`bg-[#111114] border border-[#27272a] rounded-md px-2.5 py-1.5 text-[12.5px] text-zinc-300 text-left flex items-center gap-2 transition-all ${
                    isAdded
                      ? 'opacity-40 cursor-default border-dashed border-zinc-700/60'
                      : 'hover:border-zinc-700 hover:bg-[#1f1f23] hover:text-white cursor-pointer'
                  }`}
                >
                  <span className="text-base">{p.flag}</span>
                  <span className="truncate">{p.name}</span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSaveCustom} className="border-t border-[#27272a] pt-3 mt-3 flex gap-2">
            <input
              placeholder="🏳️"
              maxLength={4}
              value={cFlag}
              onChange={(e) => setCFlag(e.target.value)}
              className="w-11 text-center bg-[#111114] border border-[#27272a] rounded-md px-2.5 py-1.5 text-[12.5px] text-white focus:outline-none focus:border-zinc-600"
            />
            <input
              placeholder="Outro idioma (ex: Esperanto)"
              value={cName}
              onChange={(e) => setCName(e.target.value)}
              className="flex-1 bg-[#111114] border border-[#27272a] rounded-md px-2.5 py-1.5 text-[12.5px] text-white focus:outline-none focus:border-zinc-600"
            />
            <input
              placeholder="slug (ex: esperanto)"
              value={cSlug}
              onChange={(e) => setCSlug(e.target.value)}
              className="w-[140px] bg-[#111114] border border-[#27272a] rounded-md px-2.5 py-1.5 text-[12.5px] text-white focus:outline-none focus:border-zinc-600"
            />
            <button
              type="submit"
              className="bg-[#f4f4f5] text-[#09090b] hover:bg-white rounded-md px-3 py-1.5 font-semibold text-[12px] transition-colors cursor-pointer"
            >
              Adicionar
            </button>
          </form>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex gap-2.5 mb-4 items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar idioma por nome ou slug..."
          className="flex-1 bg-[#111114] border border-[#27272a] rounded-lg px-3 py-2 text-zinc-100 text-[13px] placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          aria-label="Ordenar idiomas"
          className="bg-[#111114] border border-[#27272a] rounded-lg px-2.5 py-2 text-zinc-300 text-[13px] cursor-pointer focus:outline-none focus:border-zinc-700"
        >
          <option value="default">Inglês no topo + A-Z (Padrão)</option>
          <option value="az">100% Ordem alfabética (A-Z)</option>
          <option value="active">Ativos primeiro</option>
        </select>
      </div>

      {/* Languages List Box */}
      <div className="bg-[#111114] border border-[#27272a] rounded-xl overflow-hidden">
        {filteredAndSortedLangs.length === 0 ? (
          <div className="p-6 text-center text-zinc-400 text-[13px]">
            Nenhum idioma encontrado para o filtro.
          </div>
        ) : (
          filteredAndSortedLangs.map((l) => (
            <div
              key={l.id}
              className="flex justify-between items-center px-4 py-3 border-b border-[#1f1f23] last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <span className="text-[18px] w-6 text-center select-none">{l.flag}</span>
                <div>
                  <span className="font-semibold text-zinc-100 text-[14px]">{l.name}</span>
                  <span className="text-[12px] text-zinc-400 font-mono ml-1.5">{l.id}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label
                  className="relative inline-block w-[34px] h-[20px] cursor-pointer"
                  title={l.active ? 'Ativo no catálogo' : 'Oculto no catálogo'}
                >
                  <input
                    type="checkbox"
                    checked={l.active}
                    onChange={() => toggleActive(l.id)}
                    className="opacity-0 w-0 h-0 peer"
                  />
                  <span className="absolute inset-0 bg-[#27272a] rounded-[20px] transition-colors peer-checked:bg-[#2563eb] before:absolute before:content-[''] before:h-[14px] before:w-[14px] before:left-[3px] before:bottom-[3px] before:bg-[#a1a1aa] before:rounded-full before:transition-transform peer-checked:before:translate-x-[14px] peer-checked:before:bg-white" />
                </label>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
