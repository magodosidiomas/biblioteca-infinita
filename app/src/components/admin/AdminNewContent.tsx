import React, { useState, useMemo, useEffect } from 'react';
import { ExternalLink, Clock } from 'lucide-react';
import type { ChannelItem, MediaCategory } from '../../types/content';
import { CHANNELS } from '../../data/channels';
import { INITIAL_LANGS, LANG_STORAGE_KEY, type LanguageItem } from '../../constants/languages';
import { ALL_CANONICAL_TAGS, resolveTag } from '../../constants/tags';
import { SeriesMovieCard, inferPlatformFromUrl } from '../SeriesMovieCard';
import { PronunciaVideoCard } from '../PronunciaVideoCard';
import { formatDurationDisplay } from '../../utils/duration';

interface AdminNewContentProps {
  onSave: (channel: ChannelItem) => void;
  onCancel?: () => void;
  existingChannels?: ChannelItem[];
  defaultLanguage?: string;
  onEditExisting?: (channelId: string) => void;
}

export const AdminNewContent: React.FC<AdminNewContentProps> = ({
  onSave,
  onCancel,
  existingChannels,
  defaultLanguage = 'english',
  onEditExisting,
}) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [category, setCategory] = useState<MediaCategory>('youtube');
  const [beginner, setBeginner] = useState(false);
  const [subtitles, setSubtitles] = useState(false);
  const [transcriptUrl, setTranscriptUrl] = useState('');
  const [avgDuration, setAvgDuration] = useState('');
  const [nonNative, setNonNative] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [avatar, setAvatar] = useState('');
  const [platform, setPlatform] = useState<string | null>(null);
  const [originalLanguage, setOriginalLanguage] = useState<string | null>(null);
  const [originalLanguageLabel, setOriginalLanguageLabel] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState('');
  const [ccNote, setCcNote] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [isRefetchingAvatar, setIsRefetchingAvatar] = useState(false);
  const [duplicateMatch, setDuplicateMatch] = useState<{ id: string; title: string; language: string; format: string } | null>(null);
  const [qualityAlerts, setQualityAlerts] = useState<string[]>([]);
  const [resolvedFromVideoInfo, setResolvedFromVideoInfo] = useState<{ videoTitle: string | null; channelUrl: string } | null>(null);
  const [videoMetaCache, setVideoMetaCache] = useState<{
    videoUrl: string;
    videoTitle: string;
    videoDesc: string;
    videoThumb: string;
    authorName: string;
    channelUrl: string;
    channelTitle: string;
    channelDesc: string;
    channelAvatar: string;
  } | null>(null);

  const isVideoUrl = useMemo(
    () => /(?:youtube\.com\/(?:watch\?.*v=|shorts\/|live\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i.test(url.trim()),
    [url]
  );

  const [availableLanguages] = useState<LanguageItem[]>(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_LANGS;
  });
  const [selectedLanguage, setSelectedLanguage] = useState<string>(defaultLanguage);

  useEffect(() => {
    if (!isLoaded) {
      setSelectedLanguage(defaultLanguage);
    }
  }, [defaultLanguage, isLoaded]);

  const allAvailableTags = useMemo(() => {
    const set = new Set<string>(ALL_CANONICAL_TAGS);
    const source = existingChannels && existingChannels.length > 0 ? existingChannels : CHANNELS;
    source.forEach((c) => {
      (c.topics || []).forEach((t) => {
        if (t && t.trim()) set.add(resolveTag(t.trim()));
      });
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [existingChannels]);

  const trimmedInput = tagInput.trim();
  const filteredTags = useMemo(() => {
    if (!trimmedInput) {
      return allAvailableTags.filter((t) => !tags.includes(t)).slice(0, 8);
    }
    const q = trimmedInput.toLowerCase();
    return allAvailableTags
      .filter((t) => !tags.includes(t) && t.toLowerCase().includes(q))
      .slice(0, 8);
  }, [allAvailableTags, tags, trimmedInput]);

  const exactMatchExists = allAvailableTags.some(
    (t) => t.toLowerCase() === trimmedInput.toLowerCase()
  );
  const alreadyInTags = tags.some(
    (t) => t.toLowerCase() === trimmedInput.toLowerCase()
  );
  const canCreateNew = trimmedInput.length > 0 && !exactMatchExists && !alreadyInTags;

  const fetchChannelMeta = async (targetUrl: string) => {
    const trimmed = targetUrl.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return;
    setIsFetching(true);
    try {
      const res = await fetch(`/api/fetch-meta?url=${encodeURIComponent(trimmed)}`);
      if (res.ok) {
        const data = await res.json();
        const isPron = data.suggestedType === 'pronuncia' || category === 'pronuncia';
        const hasVideoPayload = Boolean(data.originalVideoUrl && data.originalVideoTitle);

        if (hasVideoPayload) {
          setVideoMetaCache({
            videoUrl: data.originalVideoUrl,
            videoTitle: data.originalVideoTitle || data.title || '',
            videoDesc: data.originalVideoDesc ?? data.desc ?? '',
            videoThumb: data.originalVideoThumb || data.avatar || '',
            authorName: data.videoAuthorName || data.title || '',
            channelUrl: data.resolvedUrl || trimmed,
            channelTitle: data.title || '',
            channelDesc: data.desc || '',
            channelAvatar: data.avatar || '',
          });
        } else {
          setVideoMetaCache(null);
        }

        if (isPron && hasVideoPayload) {
          setUrl(data.originalVideoUrl);
          setTitle(data.originalVideoTitle);
          setDesc(data.originalVideoDesc ?? '');
          setAvatar(data.originalVideoThumb || data.avatar || '');
          setPlatform(data.videoAuthorName || data.title || null);
          setResolvedFromVideoInfo(null);
        } else {
          if (data.resolvedUrl) {
            setUrl(data.resolvedUrl);
          }
          if (data.resolvedFromVideo && data.resolvedUrl) {
            setResolvedFromVideoInfo({
              videoTitle: data.originalVideoTitle || null,
              channelUrl: data.resolvedUrl,
            });
          } else {
            setResolvedFromVideoInfo(null);
          }
          if (data.title) setTitle(data.title);
          if (data.desc) setDesc(data.desc);
          if (data.avatar) setAvatar(data.avatar);
          if (data.platform) setPlatform(data.platform);
        }

        if (data.originalLanguage) setOriginalLanguage(data.originalLanguage);
        if (data.originalLanguageLabel) setOriginalLanguageLabel(data.originalLanguageLabel);
        if (data.detectedLanguage) {
          const matchLang = availableLanguages.find(
            (l) => l.name.toLowerCase() === data.detectedLanguage.toLowerCase() || l.id.toLowerCase() === data.detectedLanguage.toLowerCase()
          );
          if (matchLang) setSelectedLanguage(matchLang.id);
        }
        if (typeof data.subtitlesAvailable === 'boolean') {
          setSubtitles(data.subtitlesAvailable);
        }
        if (data.avgDuration) {
          setAvgDuration(String(data.avgDuration).replace(/[^0-9]/g, ''));
        }
        if (data.transcriptUrl) {
          setTranscriptUrl(data.transcriptUrl);
        }

        // Checagem de duplicatas
        if (data.existingMatch && !(isPron && hasVideoPayload)) {
          setDuplicateMatch(data.existingMatch);
        } else {
          setDuplicateMatch(null);
        }

        // Alertas de qualidade
        if (Array.isArray(data.qualityAlerts)) {
          setQualityAlerts(data.qualityAlerts);
        } else {
          setQualityAlerts([]);
        }

        // Sugestão de tipo
        if (data.suggestedType && category !== 'pronuncia') {
          setCategory(data.suggestedType);
        }

        // Sugestão de Iniciante
        if (typeof data.suggestedBeginner === 'boolean') {
          setBeginner(data.suggestedBeginner);
        }

        // Sugestão de tags canônicas
        const nextTags = new Set<string>(Array.isArray(data.suggestedTags) ? data.suggestedTags : []);
        if (isPron) {
          if (hasVideoPayload || trimmed.includes('youtube.com/watch') || trimmed.includes('youtu.be/')) {
            nextTags.add('Vídeo');
          } else if (trimmed.includes('apps.apple.com') || trimmed.includes('play.google.com')) {
            nextTags.add('App');
          } else {
            nextTags.add('Site');
          }
        }
        if (nextTags.size > 0) {
          setTags((prev) => Array.from(new Set([...prev, ...nextTags])));
        }

        setIsLoaded(true);
        let ccMsg = '';
        if (data.ccInfo?.ratioFormatted && data.ccInfo.ratioFormatted !== '0/0') {
          const note = `${data.ccInfo.ratioFormatted} com CC`;
          setCcNote(note);
          ccMsg = ` • CC: ${data.ccInfo.ratioFormatted}`;
        } else if (data.ccInfo?.detectedViaKeyword) {
          setCcNote('detectado na bio');
          ccMsg = ' • Legendas na descrição!';
        } else {
          setCcNote('');
        }
        setToastMsg(`Dados obtidos com sucesso!${ccMsg}`);
        setTimeout(() => setToastMsg(''), 3500);
      } else {
        setToastMsg('Não foi possível buscar automaticamente.');
        setTimeout(() => setToastMsg(''), 3000);
      }
    } catch (err) {
      console.error('Erro ao buscar dados do canal:', err);
      setToastMsg('Erro na busca automática. Preencha manualmente.');
      setTimeout(() => setToastMsg(''), 3000);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSimulateNew = () => {
    const mockUrl = 'https://www.youtube.com/@NovoCanal';
    setUrl(mockUrl);
    setTitle('Novo Canal');
    setDesc('Vídeos autênticos com legendas para imersão natural no idioma.');
    setIsLoaded(true);
    setCategory('youtube');
    setBeginner(false);
    setSubtitles(true);
    setTranscriptUrl('');
    setAvgDuration('');
    setNonNative(false);
    setTags(['Cultura']);
    setAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80');
    setDuplicateMatch(null);
    setQualityAlerts([]);
  };

  const handleSimulateSpotify = () => {
    const mockUrl = 'https://open.spotify.com/show/00h8GrMQbmSAfiNWYPLvhx';
    setUrl(mockUrl);
    setTitle('innerFrench');
    setDesc('Aprenda francês sem estresse através de temas estimulantes sobre sociedade, filosofia e história, falados em ritmo acessível e natural.');
    setIsLoaded(true);
    setCategory('podcasts');
    setBeginner(true);
    setSubtitles(false);
    setTranscriptUrl('https://innerfrench.com/transcripts');
    setAvgDuration('30');
    setNonNative(false);
    setTags(['Cultura', 'Sociedade']);
    setAvatar('https://image-cdn-ak.spotifycdn.com/image/ab67656300005f1f3e5f413bfc3dacc4beab4993');
    setDuplicateMatch(null);
    setQualityAlerts([]);
  };

  const handleSimulateNetflixSeries = () => {
    setUrl('https://www.netflix.com/title/70153404');
    setTitle('Friends');
    setDesc('');
    setIsLoaded(true);
    setCategory('series');
    setPlatform('Netflix');
    setOriginalLanguage('english');
    setOriginalLanguageLabel('Inglês');
    setSelectedLanguage('english');
    setBeginner(true);
    setSubtitles(true);
    setTranscriptUrl('');
    setAvgDuration('');
    setNonNative(false);
    setTags(['Sitcom', 'Cotidiano']);
    setAvatar('https://image.tmdb.org/t/p/w780/f496cm9enuEsZkSPzCwnTESEK5s.jpg');
    setDuplicateMatch(null);
    setQualityAlerts([]);
  };

  const handleSimulateDubbedSeries = () => {
    setUrl('https://www.netflix.com/title/80100172');
    setTitle('Dark');
    setDesc('');
    setIsLoaded(true);
    setCategory('series');
    setPlatform('Netflix');
    setOriginalLanguage('german');
    setOriginalLanguageLabel('Alemão');
    setSelectedLanguage('english');
    setBeginner(false);
    setSubtitles(true);
    setTranscriptUrl('');
    setAvgDuration('');
    setNonNative(false);
    setTags(['Ficção Científica', 'Suspense']);
    setAvatar('https://image.tmdb.org/t/p/w780/apbrbWs8M9lyOpJYU5WXrpFbk1Z.jpg');
    setDuplicateMatch(null);
    setQualityAlerts([]);
  };

  const handleSimulateNetflixMovie = () => {
    setUrl('https://www.netflix.com/title/80183187');
    setTitle('Klaus');
    setDesc('');
    setIsLoaded(true);
    setCategory('movies');
    setPlatform('Netflix');
    setOriginalLanguage('english');
    setOriginalLanguageLabel('Inglês');
    setSelectedLanguage('english');
    setBeginner(true);
    setSubtitles(true);
    setTranscriptUrl('');
    setAvgDuration('');
    setNonNative(false);
    setTags(['Animação', 'Humor']);
    setAvatar('https://image.tmdb.org/t/p/w780/q125RHUDgR4gjwh1QkfYuJLYkL.jpg');
    setDuplicateMatch(null);
    setQualityAlerts([]);
  };

  const handleSimulateWebsite = () => {
    const mockUrl = 'https://www.nachrichtenleicht.de/';
    setUrl(mockUrl);
    setTitle('Nachrichtenleicht');
    setDesc('Nachrichten, die jeder versteht: die Nachrichten in Einfacher Sprache vom Deutschlandfunk');
    setIsLoaded(true);
    setCategory('sites');
    setSelectedLanguage('german');
    setBeginner(true);
    setSubtitles(false);
    setTranscriptUrl('');
    setAvgDuration('');
    setNonNative(false);
    setTags(['Notícias', 'Materiais Adaptados']);
    setAvatar('https://www.nachrichtenleicht.de/static/img/nachrichten_leicht/icons/favicon-196x196.png');
    setDuplicateMatch(null);
    setQualityAlerts([]);
  };

  const handleSimulateExisting = () => {
    const mockUrl = 'https://www.youtube.com/@AliAbdaal';
    setUrl(mockUrl);
    setTitle('Ali Abdaal');
    setDesc("I'm Ali - doctor turned entrepreneur, YouTuber, and author of Feel-Good Productivity.");
    setIsLoaded(true);
    setCategory('youtube');
    setBeginner(true);
    setSubtitles(true);
    setTranscriptUrl('');
    setAvgDuration('');
    setNonNative(false);
    setTags(['Produtividade']);
    setAvatar('https://yt3.googleusercontent.com/ytc/AIdro_m2xx6mCZwsyjARnkwBKJxEv0FqGxGS2NwWNkjWH__Smw=s900-c-k-c0x00ffffff-no-rj');
    setDuplicateMatch({ id: 'aliabdaal', title: 'Ali Abdaal', language: 'english', format: 'YouTube' });
    setQualityAlerts([]);
  };

  const handleRefetchAvatar = async () => {
    if (!url) return;
    setIsRefetchingAvatar(true);
    try {
      const res = await fetch(`/api/fetch-meta?url=${encodeURIComponent(url.trim())}`);
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

  const handleAddTag = (t: string) => {
    const resolved = resolveTag(t);
    if (resolved && !tags.includes(resolved)) {
      setTags([...tags, resolved]);
    }
    setTagInput('');
    setShowMenu(false);
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter(x => x !== t));
  };

  const effectiveTags = useMemo(() => {
    const list = [...tags];
    if (tagInput.trim()) {
      const resolved = resolveTag(tagInput.trim());
      if (resolved && !list.includes(resolved)) {
        list.push(resolved);
      }
    }
    return list;
  }, [tags, tagInput]);

  const isChannelCategory = category === 'youtube' || category === 'professores';
  const hasBlockedVideoUrl = isChannelCategory && isVideoUrl;
  const canSave = isLoaded && Boolean(title.trim()) && Boolean(url.trim()) && effectiveTags.length > 0 && !hasBlockedVideoUrl;

  const isPosterCategory = category === 'series' || category === 'movies';
  const isPronunciaVideo = category === 'pronuncia' && (effectiveTags.includes('Vídeo') || isVideoUrl);

  const handleSave = () => {
    if (!canSave) return;
    const channel: ChannelItem = {
      id: `ch_${Date.now()}`,
      category,
      title: title.trim(),
      url: url.trim(),
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      initials: title.trim().slice(0, 2).toUpperCase(),
      description: isPosterCategory ? '' : desc,
      beginnerFriendly: category !== 'professores' && category !== 'pronuncia' && beginner,
      subtitlesAvailable: category !== 'podcasts' && category !== 'sites' && subtitles,
      transcriptUrl: category === 'podcasts' ? (transcriptUrl.trim() || undefined) : undefined,
      avgDuration: category === 'podcasts' ? (avgDuration.trim() || undefined) : undefined,
      platform: isPosterCategory ? inferPlatformFromUrl(url, platform) : category === 'pronuncia' ? (platform || undefined) : undefined,
      originalLanguage: isPosterCategory ? (originalLanguage || selectedLanguage) : undefined,
      originalLanguageLabel: isPosterCategory ? (originalLanguageLabel || undefined) : undefined,
      nonNative,
      accent: null,
      language: selectedLanguage,
      topics: effectiveTags,
    };
    onSave(channel);
    setToastMsg('Conteúdo salvo com sucesso!');
    setTimeout(() => setToastMsg(''), 3000);
  };

  return (
    <div
      className="max-w-[1120px] mx-auto px-6 py-5"
      onKeyDown={(e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && canSave) {
          e.preventDefault();
          handleSave();
        }
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-9 items-start">
        {/* Formulário */}
        <section>
          <h1 className="text-lg font-bold text-[#f4f4f5] mb-3.5">Novo conteúdo</h1>

          <div className="mb-3.5">
            <label className="block text-[13px] font-medium text-[#d4d4d8] mb-1.5" htmlFor="inUrl">
              Link
            </label>
            <input
              id="inUrl"
              type="url"
              value={url}
              onChange={(e) => {
                const val = e.target.value;
                setUrl(val);
                if (val.trim().length > 10 && (val.startsWith('http://') || val.startsWith('https://'))) {
                  fetchChannelMeta(val);
                }
              }}
              onPaste={(e) => {
                const pasted = e.clipboardData.getData('text');
                if (pasted && (pasted.startsWith('http://') || pasted.startsWith('https://'))) {
                  setTimeout(() => fetchChannelMeta(pasted), 50);
                }
              }}
              placeholder="Cole qualquer link (YouTube, Spotify, Netflix, Site...)"
              className="w-full bg-[#111114] border border-[#3f3f46] rounded-lg px-3 py-2 text-sm text-[#fafafa] placeholder:text-[#a1a1aa] focus:outline-none focus:border-[#71717a]"
            />
            {isFetching && (
              <div className="mt-1.5 text-xs text-zinc-400">Buscando dados...</div>
            )}

            {resolvedFromVideoInfo && !hasBlockedVideoUrl && (
              <div className="mt-2.5 p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 text-xs flex items-center justify-between gap-2">
                <span>
                  ✓ <strong>Link de vídeo convertido para o canal:</strong> extraímos automaticamente o canal oficial (<strong>{resolvedFromVideoInfo.channelUrl}</strong>){resolvedFromVideoInfo.videoTitle ? ` a partir do vídeo "${resolvedFromVideoInfo.videoTitle}"` : ''}.
                </span>
              </div>
            )}

            {hasBlockedVideoUrl && (
              <div className="mt-2.5 p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center justify-between gap-3">
                <span>
                  ⛔ <strong>Link de vídeo detectado:</strong> você colou um vídeo individual em vez de um canal. Clique abaixo para extrair o canal ou cole a URL com <code>@canal</code>.
                </span>
                <button
                  type="button"
                  onClick={() => fetchChannelMeta(url)}
                  className="px-2.5 py-1 rounded bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-100 font-semibold whitespace-nowrap cursor-pointer transition-colors"
                >
                  Extrair canal
                </button>
              </div>
            )}

            {duplicateMatch && (
              <div className="mt-2.5 p-3 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between gap-3">
                <span>
                  ⚠️ <strong>Canal já cadastrado:</strong> &quot;{duplicateMatch.title}&quot; já existe no acervo em <strong>{duplicateMatch.language}</strong> ({duplicateMatch.format}).
                </span>
                {onEditExisting && (
                  <button
                    type="button"
                    onClick={() => onEditExisting(duplicateMatch.id)}
                    className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-100 font-semibold whitespace-nowrap cursor-pointer transition-colors"
                  >
                    Editar este canal
                  </button>
                )}
              </div>
            )}

            {qualityAlerts.length > 0 && (
              <div className="mt-2 space-y-1">
                {qualityAlerts.map((alert, idx) => (
                  <div key={idx} className="text-xs text-amber-400/90 flex items-center gap-1.5">
                    <span>⚠️ {alert}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {isLoaded && (
            <div className="space-y-3.5">
              {/* Linha 1: Título e Idioma lado a lado (Identidade Rápida) */}
              <div className="grid grid-cols-[1fr_180px] gap-3 items-start">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[13px] font-medium text-[#d4d4d8]" htmlFor="inTitle">Título</label>
                    <button
                      type="button"
                      onClick={() => fetchChannelMeta(url)}
                      className="text-xs text-[#a1a1aa] hover:text-[#f4f4f5] hover:underline cursor-pointer"
                    >
                      {url.includes('spotify.com')
                        ? 'Buscar do Spotify'
                        : url.includes('youtube.com') || url.includes('youtu.be')
                        ? 'Buscar do YouTube'
                        : 'Buscar metadados'}
                    </button>
                  </div>
                  <input
                    id="inTitle"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#111114] border border-[#3f3f46] rounded-lg px-3 py-2 text-sm text-[#fafafa] focus:outline-none focus:border-[#71717a]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#d4d4d8] mb-1.5" htmlFor="inLang">Idioma</label>
                  <select
                    id="inLang"
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full bg-[#111114] border border-[#3f3f46] rounded-lg px-3 py-2 text-sm text-[#fafafa] cursor-pointer"
                  >
                    {availableLanguages.map((lang) => (
                      <option key={lang.id} value={lang.id}>
                        {lang.flag} {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Linha 2: Formato e Opções */}
              <div className="grid grid-cols-[1.35fr_0.65fr] gap-4 items-start">
                <div>
                  <label className="block text-[13px] font-medium text-[#d4d4d8] mb-1.5">Formato</label>
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
                          const nextCat = t.id as MediaCategory;
                          setCategory(nextCat);
                          if (nextCat === 'professores' || nextCat === 'pronuncia') setBeginner(false);
                          if (nextCat === 'pronuncia' && videoMetaCache) {
                            setUrl(videoMetaCache.videoUrl);
                            setTitle(videoMetaCache.videoTitle);
                            setDesc(videoMetaCache.videoDesc);
                            setAvatar(videoMetaCache.videoThumb);
                            setPlatform(videoMetaCache.authorName);
                            setResolvedFromVideoInfo(null);
                            setDuplicateMatch(null);
                            setTags((prev) => Array.from(new Set(['Vídeo', ...prev])));
                          } else if ((nextCat === 'youtube' || nextCat === 'professores') && videoMetaCache) {
                            setUrl(videoMetaCache.channelUrl);
                            setTitle(videoMetaCache.channelTitle);
                            setDesc(videoMetaCache.channelDesc);
                            setAvatar(videoMetaCache.channelAvatar);
                            setResolvedFromVideoInfo({
                              videoTitle: videoMetaCache.videoTitle,
                              channelUrl: videoMetaCache.channelUrl,
                            });
                            setTags((prev) => prev.filter((x) => x !== 'Vídeo'));
                          } else if (nextCat === 'pronuncia' && !videoMetaCache) {
                            setTags((prev) => {
                              const hasType = prev.some((x) => ['Vídeo', 'Artigo', 'Site', 'App'].includes(x));
                              return hasType ? prev : ['Site', ...prev];
                            });
                          }
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
                  <label className="block text-[13px] font-medium text-[#d4d4d8] mb-1.5">Opções</label>
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
                        title={ccNote ? `Status verificado: ${ccNote}` : (subtitles ? "Legendas ativadas" : "Clique para marcar como legendado")}
                      >
                        {subtitles ? '✓ ' : ''}Legendado{ccNote ? ` (${ccNote})` : ''}
                      </button>
                    )}
                    {!isPosterCategory && category !== 'sites' && (
                      <button
                        type="button"
                        onClick={() => setNonNative(!nonNative)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                          nonNative ? 'bg-[#f4f4f5] text-[#09090b] border-[#f4f4f5] font-semibold' : 'bg-[#18181b] border-[#3f3f46] text-[#d4d4d8]'
                        }`}
                      >
                        {nonNative ? '✓ ' : ''}Não-nativo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Linha 3: Configurações do Podcast (Condicional) */}
              {category === 'podcasts' && (
                <div className="bg-[#141418] border border-[#27272a] rounded-xl p-3.5 space-y-2.5">
                  <div className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                    <span>🎙️</span>
                    <span>Configurações do Podcast</span>
                  </div>
                  <div className="grid grid-cols-[1.3fr_0.7fr] gap-3">
                    <div>
                      <label className="block text-[12px] font-medium text-[#d4d4d8] mb-1" htmlFor="inTranscript">
                        Link da Transcrição (opcional)
                      </label>
                      <input
                        id="inTranscript"
                        type="url"
                        value={transcriptUrl}
                        onChange={(e) => setTranscriptUrl(e.target.value)}
                        placeholder="https://site.com/transcripts..."
                        className="w-full bg-[#111114] border border-[#3f3f46] rounded-lg px-2.5 py-1.5 text-xs text-[#fafafa] focus:outline-none focus:border-[#71717a]"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[12px] font-medium text-[#d4d4d8]" htmlFor="inDuration">Duração média</label>
                        <span className="text-[11px] text-[#a1a1aa]">via RSS</span>
                      </div>
                      <div className="relative flex items-center">
                        <input
                          id="inDuration"
                          type="text"
                          inputMode="numeric"
                          value={avgDuration}
                          onChange={(e) => setAvgDuration(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="30"
                          className="w-full bg-[#111114] border border-[#3f3f46] rounded-lg pl-2.5 pr-10 py-1.5 text-xs text-[#fafafa] focus:outline-none focus:border-[#71717a]"
                        />
                        <span className="absolute right-3 text-xs text-zinc-400 pointer-events-none select-none font-medium">
                          min
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Linha 3b: Configurações de Pronúncia (Condicional) */}
              {category === 'pronuncia' && (
                <div className="bg-[#141418] border border-[#27272a] rounded-xl p-3.5 space-y-2.5">
                  <div className="text-xs font-semibold text-zinc-300">
                    Configurações de Pronúncia
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-[1.15fr_0.85fr] gap-3 items-start">
                    <div>
                      <label className="block text-[12px] font-medium text-[#d4d4d8] mb-1">
                        Tipo de recurso
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {(['Vídeo', 'Artigo', 'Site', 'App'] as const).map((subType) => {
                          const isActive = effectiveTags.includes(subType);
                          return (
                            <button
                              key={subType}
                              type="button"
                              onClick={() => {
                                setTags((prev) => {
                                  const withoutTypes = prev.filter(
                                    (t) => !['Vídeo', 'Artigo', 'Site', 'App'].includes(t)
                                  );
                                  return [subType, ...withoutTypes];
                                });
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
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
                    {isPronunciaVideo && (
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[12px] font-medium text-[#d4d4d8]" htmlFor="inPronChannel">
                            Canal de origem
                          </label>
                          <span className="text-[11px] text-[#a1a1aa]">via oEmbed</span>
                        </div>
                        <input
                          id="inPronChannel"
                          type="text"
                          value={platform || ''}
                          onChange={(e) => setPlatform(e.target.value)}
                          placeholder="Sounds American"
                          className="w-full bg-[#111114] border border-[#3f3f46] rounded-lg px-2.5 py-1.5 text-xs text-[#fafafa] focus:outline-none focus:border-[#71717a]"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[13px] font-medium text-[#d4d4d8]" htmlFor="inTag">Tags</label>
                  {effectiveTags.length === 0 && (
                    <span className="text-xs text-zinc-400">Obrigatório (mínimo 1)</span>
                  )}
                </div>
                <div className="relative">
                  <div
                    onClick={() => {
                      document.getElementById('inTag')?.focus();
                      setShowMenu(true);
                    }}
                    className="flex flex-wrap gap-1.5 bg-[#111114] border border-[#3f3f46] focus-within:border-[#71717a] rounded-lg p-1.5 min-h-[38px] items-center cursor-text"
                  >
                    {tags.map((t) => (
                      <span key={t} className="bg-[#18181b] border border-[#3f3f46] rounded-md px-2 py-0.5 text-xs font-medium text-[#d4d4d8] inline-flex items-center gap-1.5">
                        {t}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveTag(t);
                          }}
                          className="text-[#a1a1aa] hover:text-white cursor-pointer"
                          title={`Remover tag ${t}`}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                    <input
                      id="inTag"
                      type="text"
                      value={tagInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.includes(',')) {
                          const parts = val.split(',').map((s) => s.trim()).filter(Boolean);
                          const nextTags = [...tags];
                          parts.forEach((p) => {
                            if (!nextTags.includes(p)) nextTags.push(p);
                          });
                          setTags(nextTags);
                          setTagInput('');
                          return;
                        }
                        setTagInput(val);
                        setShowMenu(true);
                      }}
                      onFocus={() => setShowMenu(true)}
                      onBlur={() => {
                        setTimeout(() => setShowMenu(false), 200);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (filteredTags.length > 0 && trimmedInput) {
                            const first = filteredTags[0];
                            if (first.toLowerCase() === trimmedInput.toLowerCase()) {
                              handleAddTag(first);
                            } else {
                              handleAddTag(trimmedInput);
                            }
                          } else if (trimmedInput) {
                            handleAddTag(trimmedInput);
                          }
                        } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
                          setTags(tags.slice(0, -1));
                        } else if (e.key === 'Escape') {
                          setShowMenu(false);
                        }
                      }}
                      placeholder={tags.length === 0 ? "Adicionar tag (obrigatório, ex: Commander, Humor)" : "Adicionar outra tag..."}
                      className="flex-1 min-w-[140px] bg-transparent border-0 outline-none text-[#fafafa] text-sm px-1 placeholder:text-zinc-500"
                    />
                  </div>

                  {showMenu && (filteredTags.length > 0 || canCreateNew) && (
                    <div className="absolute left-0 right-0 top-[calc(100%+4px)] bg-[#111114] border border-[#3f3f46] rounded-lg p-1 z-50 shadow-2xl max-h-52 overflow-y-auto">
                      {filteredTags.map((v) => (
                        <button
                          key={v}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleAddTag(v);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded text-sm text-[#e4e4e7] hover:bg-[#18181b] cursor-pointer flex items-center justify-between transition-colors"
                        >
                          <span>{v}</span>
                          <span className="text-xs text-zinc-500">sugestão</span>
                        </button>
                      ))}

                      {canCreateNew && (
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleAddTag(trimmedInput);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded text-sm text-emerald-400 hover:bg-[#18181b] cursor-pointer flex items-center gap-1.5 border-t border-zinc-800/80 mt-1 pt-1.5 transition-colors"
                        >
                          <span className="text-xs text-zinc-400">Criar nova tag:</span>
                          <span className="font-semibold text-zinc-100">"{trimmedInput}"</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Linha 5: Descrição oficial (Oculta em Série e Filme, igual ao preview-admin-series.html) */}
              {!isPosterCategory && (
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[13px] font-medium text-[#d4d4d8]" htmlFor="inDesc">Descrição oficial</label>
                    <button
                      type="button"
                      onClick={() => fetchChannelMeta(url)}
                      className="text-xs text-[#a1a1aa] hover:text-[#f4f4f5] hover:underline cursor-pointer"
                    >
                      Refazer busca
                    </button>
                  </div>
                  <textarea
                    id="inDesc"
                    rows={2}
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    className="w-full bg-[#111114] border border-[#3f3f46] rounded-lg px-3 py-2 text-sm text-[#fafafa] focus:outline-none focus:border-[#71717a] resize-y leading-relaxed"
                  />
                </div>
              )}
            </div>
          )}

          <div className="pt-4 flex items-center gap-3.5">
            <button
              type="button"
              disabled={!canSave}
              onClick={handleSave}
              title={!canSave && isLoaded && effectiveTags.length === 0 ? "Adicione pelo menos 1 tag para salvar" : undefined}
              className="bg-[#f4f4f5] text-[#09090b] disabled:opacity-35 disabled:cursor-not-allowed rounded-lg px-4 py-2 font-semibold text-[13.5px] hover:bg-white transition-colors cursor-pointer"
            >
              Salvar conteúdo
            </button>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="text-[#a1a1aa] hover:text-white text-[13px] underline bg-transparent cursor-pointer"
              >
                Voltar
              </button>
            )}
            <span className="text-xs text-[#a1a1aa]">Ctrl + Enter</span>
          </div>
        </section>

        {/* Aside: Preview ao Vivo idêntico ao preview-admin-series.html */}
        <aside className="sticky top-5">
          <div className="flex justify-between items-center mb-1.5 max-w-[340px]">
            <span className="text-[13px] font-medium text-[#a1a1aa]">Preview</span>
            {isLoaded && (
              <button
                type="button"
                onClick={handleRefetchAvatar}
                disabled={isRefetchingAvatar}
                title={isPosterCategory ? 'Recarregar pôster' : 'Recarregar foto do canal'}
                className="bg-transparent border-0 text-[#a1a1aa] hover:text-[#f4f4f5] text-xs cursor-pointer p-0 hover:underline disabled:opacity-50"
              >
                {isRefetchingAvatar
                  ? 'Buscando...'
                  : isPosterCategory
                  ? 'Recarregar capa'
                  : isPronunciaVideo
                  ? 'Recarregar miniatura'
                  : 'Recarregar ícone'}
              </button>
            )}
          </div>

          {isLoaded && isPosterCategory ? (
            <div className="w-full max-w-[340px]">
              <SeriesMovieCard
                isPreview
                channel={{
                  id: 'preview',
                  category,
                  title: title || 'Sem título',
                  url,
                  avatar,
                  initials: (title || 'ST').slice(0, 2).toUpperCase(),
                  description: '',
                  beginnerFriendly: beginner,
                  subtitlesAvailable: subtitles,
                  platform: inferPlatformFromUrl(url, platform),
                  originalLanguage: originalLanguage || selectedLanguage,
                  originalLanguageLabel: originalLanguageLabel,
                  language: selectedLanguage,
                  topics: effectiveTags,
                }}
              />
            </div>
          ) : isLoaded && isPronunciaVideo ? (
            <div className="w-full max-w-[380px]">
              <PronunciaVideoCard
                isPreview
                channel={{
                  id: 'preview',
                  category,
                  title: title || 'Sem título',
                  url,
                  avatar,
                  initials: (title || 'PR').slice(0, 2).toUpperCase(),
                  description: desc,
                  beginnerFriendly: false,
                  subtitlesAvailable: subtitles,
                  platform: platform || undefined,
                  language: selectedLanguage,
                  topics: effectiveTags,
                }}
              />
            </div>
          ) : (
            <div className={`w-full max-w-[380px] min-h-[260px] bg-[#111114] border border-[#27272a] rounded-2xl p-6 flex flex-col justify-between ${!isLoaded ? 'opacity-40' : ''}`}>
              {!isLoaded ? (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-full bg-[#18181b] animate-pulse" />
                    <div className="h-4 w-32 bg-[#18181b] rounded animate-pulse" />
                  </div>
                  <div className="h-3 w-full bg-[#18181b] rounded mb-2 animate-pulse" />
                  <div className="h-3 w-3/4 bg-[#18181b] rounded animate-pulse" />
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-full bg-[#27272a] border border-[#3f3f46] overflow-hidden flex items-center justify-center font-bold text-xs text-[#d4d4d8] flex-shrink-0">
                      {avatar ? (
                        <img src={avatar} alt={title} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      ) : (
                        <span>{title.slice(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-[#f4f4f5] truncate">{title || 'Sem título'}</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-[#d4d4d8] line-clamp-3 mb-5">
                    {desc || 'Sem descrição.'}
                  </p>
                </div>
              )}

              <div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {category !== 'professores' && beginner && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      Iniciante
                    </span>
                  )}
                  {category !== 'podcasts' && category !== 'sites' && subtitles && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Legendado
                    </span>
                  )}
                  {category === 'podcasts' && transcriptUrl && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/30">
                      <span>Transcrição</span>
                      <ExternalLink className="w-3 h-3 text-purple-400" />
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((t) => (
                    <span key={t} className="text-xs font-medium px-2.5 py-1 rounded-md bg-zinc-800/80 text-[#d4d4d8] border border-zinc-700/50">
                      {t}
                    </span>
                  ))}
                </div>
                {category === 'podcasts' && avgDuration && (
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 pt-2.5">
                    <Clock className="w-3.5 h-3.5 text-zinc-500 stroke-[2]" />
                    <span>Episódios de {formatDurationDisplay(avgDuration)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Simulador reposicionado no rodapé esquerdo (fora do formulário, idêntico ao preview-admin-series.html) */}
      <div className="fixed bottom-4 left-6 z-40 bg-[#111114] border border-[#27272a] rounded-xl px-3 py-1.5 flex flex-wrap items-center gap-2 text-xs text-[#a1a1aa] shadow-2xl">
        <span>Simular link colado:</span>
        <button
          type="button"
          onClick={handleSimulateNetflixSeries}
          className="bg-[#18181b] border border-[#3f3f46] hover:border-[#71717a] text-[#e4e4e7] hover:text-white px-2.5 py-1 rounded-md text-xs cursor-pointer transition-colors"
        >
          Netflix Série (Friends)
        </button>
        <button
          type="button"
          onClick={handleSimulateDubbedSeries}
          className="bg-[#18181b] border border-[#3f3f46] hover:border-[#71717a] text-[#e4e4e7] hover:text-white px-2.5 py-1 rounded-md text-xs cursor-pointer transition-colors"
        >
          Série Dublada (Dark)
        </button>
        <button
          type="button"
          onClick={handleSimulateNetflixMovie}
          className="bg-[#18181b] border border-[#3f3f46] hover:border-[#71717a] text-[#e4e4e7] hover:text-white px-2.5 py-1 rounded-md text-xs cursor-pointer transition-colors"
        >
          Netflix Filme (Klaus)
        </button>
        <button
          type="button"
          onClick={handleSimulateSpotify}
          className="bg-[#18181b] border border-[#3f3f46] hover:border-[#71717a] text-[#e4e4e7] hover:text-white px-2.5 py-1 rounded-md text-xs cursor-pointer transition-colors"
        >
          Spotify (innerFrench)
        </button>
        <button
          type="button"
          onClick={handleSimulateWebsite}
          className="bg-[#18181b] border border-[#3f3f46] hover:border-[#71717a] text-[#e4e4e7] hover:text-white px-2.5 py-1 rounded-md text-xs cursor-pointer transition-colors"
        >
          Site (Nachrichtenleicht)
        </button>
        <button
          type="button"
          onClick={handleSimulateNew}
          className="bg-[#18181b] border border-[#3f3f46] hover:border-[#71717a] text-[#e4e4e7] hover:text-white px-2.5 py-1 rounded-md text-xs cursor-pointer transition-colors"
        >
          Canal YouTube
        </button>
        <button
          type="button"
          onClick={handleSimulateExisting}
          className="bg-[#18181b] border border-[#3f3f46] hover:border-[#71717a] text-[#e4e4e7] hover:text-white px-2.5 py-1 rounded-md text-xs cursor-pointer transition-colors"
        >
          Canal já cadastrado
        </button>
      </div>

      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#18181b] border border-[#3f3f46] rounded-xl px-4 py-2.5 text-sm text-[#f4f4f5] shadow-2xl z-50">
          {toastMsg}
        </div>
      )}
    </div>
  );
};
