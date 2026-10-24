export interface CCResult {
  subtitlesAvailable: boolean
  manualCount: number
  sampleCount: number
  ratio: number
  ratioFormatted: string
  manualLanguages: string[]
}

export async function detectYouTubeCC(targetUrl: string, sampleSize = 10): Promise<CCResult> {
  const defaultResult: CCResult = {
    subtitlesAvailable: false,
    manualCount: 0,
    sampleCount: 0,
    ratio: 0,
    ratioFormatted: '0/0',
    manualLanguages: [],
  }

  if (!targetUrl || (!targetUrl.includes('youtube.com') && !targetUrl.includes('youtu.be'))) {
    return defaultResult
  }

  const vMatch = targetUrl.match(/(?:watch\?v=|\/embed\/|\.be\/)([a-zA-Z0-9_-]{11})/)
  let videoIds: string[] = []

  if (vMatch) {
    videoIds = [vMatch[1]]
  } else {
    try {
      const channelBase = targetUrl.replace(/\/(videos|featured|playlists|search|shorts|streams)\/?.*$/i, '')
      const videosUrl = `${channelBase}/videos`

      const res = await fetch(videosUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9,pt-BR;q=0.8,de;q=0.7',
        },
        signal: AbortSignal.timeout(6000),
      })
      const html = await res.text()
      const jsonMatch = html.match(/var ytInitialData = ({.*?});<\/script>/s) ||
                        html.match(/window\["ytInitialData"\] = ({.*?});<\/script>/s)

      if (jsonMatch) {
        try {
          const data = JSON.parse(jsonMatch[1])
          const tabs = data?.contents?.twoColumnBrowseResultsRenderer?.tabs || []
          const videosTab = tabs.find((t: any) => t.tabRenderer?.title === 'Videos' || t.tabRenderer?.endpoint?.commandMetadata?.webCommandMetadata?.url?.includes('/videos'))
          const contents = videosTab?.tabRenderer?.content?.richGridRenderer?.contents || []

          for (const item of contents) {
            const lvm = item?.richItemRenderer?.content?.lockupViewModel
            if (lvm && lvm.contentId) {
              videoIds.push(lvm.contentId)
              continue
            }
            const vr = item?.richItemRenderer?.content?.videoRenderer
            if (vr && vr.videoId) {
              videoIds.push(vr.videoId)
            }
          }
        } catch {}
      }

      if (videoIds.length === 0) {
        const matches = [...new Set([...html.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g)].map((m) => m[1]))]
        videoIds = matches.slice(0, sampleSize)
      } else {
        videoIds = [...new Set(videoIds)].slice(0, sampleSize)
      }
    } catch {
      return defaultResult
    }
  }

  if (videoIds.length === 0) {
    return defaultResult
  }

  const detectedLanguages = new Set<string>()

  try {
    const checks = await Promise.all(
      videoIds.map(async (vid) => {
        try {
          const res = await fetch(`https://www.youtube.com/watch?v=${vid}`, {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept-Language': 'en-US,en;q=0.9,pt-BR;q=0.8,de;q=0.7',
            },
            signal: AbortSignal.timeout(4000),
          })
          const html = await res.text()
          const match = html.match(/"captionTracks":(\[.*?\])/)
          if (!match) return false

          const tracks = JSON.parse(match[1])
          const manualTracks = tracks.filter((t: any) => !t.kind || t.kind !== 'asr')
          if (manualTracks.length > 0) {
            manualTracks.forEach((t: any) => {
              if (t.name?.simpleText) detectedLanguages.add(t.name.simpleText)
              else if (t.languageCode) detectedLanguages.add(t.languageCode)
            })
            return true
          }
          return false
        } catch {
          return false
        }
      })
    )

    const manualCount = checks.filter(Boolean).length
    const sampleCount = checks.length
    const ratio = sampleCount > 0 ? manualCount / sampleCount : 0

    return {
      subtitlesAvailable: ratio >= 0.7,
      manualCount,
      sampleCount,
      ratio,
      ratioFormatted: `${manualCount}/${sampleCount}`,
      manualLanguages: Array.from(detectedLanguages),
    }
  } catch {
    return defaultResult
  }
}
