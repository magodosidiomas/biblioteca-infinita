import React, { useState, useEffect } from 'react';
import type { ChannelItem, MediaCategory } from '../../types/content';
import { INITIAL_LANGS, LANG_STORAGE_KEY, mergeWithInitialLangs, type LanguageItem } from '../../constants/languages';
import { resolveTag } from '../../constants/tags';
import { inferPlatformFromUrl, normalizeLangKey } from '../SeriesMovieCard';

interface AdminEditDrawerProps {
  channel: ChannelItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (channel: ChannelItem) => void;
  onDelete: (id: string) => void;
}

const FORMAT_META: Record<
  MediaCategory,
  {
    headerTitle: string;
    entityNoun: string;
    openTooltip: string;
    urlLabel: string;
    urlPlaceholder: string;
    fetchButtonLabel: string;
    imageLabel: string;
    reloadImageLabel: string;
    confirmDelete: string;
  }
> = {
  youtube: {
    headerTitle: 'Editar canal',
    entityNoun: 'canal',
    openTooltip: 'Abrir no YouTube',
    urlLabel: 'Link do canal',
    urlPlaceholder: 'https://www.youtube.com/@canal',
    fetchButtonLabel: '↻ Buscar do YouTube',
    imageLabel: 'Ícone do canal',
    reloadImageLabel: '↻ Recarregar ícone',
    confirmDelete: 'Excluir este canal?',
  },
  professores: {
    headerTitle: 'Editar professor',
    entityNoun: 'professor',
    openTooltip: 'Abrir canal',
    urlLabel: 'Link do canal',
    urlPlaceholder: 'https://www.youtube.com/@professor',
    fetchButtonLabel: '↻ Buscar do YouTube',
    imageLabel: 'Foto do professor',
    reloadImageLabel: '↻ Recarregar foto',
    confirmDelete: 'Excluir este professor?',
  },
  pronuncia: {
    headerTitle: 'Editar item de pronúncia',
    entityNoun: 'item',
    openTooltip: 'Abrir link',
    urlLabel: 'Link do recurso',
    urlPlaceholder: 'https://www.youtube.com/watch?v=... ou site',
    fetchButtonLabel: '↻ Buscar metadados',
    imageLabel: 'Miniatura / Ícone',
    reloadImageLabel: '↻ Recarregar imagem',
    confirmDelete: 'Excluir este item de pronúncia?',
  },
  podcasts: {
    headerTitle: 'Editar podcast',
    entityNoun: 'podcast',
    openTooltip: 'Abrir podcast',
    urlLabel: 'Link do podcast',
    urlPlaceholder: 'https://open.spotify.com/show/...',
    fetchButtonLabel: '↻ Buscar metadados',
    imageLabel: 'Capa do podcast',
    reloadImageLabel: '↻ Recarregar capa',
    confirmDelete: 'Excluir este podcast?',
  },
  series: {
    headerTitle: 'Editar série',
    entityNoun: 'série',
    openTooltip: 'Abrir na plataforma',
    urlLabel: 'Link da série',
    urlPlaceholder: 'https://www.netflix.com/title/...',
    fetchButtonLabel: '↻ Buscar metadados',
    imageLabel: 'Pôster vertical (2:3)',
    reloadImageLabel: '↻ Recarregar pôster',
    confirmDelete: 'Excluir esta série?',
  },
  movies: {
    headerTitle: 'Editar filme',
    entityNoun: 'filme',
    openTooltip: 'Abrir na plataforma',
    urlLabel: 'Link do filme',
    urlPlaceholder: 'https://www.netflix.com/title/...',
    fetchButtonLabel: '↻ Buscar metadados',
    imageLabel: 'Pôster vertical (2:3)',
    reloadImageLabel: '↻ Recarregar pôster',
    confirmDelete: 'Excluir este filme?',
  },
  sites: {
    headerTitle: 'Editar site',
    entityNoun: 'site',
    openTooltip: 'Abrir site',
    urlLabel: 'Link do site',
    urlPlaceholder: 'https://exemplo.com',
    fetchButtonLabel: '↻ Buscar metadados',
    imageLabel: 'Ícone do site',
    reloadImageLabel: '↻ Recarregar ícone',
    confirmDelete: 'Excluir este site?',
  },
};

export const AdminEditDrawer: React.FC<AdminEditDrawerProps> = ({
  channel,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<MediaCategory>('youtube');
  const [beginner, setBeginner] = useState(false);
  const [subtitles, setSubtitles] = useState(false);
  const [transcriptUrl, setTranscriptUrl] = useState('');
  const [avgDuration, setAvgDuration] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  const [language, setLanguage] = useState('english');
  const [avatar, setAvatar] = useState('');
  const [platform, setPlatform] = useState<string | null>(null);
  const [originalLanguage, setOriginalLanguage] = useState<string | null>(null);
  const [originalLanguageLabel, setOriginalLanguageLabel] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isRefetchingAvatar, setIsRefetchingAvatar] = useState(false);

  const [availableLanguages] = useState<LanguageItem[]>(() => {
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

  useEffect(() => {
    if (channel) {
      setUrl(channel.url || '');
      setTitle(channel.title || '');
      setDescription(channel.description || '');
      setCategory(channel.category || 'youtube');
      setBeginner(channel.beginnerFriendly || false);
      setSubtitles(channel.subtitlesAvailable || false);
      setTranscriptUrl(channel.transcriptUrl || '');
      setAvgDuration(channel.avgDuration ? String(channel.avgDuration).replace(/[^0-9]/g, '') : '');
      setTagsStr((channel.topics || []).join(', '));
      const studyLang = channel.language || 'english';
      setLanguage(studyLang);
      setAvatar(channel.avatar || '');
      setPlatform(channel.platform || null);
      const normOrig = normalizeLangKey(channel.originalLanguage, studyLang);
      setOriginalLanguage(normOrig);
      setOriginalLanguageLabel(channel.originalLanguageLabel || null);
    }
  }, [channel]);

  if (!isOpen || !channel) return null;

  const meta = FORMAT_META[category] || FORMAT_META.youtube;

  const handleFetchYouTubeMeta = async () => {
    if (!url && !title) return;
    setIsFetching(true);
    try {
      const qUrl = `/api/fetch-meta?url=${encodeURIComponent(url.trim())}&title=${encodeURIComponent(title.trim())}`;
      const res = await fetch(qUrl);
      if (res.ok) {
        const data = await res.json();
        if (data.resolvedUrl) setUrl(data.resolvedUrl);
        if (data.title && !data.title.toLowerCase().includes('netflix')) setTitle(data.title);
        if (data.desc) setDescription(data.desc);
        if (data.avatar) setAvatar(data.avatar);
        if (data.platform) setPlatform(data.platform);
        if (data.originalLanguage) setOriginalLanguage(normalizeLangKey(data.originalLanguage, language));
        if (data.originalLanguageLabel) setOriginalLanguageLabel(data.originalLanguageLabel);
        if (data.suggestedType) setCategory(data.suggestedType);
        if (data.avgDuration) setAvgDuration(String(data.avgDuration).replace(/[^0-9]/g, ''));
        if (data.transcriptUrl && !transcriptUrl) setTranscriptUrl(data.transcriptUrl);
        if (typeof data.subtitlesAvailable === 'boolean') {
          setSubtitles(data.subtitlesAvailable);
        }
        if (Array.isArray(data.suggestedTags) && data.suggestedTags.length > 0 && !tagsStr.trim()) {
          setTagsStr(data.suggestedTags.join(', '));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetching(false);
    }
  };

  const handleRefetchAvatar = async () => {
    if (!url && !title) return;
    setIsRefetchingAvatar(true);
    try {
      const qUrl = `/api/fetch-meta?url=${encodeURIComponent(url.trim())}&title=${encodeURIComponent(title.trim())}`;
      const res = await fetch(qUrl);
      if (res.ok) {
        const data = await res.json();
        if (data.avatar) setAvatar(data.avatar);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefetchingAvatar(false);
    }
  };

  const parsedTopics = Array.from(
    new Set(tagsStr.split(',').map((t) => resolveTag(t.trim())).filter(Boolean))
  );
  const hasValidTags = parsedTopics.length > 0;
  const isVideoUrl = /(?:youtube\.com\/(?:watch\?.*v=|shorts\/|live\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i.test(url.trim());
  const hasBlockedVideoUrl = (category === 'youtube' || category === 'professores') && isVideoUrl;
  const canSave = Boolean(title.trim()) && Boolean(url.trim()) && hasValidTags && !hasBlockedVideoUrl;

  const isPosterCategory = category === 'series' || category === 'movies';

  const handleSave = () => {
    if (!canSave) return;
    const finalOrigKey = normalizeLangKey(originalLanguage, language);
    const matchedOrigLangObj = availableLanguages.find((l) => l.id === finalOrigKey);
    onSave({
      ...channel,
      url: url.trim(),
      title: title.trim(),
      description: isPosterCategory ? '' : description.trim(),
      category,
      avatar: avatar || channel.avatar,
      beginnerFriendly: category !== 'professores' && category !== 'pronuncia' && beginner,
      subtitlesAvailable: category !== 'podcasts' && category !== 'sites' && subtitles,
      transcriptUrl: category === 'podcasts' ? (transcriptUrl.trim() || undefined) : undefined,
      avgDuration: category === 'podcasts' ? (avgDuration.trim() || undefined) : undefined,
      platform: isPosterCategory ? inferPlatformFromUrl(url, platform) : category === 'pronuncia' ? (platform || undefined) : undefined,
      originalLanguage: isPosterCategory ? finalOrigKey : undefined,
      originalLanguageLabel: isPosterCategory ? (matchedOrigLangObj?.name || originalLanguageLabel || undefined) : undefined,
      language,
      topics: parsedTopics,
    });
    onClose();
  };

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-black/65 backdrop-blur-[3px] z-[90] cursor-pointer" />

      <div className="fixed top-0 right-0 bottom-0 w-[460px] max-w-[92vw] bg-[#111114] border-l border-[#27272a] z-[100] flex flex-col shadow-2xl">
        <div className="px-5 py-4 border-b border-[#1f1f23] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#f4f4f5]">{meta.headerTitle}</h2>
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                title={meta.openTooltip}
                className="text-[#a1a1aa] hover:text-[#f4f4f5] text-xs font-medium p-1 flex items-center rounded hover:bg-[#18181b] transition-colors no-underline cursor-pointer"
              >
                <span>↗</span>
              </a>
            )}
          </div>
          <button type="button" onClick={onClose} className="text-[#a1a1aa] hover:text-white text-lg p-1 cursor-pointer" aria-label="Fechar">✕</button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 space-y-3.5">
          {/* Preview de Ícone / Pôster com botão de recarregar */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#18181b] border border-[#27272a]">
            <div className="flex items-center gap-3">
              <div
                className={`${
                  isPosterCategory ? 'w-10 h-14 rounded-md' : 'w-10 h-10 rounded-full'
                } bg-[#27272a] border border-[#3f3f46] overflow-hidden flex items-center justify-center font-bold text-xs text-[#d4d4d8] flex-shrink-0`}
              >
                {avatar ? (
                  <img src={avatar} alt={title} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                ) : (
                  <span>{title.slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div className="text-xs text-[#a1a1aa]">
                <div className="font-semibold text-zinc-200">{title || meta.entityNoun}</div>
                <div>{meta.imageLabel}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRefetchAvatar}
              disabled={isRefetchingAvatar}
              title={meta.reloadImageLabel}
              className="text-xs text-[#a1a1aa] hover:text-[#f4f4f5] hover:underline cursor-pointer disabled:opacity-50"
            >
              {isRefetchingAvatar ? 'Buscando...' : meta.reloadImageLabel}
            </button>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[12.5px] font-medium text-[#d4d4d8]">{meta.urlLabel}</label>
              <button
                type="button"
                onClick={handleFetchYouTubeMeta}
                disabled={isFetching}
                className="text-xs text-[#a1a1aa] hover:text-[#f4f4f5] hover:underline cursor-pointer disabled:opacity-50"
              >
                {isFetching ? 'Buscando...' : meta.fetchButtonLabel}
              </button>
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-[#18181b] border border-[#3f3f46] rounded-lg px-3 py-2 text-[13.5px] text-[#fafafa] focus:outline-none focus:border-[#71717a]"
              placeholder={meta.urlPlaceholder}
            />
            {hasBlockedVideoUrl && (
              <div className="mt-2 p-2.5 rounded-lg bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center justify-between gap-2">
                <span>⛔ Link de vídeo detectado. Extraia o canal antes de salvar.</span>
                <button
                  type="button"
                  onClick={handleFetchYouTubeMeta}
                  disabled={isFetching}
                  className="px-2 py-1 rounded bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-100 font-semibold whitespace-nowrap cursor-pointer transition-colors"
                >
                  {isFetching ? 'Extraindo...' : 'Extrair canal'}
                </button>
              </div>
            )}
          </div>

          {/* Linha 1: Título e Idioma lado a lado (Identidade Rápida) */}
          <div className="grid grid-cols-[1fr_140px] gap-3">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[12.5px] font-medium text-[#d4d4d8]">Título</label>
                <button
                  type="button"
                  onClick={handleFetchYouTubeMeta}
                  disabled={isFetching}
                  className="text-xs text-[#a1a1aa] hover:text-[#f4f4f5] hover:underline cursor-pointer disabled:opacity-50"
                >
                  {isFetching ? 'Buscando...' : 'Buscar dados'}
                </button>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#18181b] border border-[#3f3f46] rounded-lg px-3 py-2 text-[13.5px] text-[#fafafa] focus:outline-none focus:border-[#71717a]"
              />
            </div>

            <div>
              <label className="block text-[12.5px] font-medium text-[#d4d4d8] mb-1.5">Idioma da aba</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-[#18181b] border border-[#3f3f46] rounded-lg px-3 py-2 text-[13.5px] text-[#fafafa] cursor-pointer"
              >
                {availableLanguages.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.flag} {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Se for Série ou Filme: Idioma Original e Plataforma */}
          {isPosterCategory && (
            <div className="grid grid-cols-2 gap-3 bg-[#141418] border border-[#27272a] rounded-xl p-3">
              <div>
                <label className="block text-[12px] font-medium text-[#d4d4d8] mb-1">Idioma original da obra</label>
                <select
                  value={normalizeLangKey(originalLanguage, language)}
                  onChange={(e) => {
                    const nextKey = e.target.value;
                    setOriginalLanguage(nextKey);
                    const found = availableLanguages.find((l) => l.id === nextKey);
                    if (found) setOriginalLanguageLabel(found.name);
                  }}
                  className="w-full bg-[#18181b] border border-[#3f3f46] rounded-lg px-2.5 py-1.5 text-xs text-[#fafafa] cursor-pointer"
                >
                  {availableLanguages.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.flag} {l.name} {l.id === language ? '(Áudio Original)' : '(Dublado)'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#d4d4d8] mb-1">Plataforma</label>
                <input
                  type="text"
                  value={platform || inferPlatformFromUrl(url, null)}
                  onChange={(e) => setPlatform(e.target.value)}
                  placeholder="Netflix"
                  className="w-full bg-[#18181b] border border-[#3f3f46] rounded-lg px-2.5 py-1.5 text-xs text-[#fafafa] focus:outline-none focus:border-[#71717a]"
                />
              </div>
            </div>
          )}

          {/* Linha 2: Formato e Opções (Decisão Rápida) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12.5px] font-medium text-[#d4d4d8] mb-1.5">Formato</label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'youtube', label: 'YouTube' },
                  { id: 'professores', label: 'Professor' },
                  { id: 'pronuncia', label: 'Pronúncia' },
                  { id: 'podcasts', label: 'Podcast' },
                  { id: 'series', label: 'Série' },
                  { id: 'movies', label: 'Filme' },
                  { id: 'sites', label: 'Site' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setCategory(t.id as MediaCategory);
                      if (t.id === 'professores' || t.id === 'pronuncia') setBeginner(false);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      category === t.id ? 'bg-[#f4f4f5] text-[#09090b] border-[#f4f4f5] font-semibold' : 'bg-[#18181b] border-[#3f3f46] text-[#d4d4d8]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[12.5px] font-medium text-[#d4d4d8] mb-1.5">Opções</label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  disabled={category === 'professores' || category === 'pronuncia'}
                  onClick={() => setBeginner(!beginner)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed ${
                    beginner ? 'bg-[#f4f4f5] text-[#09090b] border-[#f4f4f5] font-semibold' : 'bg-[#18181b] border-[#3f3f46] text-[#d4d4d8]'
                  }`}
                >
                  {beginner ? '✓ ' : ''}Iniciante
                </button>
                {category !== 'podcasts' && category !== 'sites' && (
                  <button
                    type="button"
                    onClick={() => setSubtitles(!subtitles)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      subtitles ? 'bg-[#f4f4f5] text-[#09090b] border-[#f4f4f5] font-semibold' : 'bg-[#18181b] border-[#3f3f46] text-[#d4d4d8]'
                    }`}
                  >
                    {subtitles ? '✓ ' : ''}Legendado
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Linha 3: Campos Específicos de Podcast (Condicional) */}
          {category === 'podcasts' && (
            <div className="bg-[#141418] border border-[#27272a] rounded-xl p-3.5 space-y-2.5">
              <div className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <span>🎙️</span>
                <span>Configurações do Podcast</span>
              </div>
              <div className="grid grid-cols-[1.3fr_0.7fr] gap-3">
                <div>
                  <label className="block text-[12px] font-medium text-[#d4d4d8] mb-1">Link da Transcrição (opcional)</label>
                  <input
                    type="url"
                    value={transcriptUrl}
                    onChange={(e) => setTranscriptUrl(e.target.value)}
                    placeholder="https://site.com/transcripts..."
                    className="w-full bg-[#18181b] border border-[#3f3f46] rounded-lg px-2.5 py-1.5 text-xs text-[#fafafa] focus:outline-none focus:border-[#71717a]"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[12px] font-medium text-[#d4d4d8]">Duração média</label>
                    <span className="text-[11px] text-[#a1a1aa]">via RSS</span>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={avgDuration}
                      onChange={(e) => setAvgDuration(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="30"
                      className="w-full bg-[#18181b] border border-[#3f3f46] rounded-lg pl-2.5 pr-10 py-1.5 text-xs text-[#fafafa] focus:outline-none focus:border-[#71717a]"
                    />
                    <span className="absolute right-3 text-xs text-zinc-400 pointer-events-none select-none font-medium">
                      min
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Linha 3b: Campos Específicos de Pronúncia (Condicional) */}
          {category === 'pronuncia' && (
            <div className="bg-[#141418] border border-[#27272a] rounded-xl p-3.5 space-y-2.5">
              <div className="text-xs font-semibold text-zinc-300">
                Configurações de Pronúncia
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-medium text-[#d4d4d8] mb-1">Tipo de recurso</label>
                  <div className="flex flex-wrap gap-1.5">
                    {(['Vídeo', 'Artigo', 'Site', 'App'] as const).map((subType) => {
                      const isActive = parsedTopics.includes(subType);
                      return (
                        <button
                          key={subType}
                          type="button"
                          onClick={() => {
                            const others = parsedTopics.filter((t) => !['Vídeo', 'Artigo', 'Site', 'App'].includes(t));
                            setTagsStr([subType, ...others].join(', '));
                          }}
                          className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-[#f4f4f5] text-[#09090b] border-[#f4f4f5] font-semibold'
                              : 'bg-[#18181b] border-[#3f3f46] text-[#d4d4d8]'
                          }`}
                        >
                          {subType}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {parsedTopics.includes('Vídeo') && (
                  <div>
                    <label className="block text-[12px] font-medium text-[#d4d4d8] mb-1">Canal de origem</label>
                    <input
                      type="text"
                      value={platform || ''}
                      onChange={(e) => setPlatform(e.target.value)}
                      placeholder="Ex: Sounds American"
                      className="w-full bg-[#18181b] border border-[#3f3f46] rounded-lg px-2.5 py-1.5 text-xs text-[#fafafa] focus:outline-none focus:border-[#71717a]"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Linha 4: Tags de Assunto (Área de Trabalho Ativa Obrigatória) */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[12.5px] font-medium text-[#d4d4d8]">Tags de Assunto</label>
              {!hasValidTags && (
                <span className="text-xs text-amber-400 font-medium">Obrigatório (mínimo 1)</span>
              )}
            </div>
            <input
              type="text"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              placeholder="Separadas por vírgula (ex: Cultura, Sociedade)"
              className="w-full bg-[#18181b] border border-[#3f3f46] rounded-lg px-3 py-2 text-[13.5px] text-[#fafafa] focus:outline-none focus:border-[#71717a]"
            />
          </div>

          {/* Linha 5: Descrição Oficial (Oculta em Série e Filme) */}
          {!isPosterCategory && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[12.5px] font-medium text-[#d4d4d8]">Descrição oficial</label>
                <button
                  type="button"
                  onClick={handleFetchYouTubeMeta}
                  disabled={isFetching}
                  className="text-xs text-[#a1a1aa] hover:text-[#f4f4f5] hover:underline cursor-pointer disabled:opacity-50"
                >
                  Refazer busca
                </button>
              </div>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#18181b] border border-[#3f3f46] rounded-lg px-3 py-2 text-[13px] text-[#fafafa] focus:outline-none focus:border-[#71717a] resize-y leading-relaxed"
              />
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[#1f1f23] flex justify-between items-center">
          <button
            type="button"
            onClick={() => {
              if (window.confirm(meta.confirmDelete)) {
                onDelete(channel.id);
                onClose();
              }
            }}
            className="text-xs font-medium text-[#ef4444] border border-[#7f1d1d] bg-[#18181b] hover:bg-[#27272a] px-3 py-1.5 rounded-md transition-colors cursor-pointer"
          >
            Excluir {meta.entityNoun}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            title={!hasValidTags ? "Adicione pelo menos 1 tag para salvar" : undefined}
            className="bg-[#f4f4f5] text-[#09090b] hover:bg-white text-[13px] font-semibold px-4 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed"
          >
            Salvar alterações
          </button>
        </div>
      </div>
    </>
  );
};
