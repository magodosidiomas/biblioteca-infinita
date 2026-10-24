const fs = require('fs');
const path = require('path');

async function detectYouTubeCC(targetUrl, sampleSize = 6) {
  if (!targetUrl || (!targetUrl.includes('youtube.com') && !targetUrl.includes('youtu.be'))) {
    return { subtitlesAvailable: false };
  }
  try {
    const channelBase = targetUrl.replace(/\/(videos|featured|playlists|search|shorts|streams)\/?.*$/i, '');
    const videosUrl = `${channelBase}/videos`;
    const res = await fetch(videosUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9,it;q=0.8'
      },
      signal: AbortSignal.timeout(6000)
    });
    const html = await res.text();
    const matches = [...new Set([...html.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g)].map((m) => m[1]))];
    const videoIds = matches.slice(0, sampleSize);
    if (videoIds.length === 0) return { subtitlesAvailable: false };

    let manualCount = 0;
    for (const vid of videoIds) {
      try {
        const vRes = await fetch(`https://www.youtube.com/watch?v=${vid}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9,it;q=0.8'
          },
          signal: AbortSignal.timeout(4000)
        });
        const vHtml = await vRes.text();
        const capMatch = vHtml.match(/"captionTracks":(\[.*?\])/);
        if (capMatch) {
          const tracks = JSON.parse(capMatch[1]);
          const manual = tracks.some((t) => t.kind !== 'asr');
          if (manual) manualCount++;
        }
      } catch {}
    }
    return { subtitlesAvailable: manualCount >= 1 };
  } catch {
    return { subtitlesAvailable: false };
  }
}

const TARGETS = [
  // Imersão Iniciante
  {
    name: 'Podcast Italiano',
    url: 'https://www.youtube.com/@PodcastItaliano',
    website: 'https://podcastitaliano.com/',
    beginnerFriendly: true,
    tags: ['Materiais Adaptados', 'Educação', 'Vlog'],
    category: 'YouTube'
  },
  {
    name: 'Learn Italian with Lucrezia',
    url: 'https://www.youtube.com/@lucreziaoddone',
    beginnerFriendly: true,
    tags: ['Materiais Adaptados', 'Vlog', 'Educação'],
    category: 'YouTube'
  },
  {
    name: 'Easy Italian',
    url: 'https://www.youtube.com/@EasyItalian',
    beginnerFriendly: true,
    tags: ['Materiais Adaptados', 'Entrevistas', 'Cultura'],
    subtitleTag: 'Legendas bilíngues',
    category: 'YouTube'
  },

  // Imersão Nativa (Parte 1: Sugeridos aprovados + Yotobi + Cucina Botanica)
  {
    name: 'Geopop',
    url: 'https://www.youtube.com/@geopop',
    beginnerFriendly: false,
    tags: ['Ciência', 'Geografia', 'Curiosidades'],
    category: 'YouTube'
  },
  {
    name: 'Nova Lectio',
    url: 'https://www.youtube.com/@NovaLectio',
    beginnerFriendly: false,
    tags: ['História', 'Geopolítica', 'Documentário'],
    category: 'YouTube'
  },
  {
    name: 'Italia Squisita',
    url: 'https://www.youtube.com/@italiasquisita',
    beginnerFriendly: false,
    tags: ['Gastronomia', 'Cultura'],
    category: 'YouTube'
  },
  {
    name: 'Human Safari',
    url: 'https://www.youtube.com/@HumanSafari',
    beginnerFriendly: false,
    tags: ['Viagem', 'Vlog'],
    category: 'YouTube'
  },
  {
    name: 'La Fisica Che Ci Piace',
    url: 'https://www.youtube.com/@Lafisicachecipiace',
    beginnerFriendly: false,
    tags: ['Ciência', 'Educação'],
    category: 'YouTube'
  },
  {
    name: 'Slim Dogs',
    url: 'https://www.youtube.com/@SlimDogs',
    beginnerFriendly: false,
    tags: ['Cinema', 'Audiovisual'],
    category: 'YouTube'
  },
  {
    name: '151eg',
    url: 'https://www.youtube.com/@151eg',
    beginnerFriendly: false,
    tags: ['Cinema', 'Animação'],
    category: 'YouTube'
  },
  {
    name: 'Barbascura X',
    url: 'https://www.youtube.com/@BarbascuraX',
    beginnerFriendly: false,
    tags: ['Ciência', 'Humor'],
    category: 'YouTube'
  },
  {
    name: 'Cucina Botanica',
    url: 'https://www.youtube.com/@CucinaBotanica',
    beginnerFriendly: false,
    tags: ['Gastronomia', 'Culinária'],
    category: 'YouTube'
  },
  {
    name: 'Yotobi',
    url: 'https://www.youtube.com/@yotobi',
    beginnerFriendly: false,
    tags: ['Cinema', 'Humor', 'Games'],
    category: 'YouTube'
  },

  // Imersão Nativa (Parte 2: Lista fornecida pelo usuário)
  {
    name: 'Antonio Martone',
    url: 'https://www.youtube.com/@DrAntonioMartone',
    beginnerFriendly: false,
    tags: ['Desenvolvimento Pessoal', 'Filosofia'],
    category: 'YouTube'
  },
  {
    name: 'Claudio di Biagio',
    url: 'https://www.youtube.com/@ClaudioDiBiagio',
    beginnerFriendly: false,
    tags: ['Vlog', 'Cinema', 'Cultura'],
    category: 'YouTube'
  },
  {
    name: 'Daniela Ballarini',
    url: 'https://www.youtube.com/@danielaballarini',
    beginnerFriendly: false,
    tags: ['Saúde', 'Desenvolvimento Pessoal', 'Vlog'],
    category: 'YouTube'
  },
  {
    name: 'Giuseppe Castagna',
    url: 'https://www.youtube.com/@gcastagna',
    beginnerFriendly: false,
    tags: ['Produtividade', 'Finanças', 'Carreira'],
    category: 'YouTube'
  },
  {
    name: 'HDblog',
    url: 'https://www.youtube.com/@HDblog',
    beginnerFriendly: false,
    tags: ['Tecnologia', 'Notícias'],
    category: 'YouTube'
  },
  {
    name: 'Le Stelle Marine',
    url: 'https://www.youtube.com/@lestellemarine',
    beginnerFriendly: false,
    tags: ['Entretenimento', 'Humor', 'Vlog'],
    category: 'YouTube'
  },
  {
    name: 'Mia Ceran',
    url: 'https://www.youtube.com/@sonomiaceran',
    beginnerFriendly: false,
    tags: ['Jornalismo', 'Entrevistas', 'Cultura'],
    category: 'YouTube'
  },
  {
    name: 'TechDale',
    url: 'https://www.youtube.com/@TechDale',
    beginnerFriendly: false,
    tags: ['Tecnologia', 'Futurismo'],
    category: 'YouTube'
  },
  {
    name: 'MikCosentino',
    url: 'https://www.youtube.com/@MiKCosentinoYT',
    beginnerFriendly: false,
    tags: ['Marketing', 'Empreendedorismo', 'Negócios'],
    category: 'YouTube'
  },
  {
    name: 'Ilenia Vitolo',
    url: 'https://www.youtube.com/@Itsileniavitolo',
    beginnerFriendly: true,
    tags: ['Materiais Adaptados', 'Vlog', 'Educação'],
    category: 'YouTube'
  },
  {
    name: 'WatchMojo Italia',
    url: 'https://www.youtube.com/@watchmojoitalia',
    beginnerFriendly: false,
    tags: ['Cinema', 'Curiosidades', 'Cultura Geek'],
    category: 'YouTube'
  }
];

function decodeHtml(html) {
  if (!html) return '';
  return html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&#([0-9]{1,6});/gi, (_, num) => String.fromCharCode(parseInt(num, 10)))
    .trim();
}

async function scrape() {
  const results = [];

  for (const item of TARGETS) {
    console.log(`Buscando metadados oficiais: ${item.name} (${item.url})...`);
    try {
      const res = await fetch(item.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7'
        },
        redirect: 'follow'
      });
      const html = await res.text();

      // Metadados oficiais literais
      const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]*)"/i) || html.match(/<title>([^<]*)<\/title>/i);
      const descMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]*)"/i) || html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
      const ogImgMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i);
      const yt3Match = html.match(/(https:\/\/yt3\.googleusercontent\.com\/[a-zA-Z0-9_\-=]+)/);

      let rawTitle = titleMatch ? decodeHtml(titleMatch[1]).replace(/\s*-\s*YouTube$/i, '') : item.name;
      let rawDesc = descMatch ? decodeHtml(descMatch[1]) : '';
      let avatar = ogImgMatch ? ogImgMatch[1] : (yt3Match ? yt3Match[1] : null);

      if (avatar && avatar.includes('=s')) {
        avatar = avatar.replace(/=s\d+.*$/, '=s900-c-k-c0x00ffffff-no-rj');
      }

      // Check legendas
      console.log(`  Verificando legendas para ${item.name}...`);
      let ccRes = { subtitlesAvailable: false };
      try {
        ccRes = await detectYouTubeCC(item.url, 6);
      } catch (err) {
        console.warn(`  Falha ao checar CC: ${err.message}`);
      }

      const id = 'it_' + item.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

      const finalItem = {
        id,
        name: rawTitle || item.name,
        url: item.url,
        avatar: avatar || `https://www.google.com/s2/favicons?domain=youtube.com&sz=128`,
        desc: rawDesc,
        tags: item.tags,
        beginnerFriendly: Boolean(item.beginnerFriendly),
        subtitlesAvailable: Boolean(item.subtitleTag || ccRes.subtitlesAvailable),
        subtitleTag: item.subtitleTag ? item.subtitleTag : (ccRes.subtitlesAvailable ? 'Legendas [CC]' : null),
        transcriptUrl: item.website || null,
        avgDuration: null,
        platform: null,
        originalLanguage: null,
        originalLanguageLabel: null
      };

      results.push(finalItem);
      console.log(`  ✓ Concluído: ${finalItem.name} | avatar: ${Boolean(finalItem.avatar)} | desc length: ${finalItem.desc.length} | CC: ${finalItem.subtitlesAvailable}`);
    } catch (e) {
      console.error(`Erro ao buscar ${item.name}:`, e.message);
    }
  }

  fs.writeFileSync('scripts/italian-scraped.json', JSON.stringify(results, null, 2), 'utf8');
  console.log(`Salvo em scripts/italian-scraped.json com ${results.length} canais.`);
}

scrape();
