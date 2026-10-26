import type { Plugin } from 'vite'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { detectYouTubeCC } from './vite-subs.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function resolveChannelAvatar(rawUrl: string): Promise<string | null> {
  const urls: string[] = [rawUrl]
  const cMatch = rawUrl.match(/youtube\.com\/c\/([^\/?#]+)/i)
  if (cMatch) {
    urls.push(`https://www.youtube.com/@${cMatch[1]}`)
  }
  const root = rawUrl.replace(/\/(videos|featured|playlists|search)\/?.*$/i, '')
  if (root !== rawUrl) {
    urls.push(root)
    const cMatch2 = root.match(/youtube\.com\/c\/([^\/?#]+)/i)
    if (cMatch2) {
      urls.push(`https://www.youtube.com/@${cMatch2[1]}`)
    }
  }

  const uniqueUrls = [...new Set(urls)]
  for (const targetUrl of uniqueUrls) {
    try {
      const res = await fetch(targetUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(6000),
      })
      const html = await res.text()
      const ogMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i)
      if (ogMatch && ogMatch[1] && !ogMatch[1].includes('favicon') && !ogMatch[1].endsWith('/a')) {
        return ogMatch[1].replace(/&amp;/g, '&')
      }

      const yt3Match = html.match(/(https:\/\/yt3\.googleusercontent\.com\/[a-zA-Z0-9_\-=]+)/)
      if (yt3Match && yt3Match[1] && yt3Match[1].length > 35 && !yt3Match[1].endsWith('/a')) {
        return yt3Match[1]
      }
    } catch {
      // continua para a próxima URL
    }
  }

  // Fallback para thumbnail de vídeo caso seja URL de vídeo individual
  const vMatch = rawUrl.match(/(?:watch\?v=|\/embed\/|\.be\/)([a-zA-Z0-9_-]{11})/)
  if (vMatch) {
    return `https://i.ytimg.com/vi/${vMatch[1]}/hqdefault.jpg`
  }

  // Fallback genérico do Google Favicons
  try {
    const domain = new URL(rawUrl).hostname
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
  } catch {
    return null
  }
}

async function resolvePodcastDuration(title: string, rawUrl?: string): Promise<string | null> {
  // 1. Tentar diretamente do Spotify Embed se for URL do Spotify (/show/)
  if (rawUrl && rawUrl.includes('/show/')) {
    try {
      const showId = rawUrl.match(/show\/([a-zA-Z0-9]+)/)?.[1]
      if (showId) {
        const embedRes = await fetch(`https://open.spotify.com/embed/show/${showId}`, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
          signal: AbortSignal.timeout(4000),
        })
        const html = await embedRes.text()
        const nextData = html.match(/<script id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i)
        if (nextData) {
          const parsed = JSON.parse(nextData[1])
          const durationMs = parsed?.props?.pageProps?.state?.data?.entity?.duration
          if (durationMs && typeof durationMs === 'number' && durationMs > 0) {
            const min = Math.round(durationMs / 60000)
            if (min > 0) return `${min}`
          }
        }
      }
    } catch {
      // continua para o fallback
    }
  }

  // 2. Tentar Apple Podcasts URL se for link de podcast da Apple
  if (rawUrl && rawUrl.includes('podcasts.apple.com') && rawUrl.includes('/id')) {
    try {
      const idMatch = rawUrl.match(/id(\d+)/)
      if (idMatch) {
        const res = await fetch(`https://itunes.apple.com/lookup?id=${idMatch[1]}`, {
          signal: AbortSignal.timeout(4000),
        })
        const data: any = await res.json()
        const feedUrl = data?.results?.[0]?.feedUrl
        if (feedUrl) {
          const rssRes = await fetch(feedUrl, { signal: AbortSignal.timeout(4000) })
          const xml = await rssRes.text()
          const matches = [...xml.matchAll(/<itunes:duration>([^<]+)<\/itunes:duration>/g)].map((m) => m[1]).slice(0, 8)
          const secs = matches
            .map((m) => {
              const parts = m.trim().split(':').map(Number)
              if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
              if (parts.length === 2) return parts[0] * 60 + parts[1]
              return Number(m) || 0
            })
            .filter((s) => s > 0)
          if (secs.length) {
            const avgSec = secs.reduce((a, b) => a + b, 0) / secs.length
            const avgMin = Math.round(avgSec / 60)
            if (avgMin > 0) return `${avgMin}`
          }
        }
      }
    } catch {
      // continua para o fallback de busca
    }
  }

  // 3. Fallback via iTunes Search API pelo título do podcast
  if (title) {
    try {
      const cleanSearch = title.replace(/\s*[-–—|]\s*(Podcast|on Spotify|Spotify).*$/i, '').trim()
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(cleanSearch)}&media=podcast&limit=1`, {
        signal: AbortSignal.timeout(4000),
      })
      const data: any = await res.json()
      const feedUrl = data?.results?.[0]?.feedUrl
      if (!feedUrl) return null
      const rssRes = await fetch(feedUrl, { signal: AbortSignal.timeout(4000) })
      const xml = await rssRes.text()
      const matches = [...xml.matchAll(/<itunes:duration>([^<]+)<\/itunes:duration>/g)].map((m) => m[1]).slice(0, 8)
      const secs = matches
        .map((m) => {
          const parts = m.trim().split(':').map(Number)
          if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
          if (parts.length === 2) return parts[0] * 60 + parts[1]
          return Number(m) || 0
        })
        .filter((s) => s > 0)
      if (!secs.length) return null
      const avgSec = secs.reduce((a, b) => a + b, 0) / secs.length
      const avgMin = Math.round(avgSec / 60)
      return avgMin > 0 ? `${avgMin}` : null
    } catch {
      return null
    }
  }

  return null
}

function decodeHtmlEntities(str: string): string {
  if (!str) return ''
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&#([0-9]{1,6});/gi, (_, numStr) => {
      const num = parseInt(numStr, 10)
      return String.fromCharCode(num)
    })
}

const ORIG_LANG_MAP: Record<string, { key: string; label: string }> = {
  english: { key: 'english', label: 'Inglês' },
  en: { key: 'english', label: 'Inglês' },
  german: { key: 'german', label: 'Alemão' },
  de: { key: 'german', label: 'Alemão' },
  french: { key: 'french', label: 'Francês' },
  fr: { key: 'french', label: 'Francês' },
  spanish: { key: 'spanish', label: 'Espanhol' },
  es: { key: 'spanish', label: 'Espanhol' },
  italian: { key: 'italian', label: 'Italiano' },
  it: { key: 'italian', label: 'Italiano' },
  russian: { key: 'russian', label: 'Russo' },
  ru: { key: 'russian', label: 'Russo' },
  japanese: { key: 'japanese', label: 'Japonês' },
  ja: { key: 'japanese', label: 'Japonês' },
  portuguese: { key: 'portuguese', label: 'Português' },
  pt: { key: 'portuguese', label: 'Português' },
  polish: { key: 'polish', label: 'Polonês' },
  pl: { key: 'polish', label: 'Polonês' },
  ukrainian: { key: 'ukrainian', label: 'Ucraniano' },
  uk: { key: 'ukrainian', label: 'Ucraniano' },
  arabic: { key: 'arabic', label: 'Árabe' },
  ar: { key: 'arabic', label: 'Árabe' },
  korean: { key: 'korean', label: 'Coreano' },
  ko: { key: 'korean', label: 'Coreano' },
  chinese: { key: 'chinese', label: 'Mandarim' },
  zh: { key: 'chinese', label: 'Mandarim' },
  dutch: { key: 'dutch', label: 'Holandês' },
  nl: { key: 'dutch', label: 'Holandês' },
  swedish: { key: 'swedish', label: 'Sueco' },
  sv: { key: 'swedish', label: 'Sueco' },
  norwegian: { key: 'norwegian', label: 'Norueguês' },
  no: { key: 'norwegian', label: 'Norueguês' },
  danish: { key: 'danish', label: 'Dinamarquês' },
  da: { key: 'danish', label: 'Dinamarquês' },
  finnish: { key: 'finnish', label: 'Finlandês' },
  fi: { key: 'finnish', label: 'Finlandês' },
  turkish: { key: 'turkish', label: 'Turco' },
  tr: { key: 'turkish', label: 'Turco' },
  greek: { key: 'greek', label: 'Grego' },
  el: { key: 'greek', label: 'Grego' },
  hebrew: { key: 'hebrew', label: 'Hebraico' },
  he: { key: 'hebrew', label: 'Hebraico' },
  hindi: { key: 'hindi', label: 'Hindi' },
  hi: { key: 'hindi', label: 'Hindi' },
  vietnamese: { key: 'vietnamese', label: 'Vietnamita' },
  vi: { key: 'vietnamese', label: 'Vietnamita' },
  thai: { key: 'thai', label: 'Tailandês' },
  th: { key: 'thai', label: 'Tailandês' },
  indonesian: { key: 'indonesian', label: 'Indonésio' },
  id: { key: 'indonesian', label: 'Indonésio' },
  czech: { key: 'czech', label: 'Tcheco' },
  cs: { key: 'czech', label: 'Tcheco' },
  hungarian: { key: 'hungarian', label: 'Húngaro' },
  hu: { key: 'hungarian', label: 'Húngaro' },
  romanian: { key: 'romanian', label: 'Romeno' },
  ro: { key: 'romanian', label: 'Romeno' },
}

const GENRE_PT_MAP: Record<string, string> = {
  comedy: 'Humor',
  sitcom: 'Sitcom',
  'science-fiction': 'Ficção Científica',
  'sci-fi': 'Ficção Científica',
  'sci-fi & fantasy': 'Ficção Científica',
  thriller: 'Suspense',
  mystery: 'Mistério',
  drama: 'Drama',
  animation: 'Animação',
  anime: 'Animação',
  adventure: 'Aventura',
  action: 'Ação',
  'action & adventure': 'Aventura',
  fantasy: 'Fantasia',
  crime: 'Policial',
  romance: 'Romance',
  kids: 'Infantil',
  family: 'Infantil',
  documentary: 'Documentário',
}

async function resolveSeriesOrMovieCatalog(
  rawTitle: string,
  preferMovie: boolean
): Promise<{
  poster: string | null
  originalLanguage: string | null
  originalLanguageLabel: string | null
  genres: string[]
  detectedFormat: 'series' | 'movies' | null
}> {
  const cleanSearch = rawTitle
    .replace(/^(Watch|Assistir|Assista a)\s+/i, '')
    .replace(/\s*[-–—|]\s*(Site oficial da Netflix|Netflix Official Site|Netflix|Disney\+|Prime Video|Apple TV\+).*$/i, '')
    .trim()

  if (!cleanSearch) {
    return { poster: null, originalLanguage: null, originalLanguageLabel: null, genres: [], detectedFormat: null }
  }

  // 1. Se for filme (ou se TVMaze não achar), tenta iTunes Movie Search + TVMaze em paralelo
  try {
    const [tvRes, movieRes] = await Promise.allSettled([
      fetch(`https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(cleanSearch)}`, {
        signal: AbortSignal.timeout(4500),
      }),
      fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(cleanSearch)}&media=movie&entity=movie&limit=1`, {
        signal: AbortSignal.timeout(4500),
      }),
    ])

    let tvData: any = null
    if (tvRes.status === 'fulfilled' && tvRes.value.ok) {
      tvData = await tvRes.value.json()
    }

    let movieData: any = null
    if (movieRes.status === 'fulfilled' && movieRes.value.ok) {
      const mJson: any = await movieRes.value.json()
      movieData = mJson?.results?.[0] || null
    }

    const useMovie = preferMovie ? Boolean(movieData) : (!tvData && Boolean(movieData))

    if (useMovie && movieData) {
      const poster = movieData.artworkUrl100
        ? String(movieData.artworkUrl100).replace('100x100bb', '600x900bb')
        : null
      const rawGenre = String(movieData.primaryGenreName || '').toLowerCase()
      const mappedGenre = GENRE_PT_MAP[rawGenre]
      return {
        poster,
        originalLanguage: 'english',
        originalLanguageLabel: 'Inglês',
        genres: mappedGenre ? [mappedGenre] : [],
        detectedFormat: 'movies',
      }
    }

    if (tvData) {
      const poster = tvData.image?.original || tvData.image?.medium || null
      const rawLang = String(tvData.language || 'English').toLowerCase()
      const langObj = ORIG_LANG_MAP[rawLang] || { key: 'english', label: tvData.language || 'Inglês' }
      const genres: string[] = []
      if (Array.isArray(tvData.genres)) {
        tvData.genres.forEach((g: string) => {
          const mapped = GENRE_PT_MAP[String(g).toLowerCase()]
          if (mapped && !genres.includes(mapped)) genres.push(mapped)
        })
      }
      return {
        poster,
        originalLanguage: langObj.key,
        originalLanguageLabel: langObj.label,
        genres: genres.slice(0, 2),
        detectedFormat: 'series',
      }
    }
  } catch {
    // ignore
  }

  return { poster: null, originalLanguage: null, originalLanguageLabel: null, genres: [], detectedFormat: null }
}

export function syncChannelsTsFromData(data: Record<string, any>) {
  const mapCat: Record<string, string> = {
    YouTube: 'youtube',
    Podcasts: 'podcasts',
    Séries: 'series',
    Filmes: 'movies',
    Professores: 'professores',
    Pronúncia: 'pronuncia',
    Recursos: 'sites'
  }
  const items: any[] = []

  Object.keys(data).forEach((langKey) => {
    const langObj = data[langKey] || {}
    Object.keys(langObj).forEach((k) => {
      const targetCat = mapCat[k]
      if (!targetCat) return

      ;(langObj[k] || []).forEach((c: any) => {
        const rawInitials = (c.name || c.title || langKey.slice(0, 2).toUpperCase())
          .split(' ')
          .filter(Boolean)
          .map((w: string) => w[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()
        let desc = (c.desc || c.description || '')
          .replace(/&#39;/g, "'")
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/\s+/g, ' ')
          .trim()

        items.push({
          id: c.id || `${langKey}_${(c.name || c.title || '').toLowerCase().replace(/[^a-z0-9]/g, '')}`,
          category: targetCat,
          title: c.name || c.title,
          url: c.url || '#',
          avatar: c.avatar || null,
          initials: rawInitials || langKey.slice(0, 2).toUpperCase(),
          description: desc,
          beginnerFriendly: Boolean(c.difficulty === 'iniciante' || (c.tags || []).includes('Iniciante') || c.beginnerFriendly),
          subtitlesAvailable: Boolean(c.subtitleTag === 'Legendas [CC]' || c.subtitleTag === 'Legendas bilíngues' || c.subtitlesAvailable),
          transcriptUrl: c.transcriptUrl || c.transcript || null,
          avgDuration: c.avgDuration || null,
          platform: c.platform || null,
          originalLanguage: c.originalLanguage || null,
          originalLanguageLabel: c.originalLanguageLabel || null,
          accent: c.accent || null,
          flag: c.flag || null,
          language: langKey,
          topics: c.tags || c.topics || ['Geral']
        })
      })
    })
  })

  const channelsJsonPath = path.resolve(__dirname, 'src/data/channels.json')
  fs.writeFileSync(channelsJsonPath, JSON.stringify(items, null, 2), 'utf-8')

  const channelsFilePath = path.resolve(__dirname, 'src/data/channels.ts')
  const fileContent = `import type { ChannelItem } from '../types/content';\n\nexport const CHANNELS: ChannelItem[] = ${JSON.stringify(items, null, 2)};\n`
  fs.writeFileSync(channelsFilePath, fileContent, 'utf-8')
}

export async function resolveChannelMetadata(rawUrl: string): Promise<{ avatar: string | null; desc: string | null; title: string | null }> {
  const avatar = await resolveChannelAvatar(rawUrl)
  let desc: string | null = null
  let title: string | null = null

  try {
    const res = await fetch(rawUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,fr;q=0.7,de;q=0.7,es;q=0.7',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(6000),
    })
    const html = await res.text()
    const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)
    const ogDesc = html.match(/<meta\s+property="og:description"\s+content="([^"]*)"/i)
    const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]*)"/i) || html.match(/<title>([^<]*)<\/title>/i)

    const rawDesc = descMatch ? descMatch[1] : (ogDesc ? ogDesc[1] : null)
    if (rawDesc) {
      const decoded = decodeHtmlEntities(rawDesc).trim()
      if (!decoded.toLowerCase().startsWith('share your videos with friends') && !decoded.toLowerCase().startsWith('enjoy the videos and music you love')) {
        desc = decoded
      }
    }
    if (titleMatch && titleMatch[1]) {
      title = decodeHtmlEntities(titleMatch[1]).replace(/\s*[-–—|]\s*YouTube\s*[-–—|]?$/i, '').trim()
    }
  } catch {
    // continua com o que conseguiu
  }

  return { avatar, desc, title }
}

export function adminDevPlugin(): Plugin {
  return {
    name: 'vite-admin-dev-plugin',
    apply: 'serve', // Ativo estritamente no servidor local de desenvolvimento
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // 0. Endpoint para obter a lista atualizada de canais sem depender de import estático
        if (req.url?.startsWith('/api/get-channels') && req.method === 'GET') {
          try {
            const channelsJsonPath = path.resolve(__dirname, 'src/data/channels.json')
            if (fs.existsSync(channelsJsonPath)) {
              const jsonContent = fs.readFileSync(channelsJsonPath, 'utf-8')
              res.setHeader('Content-Type', 'application/json')
              res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
              res.end(jsonContent)
              return
            }
            const channelsFilePath = path.resolve(__dirname, 'src/data/channels.ts')
            const content = fs.readFileSync(channelsFilePath, 'utf-8')
            const match = content.match(/export const CHANNELS: ChannelItem\[\] = (\[[\s\S]*?\]);?\s*$/)
            if (match) {
              res.setHeader('Content-Type', 'application/json')
              res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
              res.end(match[1])
              return
            }
          } catch {
            // fallback
          }
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
          res.end(JSON.stringify([]))
          return
        }

        // 1. Endpoint para puxar metadados automaticamente de links
        if (req.url?.startsWith('/api/fetch-meta')) {
          const urlObj = new URL(req.url, 'http://localhost')
          const targetUrl = urlObj.searchParams.get('url') || ''
          const fallbackTitle = (urlObj.searchParams.get('title') || '').trim()
          if (!targetUrl && !fallbackTitle) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'URL ou título são obrigatórios' }))
            return
          }

          try {
            let effectiveUrl = targetUrl.trim()
            let resolvedFromVideo = false
            let originalVideoTitle: string | null = null
            let originalVideoDesc: string | null = null
            let originalVideoThumb: string | null = null
            let videoAuthorName: string | null = null
            let detectedChannelUrl: string | null = null

            const videoIdMatch = effectiveUrl.match(/(?:youtube\.com\/(?:watch\?.*v=|shorts\/|live\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i)
            const isYouTubeVideoUrl = Boolean(videoIdMatch)
            if (isYouTubeVideoUrl && videoIdMatch) {
              originalVideoThumb = `https://i.ytimg.com/vi/${videoIdMatch[1]}/hqdefault.jpg`
              try {
                // Buscar HTML original do vídeo para extrair descrição oficial do vídeo
                const vRes = await fetch(effectiveUrl, {
                  headers: {
                    'User-Agent':
                      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
                  },
                  signal: AbortSignal.timeout(4500),
                })
                if (vRes.ok) {
                  const vHtml = await vRes.text()
                  const vDescMatch =
                    vHtml.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i) ||
                    vHtml.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i)
                  if (vDescMatch?.[1]) {
                    originalVideoDesc = decodeHtmlEntities(vDescMatch[1]).trim()
                  }
                  const vTitleMatch = vHtml.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i)
                  if (vTitleMatch?.[1]) {
                    originalVideoTitle = decodeHtmlEntities(vTitleMatch[1]).replace(/ - YouTube$/i, '').trim()
                  }
                }
              } catch {}

              try {
                const oembedRes = await fetch(
                  `https://www.youtube.com/oembed?url=${encodeURIComponent(effectiveUrl)}&format=json`,
                  { signal: AbortSignal.timeout(4000) }
                )
                if (oembedRes.ok) {
                  const oembedData: any = await oembedRes.json()
                  if (oembedData?.title && !originalVideoTitle) {
                    originalVideoTitle = oembedData.title
                  }
                  if (oembedData?.author_name) {
                    videoAuthorName = oembedData.author_name
                  }
                  if (oembedData?.thumbnail_url) {
                    originalVideoThumb = oembedData.thumbnail_url
                  }
                  if (oembedData?.author_url) {
                    detectedChannelUrl = oembedData.author_url
                    effectiveUrl = oembedData.author_url
                    resolvedFromVideo = true
                  }
                }
              } catch {
                // fallback para inspeção de HTML caso oEmbed falhe
              }
            }

            const isSpotify = effectiveUrl.includes('spotify.com')
            const userAgent = isSpotify
              ? 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'
              : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

            const resp = await fetch(effectiveUrl, {
              headers: {
                'User-Agent': userAgent,
                'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
              },
            })
            let html = await resp.text()

            // Fallback: se era link de vídeo e oEmbed não retornou author_url, tenta extrair canonicalBaseUrl / ownerProfileUrl do HTML do vídeo
            if (isYouTubeVideoUrl && !resolvedFromVideo) {
              const ownerMatch =
                html.match(/"ownerProfileUrl"\s*:\s*"(https?:\\\/\\\/www\.youtube\.com\\\/@[^"]+)"/i) ||
                html.match(/"canonicalBaseUrl"\s*:\s*"(\\\/@[^"]+)"/i) ||
                html.match(/<link[^>]*itemprop=["']url["'][^>]*href=["'](https?:\/\/www\.youtube\.com\/(?:@|channel\/)[^"']+)["']/i)
              if (ownerMatch && ownerMatch[1]) {
                const rawChannel = ownerMatch[1].replace(/\\\//g, '/')
                detectedChannelUrl = rawChannel.startsWith('http') ? rawChannel : `https://www.youtube.com${rawChannel}`
                effectiveUrl = detectedChannelUrl
                resolvedFromVideo = true
                const chResp = await fetch(effectiveUrl, {
                  headers: {
                    'User-Agent': userAgent,
                    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
                  },
                })
                html = await chResp.text()
              }
            }

            const extractMeta = (attrName: string, attrValue: string): string => {
              const regex1 = new RegExp(`<meta[^>]*${attrName}=["']${attrValue}["'][^>]*content=["']([^"']*)["']`, 'i')
              const regex2 = new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*${attrName}=["']${attrValue}["']`, 'i')
              return (html.match(regex1) || html.match(regex2) || [])[1] || ''
            }

            const ogTitle = extractMeta('property', 'og:title') || extractMeta('name', 'twitter:title')
            const ogSiteName = extractMeta('property', 'og:site_name') || extractMeta('name', 'application-name')
            const metaTitle = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1]?.replace(/\s+/g, ' ').trim() || ''
            const ogDesc = extractMeta('property', 'og:description') || extractMeta('name', 'twitter:description')
            const metaDesc = extractMeta('name', 'description')
            const ogImage = extractMeta('property', 'og:image') || extractMeta('name', 'twitter:image')

            const decodeEntities = (s: string) =>
              s
                .replace(/&#x27;/g, "'")
                .replace(/&#39;/g, "'")
                .replace(/&quot;/g, '"')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&nbsp;/g, ' ')

            let cleanTitle = decodeEntities((ogTitle || metaTitle || ogSiteName || '').replace(/ - YouTube$/i, '').trim())
            let cleanDesc = decodeEntities((ogDesc || metaDesc || '').trim())
            let cleanAvatar = ogImage

            // Resolver URLs relativas para og:image ou extrair apple-touch-icon / favicon em alta resolução para sites
            const resolveRelativeUrl = (rawHref: string, base: string): string => {
              if (!rawHref) return ''
              const trimmed = rawHref.trim().replace(/&amp;/g, '&')
              try {
                return new URL(trimmed, base).href
              } catch {
                return trimmed
              }
            }

            if (cleanAvatar) {
              cleanAvatar = resolveRelativeUrl(cleanAvatar, effectiveUrl)
            }

            const extractBestSiteIcon = (htmlContent: string, baseUrl: string): string => {
              const linkTags = [...htmlContent.matchAll(/<link\b[^>]*>/gi)].map((m) => m[0])
              let bestHref = ''
              let bestScore = -1

              for (const tag of linkTags) {
                const relMatch = tag.match(/\brel=["']([^"']+)["']/i)
                const hrefMatch = tag.match(/\bhref=["']([^"']+)["']/i)
                if (!relMatch || !hrefMatch) continue

                const rel = relMatch[1].toLowerCase()
                const href = hrefMatch[1]
                if (!rel.includes('icon')) continue

                let score = 0
                if (rel.includes('apple-touch-icon')) score += 500
                else if (rel.includes('fluid-icon') || rel.includes('mask-icon')) score += 200
                else if (rel.includes('icon')) score += 100

                const sizesMatch = tag.match(/\bsizes=["'](\d+)x(\d+)["']/i)
                if (sizesMatch) {
                  score += parseInt(sizesMatch[1], 10)
                } else if (href.match(/(\d{2,3})x(\d{2,3})/)) {
                  const m = href.match(/(\d{2,3})x(\d{2,3})/)
                  if (m) score += parseInt(m[1], 10)
                }

                if (href.endsWith('.png') || href.endsWith('.svg') || href.endsWith('.webp')) {
                  score += 30
                }

                if (score > bestScore) {
                  bestScore = score
                  bestHref = href
                }
              }

              if (bestHref) {
                return resolveRelativeUrl(bestHref, baseUrl)
              }

              try {
                const domain = new URL(baseUrl).hostname
                return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
              } catch {
                return ''
              }
            }

            if (!cleanAvatar) {
              cleanAvatar = extractBestSiteIcon(html, effectiveUrl)
            }

            let avgDuration: string | null = null
            let detectedTranscriptUrl: string | null = null

            if (isSpotify) {
              cleanTitle = cleanTitle
                .replace(/\s*[-–—|]\s*(Podcast on Spotify|on Spotify|Spotify).*$/i, '')
                .trim()
              if (cleanTitle.toLowerCase().startsWith('spotify')) {
                cleanTitle = cleanTitle.replace(/^spotify\s*[-–—|]?\s*/i, '').trim()
              }
              // Limpar prefixo genérico de podcast no Spotify (ex: "Podcast · innerFrench · ")
              cleanDesc = cleanDesc.replace(/^Podcast\s*·\s*[^·]+\s*·\s*/i, '').trim()

              // Auto-detectar link de transcrição na descrição oficial
              const transcriptMatch = cleanDesc.match(/https?:\/\/[^\s"'<>)]*(?:transcript|transcription|transcricao|podcast)[^\s"'<>)]*/i)
              if (transcriptMatch) {
                detectedTranscriptUrl = transcriptMatch[0].replace(/[.,;:)]+$/, '')
              }

              try {
                const oembedRes = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(targetUrl)}`, {
                  signal: AbortSignal.timeout(3500),
                })
                if (oembedRes.ok) {
                  const oembedData: any = await oembedRes.json()
                  if (oembedData.title && (!cleanTitle || cleanTitle.toLowerCase().includes('web player'))) {
                    cleanTitle = oembedData.title
                  }
                  if (oembedData.thumbnail_url && (!cleanAvatar || cleanAvatar.includes('favicon'))) {
                    cleanAvatar = oembedData.thumbnail_url
                  }
                }
              } catch {}
              avgDuration = await resolvePodcastDuration(cleanTitle, targetUrl)
            } else if (targetUrl.includes('podcasts.apple.com') || targetUrl.includes('/podcast/')) {
              avgDuration = await resolvePodcastDuration(cleanTitle, targetUrl)
            }

            // Heurística de detecção de idioma (priorizando atributo <html lang="..."> ou og:locale)
            const htmlLangMatch = html.match(/<html[^>]*\blang=["']([a-zA-Z]{2})(?:[-_][a-zA-Z0-9]+)*["']/i)
            const ogLocaleMatch = extractMeta('property', 'og:locale').match(/^([a-zA-Z]{2})/i)
            const isoLang = (htmlLangMatch?.[1] || ogLocaleMatch?.[1] || '').toLowerCase()
            const isoLangMap: Record<string, string> = {
              en: 'Inglês',
              es: 'Espanhol',
              fr: 'Francês',
              de: 'Alemão',
              it: 'Italiano',
              ja: 'Japonês',
              ru: 'Russo',
              zh: 'Mandarim',
              ko: 'Coreano',
            }

            const combinedText = `${cleanTitle} ${cleanDesc} ${effectiveUrl}`.toLowerCase()
            let detectedLanguage = isoLangMap[isoLang] || ''
            if (!detectedLanguage) {
              detectedLanguage = 'Inglês'
              if (/[\u3040-\u30ff\u4e00-\u9faf]/.test(combinedText) || /\b(japanese|japonês|nihon|nihongo|kanji)\b/.test(combinedText)) {
                detectedLanguage = 'Japonês'
              } else if (/[\u0400-\u04FF]/.test(combinedText) || /\b(russian|russia|russo|russisch|русский)\b/.test(combinedText)) {
                detectedLanguage = 'Russo'
              } else if (/[äöüß]/.test(combinedText) || /\b(german|deutsch|alemão|deutschland|lernen|nachrichten|für|mit|ein|eine)\b/.test(combinedText)) {
                detectedLanguage = 'Alemão'
              } else if (/\b(français|france|french|francês|apprendre|avec|pour|dans|une|les|des|vous|nous|est|c'est|chaine|épisode)\b/.test(combinedText) || /[éèêëàâôûçîï]/.test(combinedText)) {
                detectedLanguage = 'Francês'
              } else if (/[ñ¿¡]/.test(combinedText) || /\b(español|spanish|espanhol|aprender|para|con|los|las|una|uno|este|esta|noticias|canal|todos)\b/.test(combinedText)) {
                detectedLanguage = 'Espanhol'
              } else if (/\b(italiano|italian|italia|imparare|per|con|gli|della|delle|sono|molto|tutti|questo|anche)\b/.test(combinedText)) {
                detectedLanguage = 'Italiano'
              }
            }

            // Sugestão de ID limpo
            let suggestedId = cleanTitle
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/[^a-z0-9]+/g, '_')
              .replace(/^_+|_+$/g, '')

            if (effectiveUrl.includes('@')) {
              const handle = effectiveUrl.split('@')[1]?.split(/[/?]/)[0]
              if (handle) {
                suggestedId = handle.toLowerCase().replace(/[^a-z0-9]+/g, '_')
              }
            }

            // Verificação de duplicata no catálogo existente
            let existingMatch: any = null
            try {
              const contentFilePath = path.resolve(__dirname, 'src/data/content.json')
              const data = JSON.parse(fs.readFileSync(contentFilePath, 'utf-8'))
              const cleanTargetUrl = effectiveUrl.toLowerCase().trim().replace(/\/+$/, '').split('?')[0]
              const handleMatch = cleanTargetUrl.match(/@([a-z0-9_.-]+)/)
              const handle = handleMatch ? handleMatch[1].replace(/[^a-z0-9]/g, '') : ''

              outer: for (const lKey of Object.keys(data)) {
                const lObj = data[lKey] || {}
                for (const fKey of Object.keys(lObj)) {
                  for (const c of (lObj[fKey] || [])) {
                    const cUrl = (c.url || '').toLowerCase().trim().replace(/\/+$/, '').split('?')[0]
                    if (cUrl && cUrl === cleanTargetUrl) {
                      existingMatch = { id: c.id, title: c.name || c.title, language: lKey, format: fKey }
                      break outer
                    }
                    if (handle) {
                      const cHandleMatch = cUrl.match(/@([a-z0-9_.-]+)/)
                      if (cHandleMatch && cHandleMatch[1].replace(/[^a-z0-9]/g, '') === handle) {
                        existingMatch = { id: c.id, title: c.name || c.title, language: lKey, format: fKey }
                        break outer
                      }
                    }
                  }
                }
              }
            } catch {}

            // Alertas de Qualidade Anti-Slop
            const isYouTube = effectiveUrl.includes('youtube.com') || effectiveUrl.includes('youtu.be')
            const isStreaming =
              effectiveUrl.includes('netflix.com') ||
              effectiveUrl.includes('disneyplus.com') ||
              effectiveUrl.includes('primevideo.com') ||
              effectiveUrl.includes('tv.apple.com') ||
              effectiveUrl.includes('max.com') ||
              effectiveUrl.includes('hbomax.com')

            const qualityAlerts: string[] = []
            if (isYouTubeVideoUrl && !resolvedFromVideo) {
              qualityAlerts.push('Link de vídeo individual detectado (não foi possível resolver o canal automaticamente). Substitua pelo link do canal.')
            }
            if (!isStreaming && (!cleanDesc || cleanDesc.length < 15)) {
              qualityAlerts.push(isYouTube ? 'Canal sem bio oficial pública no YouTube.' : 'Descrição oficial curta ou não encontrada nas meta tags.')
            }
            if (!cleanAvatar || (cleanAvatar.includes('google.com/s2/favicons') && isYouTube)) {
              qualityAlerts.push('Avatar de alta resolução não encontrado (fallback aplicado).')
            }

            // Heurística de classificação Imersão vs Professor vs Pronúncia vs Podcasts vs Séries/Filmes/Sites
            const pronKeywords = /\b(pronunciation|pron[uú]ncia|phonetics?|fon[eé]tica|ipa\b|shadowing|pitch accent|youglish|forvo|boldvoice|elsa speak)\b/i
            const teacherKeywords = /\b(gram[aá]tica|grammar|aulas? de|learn english with|apprenez le|deutsch lernen mit regeln|teacher|professor|professora|curso de)\b/i
            const fullInspectText = `${originalVideoTitle || ''} ${originalVideoDesc || ''} ${cleanTitle} ${cleanDesc} ${targetUrl}`
            let suggestedType = isSpotify
              ? 'podcasts'
              : isStreaming
              ? 'series'
              : pronKeywords.test(fullInspectText)
              ? 'pronuncia'
              : isYouTube
              ? (teacherKeywords.test(`${cleanTitle} ${cleanDesc}`) ? 'professores' : 'youtube')
              : 'sites'

            // Se for site genérico, limpar sufixos de branding ou usar nome curto do site quando o <title> for um slogan longo
            if (suggestedType === 'sites') {
              const rawSiteName = decodeEntities(ogSiteName.trim())
              if (rawSiteName && rawSiteName.length >= 2 && rawSiteName.length <= 35 && cleanTitle.length > 45) {
                cleanTitle = rawSiteName
              } else if (cleanTitle.includes(' | ') || cleanTitle.includes(' — ') || cleanTitle.includes(' - ')) {
                const parts = cleanTitle.split(/\s+(?:\||—|-)\s+/)
                if (parts.length >= 2) {
                  // Se a primeira parte for curta (nome da marca) e a segunda for slogan longo, fica com a marca (ou vice-versa)
                  const first = parts[0].trim()
                  const last = parts[parts.length - 1].trim()
                  if (first.length >= 3 && first.length <= 28 && last.length > 30) {
                    cleanTitle = first
                  } else if (last.length >= 3 && last.length <= 28 && first.length > 35) {
                    cleanTitle = last
                  }
                }
              }
              if (/nachrichtenleicht\.de/i.test(effectiveUrl) && /nachrichten in einfacher sprache/i.test(cleanTitle)) {
                cleanTitle = 'Nachrichtenleicht'
              }
            }

            let detectedPlatform: string | null = null
            let originalLanguage: string | null = null
            let originalLanguageLabel: string | null = null
            const suggestedTags = new Set<string>()

            if (effectiveUrl.includes('netflix.com')) detectedPlatform = 'Netflix'
            else if (effectiveUrl.includes('disneyplus.com')) detectedPlatform = 'Disney+'
            else if (effectiveUrl.includes('primevideo.com')) detectedPlatform = 'Prime Video'
            else if (effectiveUrl.includes('tv.apple.com')) detectedPlatform = 'Apple TV+'
            else if (effectiveUrl.includes('max.com') || effectiveUrl.includes('hbomax.com')) detectedPlatform = 'Max'
            else if (isYouTube) detectedPlatform = 'YouTube'

            // Se for link de streaming (ex: Netflix), limpa o título e busca pôster 2:3 + idioma original automaticamente
            if (isStreaming) {
              cleanTitle = cleanTitle
                .replace(/^(Watch|Assistir|Assista a)\s+/i, '')
                .replace(/\s*[-–—|]\s*(Site oficial da Netflix|Netflix Official Site|Netflix|Disney\+|Prime Video|Apple TV\+).*$/i, '')
                .trim()

              if ((!cleanTitle || /^netflix$/i.test(cleanTitle)) && fallbackTitle) {
                cleanTitle = fallbackTitle
              }

              const isMovieInLd = /"@type"\s*:\s*"Movie"/i.test(html)
              const isSeriesInLd = /"@type"\s*:\s*"TVSeries"/i.test(html)
              if (isMovieInLd) suggestedType = 'movies'
              else if (isSeriesInLd) suggestedType = 'series'

              const catalogInfo = await resolveSeriesOrMovieCatalog(cleanTitle || fallbackTitle, isMovieInLd)
              if (catalogInfo.poster) {
                cleanAvatar = catalogInfo.poster
              }
              if (catalogInfo.originalLanguage) {
                originalLanguage = catalogInfo.originalLanguage
                originalLanguageLabel = catalogInfo.originalLanguageLabel
              }
              if (catalogInfo.detectedFormat && !isMovieInLd && !isSeriesInLd) {
                suggestedType = catalogInfo.detectedFormat
              }
              if (catalogInfo.genres.length > 0) {
                catalogInfo.genres.forEach((g) => suggestedTags.add(g))
              }
            }

            // Heurística de Iniciante e Materiais Adaptados
            const beginnerKeywords = /\b(comprehensible input|beginner|iniciante|f[aá]cil|easy german|slow german|einfacher? sprache|leichter? sprache|nachrichtenleicht|news in levels|a1|a2|basic|b[aá]sico)\b/i
            const suggestedBeginner = beginnerKeywords.test(`${cleanTitle} ${cleanDesc} ${effectiveUrl}`)

            // Sugestões automáticas de tags atômicas canônicas
            if (suggestedBeginner) {
              suggestedTags.add('Iniciante')
              suggestedTags.add('Materiais Adaptados')
            }
            const textToInspect = `${cleanTitle} ${cleanDesc}`.toLowerCase()
            if (/\b(vlog|vlogs|daily life|rotina|alltag|vida real)\b/.test(textToInspect)) suggestedTags.add('Vlog')
            if (/\b(cooking|food|gastronomia|culin[aá]ria|kochen|essen|receitas?)\b/.test(textToInspect)) suggestedTags.add('Gastronomia')
            if (/\b(tech|tecnologia|gadgets?|hardware|electronics|smartphone)\b/.test(textToInspect)) suggestedTags.add('Tecnologia')
            if (/\b(science|ci[eê]ncia|wissenschaft|physics|biologia|astronomia)\b/.test(textToInspect)) suggestedTags.add('Ciência')
            if (/\b(history|hist[oó]ria|geschichte|historical)\b/.test(textToInspect)) suggestedTags.add('História')
            if (/\b(travel|viagem|viagens|reisen|trip|copenhagen|berlin|seoul)\b/.test(textToInspect)) suggestedTags.add('Viagem')
            if (/\b(games|gaming|jogos|gameplay|streamer)\b/.test(textToInspect)) suggestedTags.add('Games')
            if (/\b(not[ií]cias|news|nachrichten|jornalismo|tagesschau)\b/.test(textToInspect)) suggestedTags.add('Notícias')
            if (/\b(humor|comedy|com[eé]dia|sketch|funny|lustig)\b/.test(textToInspect)) suggestedTags.add('Humor')

            let ccInfo: any = {
              manualCount: 0,
              sampleCount: 0,
              ratio: 0,
              ratioFormatted: '',
              manualLanguages: [],
              detectedViaKeyword: false,
            }
            let subtitlesAvailable = false

            if (!isSpotify && (effectiveUrl.includes('youtube.com') || effectiveUrl.includes('youtu.be'))) {
              ccInfo = await detectYouTubeCC(effectiveUrl, 10)
              const subKeywords = /\b(legendas?|legendado|subtitles?|subtitled|untertitel|subt[ií]tulos?|sous-titres?|closed captions?)\b|\[cc\]|\bcc\b/i
              const hasSubtitlesKeyword = subKeywords.test(`${cleanTitle} ${cleanDesc}`)
              ccInfo.detectedViaKeyword = hasSubtitlesKeyword
              subtitlesAvailable = Boolean(ccInfo.subtitlesAvailable)
            } else if (isStreaming) {
              subtitlesAvailable = true
            }

            res.setHeader('Content-Type', 'application/json')
            res.end(
              JSON.stringify({
                title: cleanTitle,
                desc: cleanDesc,
                avatar: cleanAvatar || ogImage,
                resolvedUrl: effectiveUrl !== targetUrl.trim() ? effectiveUrl : null,
                resolvedFromVideo,
                originalVideoUrl: isYouTubeVideoUrl ? targetUrl.trim() : null,
                originalVideoTitle,
                originalVideoDesc,
                originalVideoThumb,
                videoAuthorName: videoAuthorName || (isYouTube ? cleanTitle : null),
                isVideoUrl: isYouTubeVideoUrl && !resolvedFromVideo,
                avgDuration,
                transcriptUrl: detectedTranscriptUrl,
                platform: detectedPlatform,
                originalLanguage,
                originalLanguageLabel,
                suggestedId,
                detectedLanguage,
                subtitlesAvailable,
                existingMatch,
                qualityAlerts,
                suggestedType,
                suggestedBeginner,
                suggestedTags: Array.from(suggestedTags),
                ccInfo,
              })
            )
          } catch (err: any) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: err.message }))
          }
          return
        }

        // 2. Endpoint para salvar no content.json local e sincronizar channels.ts
        if (req.url === '/api/save-content' && req.method === 'POST') {
          let body = ''
          req.on('data', (chunk) => {
            body += chunk
          })
          req.on('end', () => {
            try {
              const { format: rawFormat, item, isUpdate, langKey, originalLangKey, originalFormat } = JSON.parse(body)
              const contentFilePath = path.resolve(__dirname, 'src/data/content.json')
              const data = JSON.parse(fs.readFileSync(contentFilePath, 'utf-8'))

              const formatMap: Record<string, string> = {
                youtube: 'YouTube',
                YouTube: 'YouTube',
                podcasts: 'Podcasts',
                Podcasts: 'Podcasts',
                professores: 'Professores',
                Professores: 'Professores',
                pronuncia: 'Pronúncia',
                Pronúncia: 'Pronúncia',
                series: 'Séries',
                'Séries': 'Séries',
                movies: 'Filmes',
                Filmes: 'Filmes',
                sites: 'Recursos',
                Recursos: 'Recursos',
              }

              const format = formatMap[rawFormat] || formatMap[item?.category] || 'YouTube'
              const targetLang = langKey || item?.language || 'english'
              if (!data[targetLang]) data[targetLang] = {}
              if (!data[targetLang][format]) data[targetLang][format] = []

              const rawTags = item.tags || item.topics || []
              const validTags = Array.isArray(rawTags)
                ? rawTags.map((t: any) => String(t).trim()).filter(Boolean)
                : []

              if (validTags.length === 0) {
                res.statusCode = 400
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: 'tags_required', message: 'Adicione pelo menos uma tag.' }))
                return
              }

              const isVideoLink = /(?:youtube\.com\/(?:watch\?.*v=|shorts\/|live\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i.test(item?.url || '')
              if ((format === 'YouTube' || format === 'Professores') && isVideoLink) {
                res.statusCode = 400
                res.setHeader('Content-Type', 'application/json')
                res.end(
                  JSON.stringify({
                    error: 'video_url_not_allowed',
                    message: 'Link de vídeo individual não permitido em canais. Use a URL do canal (@canal).',
                  })
                )
                return
              }

              const normalizedItem = {
                ...item,
                name: item.name || item.title || 'Sem título',
                desc: item.desc ?? item.description ?? '',
                tags: validTags,
                beginnerFriendly: Boolean(item.beginnerFriendly),
                subtitlesAvailable: Boolean(item.subtitlesAvailable),
                subtitleTag: item.subtitlesAvailable ? 'Legendas [CC]' : null,
                transcriptUrl: item.transcriptUrl || null,
                avgDuration: item.avgDuration || null,
                platform: item.platform || null,
                originalLanguage: item.originalLanguage || null,
                originalLanguageLabel: item.originalLanguageLabel || null,
              }

              // Se é uma atualização ou se mudou de idioma/formato, remove ocorrências anteriores do mesmo ID
              if (isUpdate || originalLangKey || originalFormat) {
                for (const lKey of Object.keys(data)) {
                  const lObj = data[lKey] || {}
                  for (const fKey of Object.keys(lObj)) {
                    if ((lKey !== targetLang || fKey !== format) && Array.isArray(lObj[fKey])) {
                      lObj[fKey] = lObj[fKey].filter((x: any) => x.id !== normalizedItem.id)
                    }
                  }
                }
              }

              const collection = data[targetLang][format]

              // Normalizar URLs e handles para detecção precisa (preservando ?v= em vídeos do YouTube)
              const normalizeUrl = (u: string) => {
                const raw = (u || '').toLowerCase().trim().replace(/\/+$/, '')
                const vMatch = raw.match(/(?:watch\?.*v=|youtu\.be\/|shorts\/)([a-z0-9_-]{11})/i)
                if (vMatch) return `https://www.youtube.com/watch?v=${vMatch[1]}`
                return raw.split('?')[0]
              }

              const extractHandle = (u: string) => {
                if (!u) return ''
                const clean = u.toLowerCase().split('?')[0].replace(/\/+$/, '')
                const hMatch = clean.match(/@([a-z0-9_.-]+)/)
                if (hMatch) return hMatch[1].replace(/[^a-z0-9]/g, '')
                const cMatch = clean.match(/\/(c|user)\/([a-z0-9_.-]+)/)
                if (cMatch) return cMatch[2].replace(/[^a-z0-9]/g, '')
                const chMatch = clean.match(/\/channel\/([a-z0-9_-]+)/)
                if (chMatch) return chMatch[1]
                return ''
              }

              const normalizeName = (s: string) =>
                (s || '')
                  .toLowerCase()
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .replace(/[^a-z0-9]/g, '')

              const targetUrl = normalizeUrl(normalizedItem.url)
              const targetHandle = extractHandle(targetUrl)
              const targetNameKey = normalizeName(normalizedItem.name)

              // Busca duplicatas na coleção alvo
              const existingIdx = collection.findIndex((x: any) => {
                if (x.id === normalizedItem.id) return true
                const xUrl = normalizeUrl(x.url)
                if (targetUrl && xUrl === targetUrl) return true
                const xHandle = extractHandle(xUrl)
                if (targetHandle && xHandle && targetHandle === xHandle) return true
                if (targetNameKey && targetNameKey.length >= 3 && normalizeName(x.name || x.title) === targetNameKey) return true
                return false
              })

              if (existingIdx >= 0 && !isUpdate) {
                res.statusCode = 409
                res.setHeader('Content-Type', 'application/json')
                res.end(
                  JSON.stringify({
                    error: 'already_exists',
                    existingItem: collection[existingIdx],
                  })
                )
                return
              }

              if (existingIdx >= 0 && isUpdate) {
                collection[existingIdx] = { ...collection[existingIdx], ...normalizedItem }
              } else {
                collection.unshift(normalizedItem) // Adiciona no início
              }

              fs.writeFileSync(contentFilePath, JSON.stringify(data, null, 2), 'utf-8')
              syncChannelsTsFromData(data)

              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: true, count: collection.length, item: normalizedItem }))
            } catch (err: any) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: err.message }))
            }
          })
          return
        }

        // 3. Endpoint para excluir/desfazer adição no content.json e sincronizar channels.ts
        if (req.url === '/api/delete-content' && req.method === 'POST') {
          let body = ''
          req.on('data', (chunk) => {
            body += chunk
          })
          req.on('end', () => {
            try {
              const { id } = JSON.parse(body)
              const contentFilePath = path.resolve(__dirname, 'src/data/content.json')
              const data = JSON.parse(fs.readFileSync(contentFilePath, 'utf-8'))

              let mutated = false
              for (const lKey of Object.keys(data)) {
                const lObj = data[lKey] || {}
                for (const fKey of Object.keys(lObj)) {
                  if (Array.isArray(lObj[fKey])) {
                    const before = lObj[fKey].length
                    lObj[fKey] = lObj[fKey].filter((x: any) => x.id !== id)
                    if (lObj[fKey].length !== before) mutated = true
                  }
                }
              }

              if (mutated) {
                fs.writeFileSync(contentFilePath, JSON.stringify(data, null, 2), 'utf-8')
                syncChannelsTsFromData(data)
              }

              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: true, deletedId: id }))
            } catch (err: any) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: err.message }))
            }
          })
          return
        }

        // 4. Endpoint para atualizar/re-extrair o ícone (avatar) de um item específico
        if (req.url === '/api/refresh-avatar' && req.method === 'POST') {
          let body = ''
          req.on('data', (chunk) => {
            body += chunk
          })
          req.on('end', async () => {
            try {
              const { format, id, langKey, url } = JSON.parse(body)
              if (!url) {
                res.statusCode = 400
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: 'URL é obrigatória' }))
                return
              }

              const newAvatar = await resolveChannelAvatar(url)
              if (!newAvatar) {
                res.statusCode = 404
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: 'Não foi possível encontrar um novo ícone para esta URL' }))
                return
              }

              const contentFilePath = path.resolve(__dirname, 'src/data/content.json')
              const data = JSON.parse(fs.readFileSync(contentFilePath, 'utf-8'))
              const targetLang = langKey || 'english'

              if (data[targetLang] && data[targetLang][format]) {
                const item = data[targetLang][format].find((x: any) => x.id === id)
                if (item) {
                  item.avatar = newAvatar
                  fs.writeFileSync(contentFilePath, JSON.stringify(data, null, 2), 'utf-8')
                  syncChannelsTsFromData(data)
                }
              }

              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: true, avatar: newAvatar }))
            } catch (err: any) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: err.message }))
            }
          })
          return
        }

        // 4b. Endpoint para re-extrair metadados completos (avatar, descrição e título) de um item
        if (req.url === '/api/regenerate-metadata' && req.method === 'POST') {
          let body = ''
          req.on('data', (chunk) => {
            body += chunk
          })
          req.on('end', async () => {
            try {
              const { format, id, langKey, url } = JSON.parse(body)
              if (!url) {
                res.statusCode = 400
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: 'URL é obrigatória' }))
                return
              }

              const meta = await resolveChannelMetadata(url)
              const contentFilePath = path.resolve(__dirname, 'src/data/content.json')
              const data = JSON.parse(fs.readFileSync(contentFilePath, 'utf-8'))
              const targetLang = langKey || 'french'

              if (data[targetLang] && data[targetLang][format]) {
                const item = data[targetLang][format].find((x: any) => x.id === id)
                if (item) {
                  if (meta.avatar) item.avatar = meta.avatar
                  if (meta.desc) item.desc = meta.desc
                  fs.writeFileSync(contentFilePath, JSON.stringify(data, null, 2), 'utf-8')
                  syncChannelsTsFromData(data)
                }
              }

              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({
                success: true,
                avatar: meta.avatar,
                desc: meta.desc,
                title: meta.title
              }))
            } catch (err: any) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: err.message }))
            }
          })
          return
        }

        // 5. Endpoint para exclusão em lote (bulk delete)
        if (req.url === '/api/bulk-delete' && req.method === 'POST') {
          let body = ''
          req.on('data', (chunk) => {
            body += chunk
          })
          req.on('end', () => {
            try {
              const { items } = JSON.parse(body) // items: Array<{ id: string, format: string, langKey: string }>
              if (!Array.isArray(items) || items.length === 0) {
                res.statusCode = 400
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: 'Nenhum item fornecido para exclusão' }))
                return
              }

              const contentFilePath = path.resolve(__dirname, 'src/data/content.json')
              const data = JSON.parse(fs.readFileSync(contentFilePath, 'utf-8'))

              items.forEach(({ id, format, langKey }) => {
                const targetLang = langKey || 'french'
                if (data[targetLang] && data[targetLang][format]) {
                  data[targetLang][format] = data[targetLang][format].filter(
                    (x: any) => x.id !== id
                  )
                }
              })

              fs.writeFileSync(contentFilePath, JSON.stringify(data, null, 2), 'utf-8')
              syncChannelsTsFromData(data)

              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: true, count: items.length }))
            } catch (err: any) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: err.message }))
            }
          })
          return
        }

        // 6. Endpoint para mover idioma/formato em lote (bulk move)
        if (req.url === '/api/bulk-move' && req.method === 'POST') {
          let body = ''
          req.on('data', (chunk) => {
            body += chunk
          })
          req.on('end', () => {
            try {
              const { items, targetLangKey, targetFormat } = JSON.parse(body)
              if (!Array.isArray(items) || items.length === 0) {
                res.statusCode = 400
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: 'Nenhum item fornecido' }))
                return
              }

              const contentFilePath = path.resolve(__dirname, 'src/data/content.json')
              const data = JSON.parse(fs.readFileSync(contentFilePath, 'utf-8'))

              items.forEach(({ id, format: origFmt, langKey: origLang }) => {
                const fromLang = origLang || 'french'
                const toLang = targetLangKey || fromLang
                const toFmt = targetFormat || origFmt

                if (data[fromLang] && data[fromLang][origFmt]) {
                  const itemIdx = data[fromLang][origFmt].findIndex((x: any) => x.id === id)
                  if (itemIdx >= 0) {
                    const [item] = data[fromLang][origFmt].splice(itemIdx, 1)
                    if (!data[toLang]) data[toLang] = {}
                    if (!data[toLang][toFmt]) data[toLang][toFmt] = []
                    data[toLang][toFmt].unshift(item)
                  }
                }
              })

              fs.writeFileSync(contentFilePath, JSON.stringify(data, null, 2), 'utf-8')
              syncChannelsTsFromData(data)

              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: true, count: items.length }))
            } catch (err: any) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: err.message }))
            }
          })
          return
        }

        // 7. Endpoint para salvar a configuração de idiomas no languages.ts
        if (req.url === '/api/save-languages' && req.method === 'POST') {
          let body = ''
          req.on('data', (chunk) => {
            body += chunk
          })
          req.on('end', () => {
            try {
              const { languages: newLangs } = JSON.parse(body)
              if (!Array.isArray(newLangs) || newLangs.length === 0) {
                res.statusCode = 400
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: 'Lista de idiomas inválida' }))
                return
              }

              const languagesFilePath = path.resolve(__dirname, 'src/constants/languages.ts')
              let content = fs.readFileSync(languagesFilePath, 'utf-8')
              const jsonFormatted = JSON.stringify(newLangs, null, 2)
              const regex = /export const INITIAL_LANGS: LanguageItem\[\] = \[[\s\S]*?\];/
              if (regex.test(content)) {
                content = content.replace(regex, `export const INITIAL_LANGS: LanguageItem[] = ${jsonFormatted};`)
                fs.writeFileSync(languagesFilePath, content, 'utf-8')
              }

              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: true, count: newLangs.length }))
            } catch (err: any) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: err.message }))
            }
          })
          return
        }

        // 8. Endpoint para obter a lista canônica de idiomas do disco
        if (req.url === '/api/get-languages' && req.method === 'GET') {
          try {
            const languagesFilePath = path.resolve(__dirname, 'src/constants/languages.ts')
            const content = fs.readFileSync(languagesFilePath, 'utf-8')
            const match = content.match(/export const INITIAL_LANGS: LanguageItem\[\] = (\[[\s\S]*?\]);/)
            if (match) {
              res.setHeader('Content-Type', 'application/json')
              res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
              res.end(match[1])
              return
            }
          } catch {}
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify([]))
          return
        }

        next()
      })
    },
  }
}
