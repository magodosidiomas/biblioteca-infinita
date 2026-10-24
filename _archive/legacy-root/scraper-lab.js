const http = require('http');
const https = require('https');
const urlModule = require('url');

// Função para buscar oEmbed do YouTube
function fetchYouTube(targetUrl) {
  return new Promise((resolve) => {
    // Detecta ID do vídeo ou handle do canal
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(targetUrl)}&format=json`;
    https.get(oembedUrl, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          // Tenta extrair ID do video para pegar thumbnail em alta resolução
          const videoMatch = targetUrl.match(/(?:v=|\/embed\/|\/shorts\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
          const highResThumb = videoMatch ? `https://img.youtube.com/vi/${videoMatch[1]}/maxresdefault.jpg` : json.thumbnail_url;
          resolve({
            platform: 'YouTube',
            title: json.title || '',
            author: json.author_name || '',
            thumbnail: highResThumb,
            thumbnailType: '16:9',
            raw: json
          });
        } catch (e) {
          resolve({ platform: 'YouTube', error: 'Não foi possível carregar via oEmbed' });
        }
      });
    }).on('error', (err) => resolve({ platform: 'YouTube', error: err.message }));
  });
}

// Função para buscar oEmbed do Spotify
function fetchSpotify(targetUrl) {
  return new Promise((resolve) => {
    const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(targetUrl)}`;
    https.get(oembedUrl, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({
            platform: 'Spotify',
            title: json.title || '',
            thumbnail: json.thumbnail_url || '',
            thumbnailType: '1:1 (Quadrada)',
            raw: json
          });
        } catch (e) {
          resolve({ platform: 'Spotify', error: 'Não foi possível carregar via Spotify oEmbed' });
        }
      });
    }).on('error', (err) => resolve({ platform: 'Spotify', error: err.message }));
  });
}

// Função genérica de OpenGraph para sites, blogs e outros
function fetchOpenGraph(targetUrl) {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(targetUrl);
      const req = (parsed.protocol === 'https:' ? https : http).get(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      }, (res) => {
        // Tratar redirects
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          let redir = res.headers.location;
          if (!redir.startsWith('http')) redir = new URL(redir, targetUrl).href;
          return fetchOpenGraph(redir).then(resolve);
        }

        let body = '';
        res.setEncoding('utf-8');
        res.on('data', chunk => {
          body += chunk;
          if (body.length > 500000) res.destroy(); // limite de 500kb para header/html
        });
        res.on('end', () => {
          const ogTitle = (body.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i) ||
                           body.match(/<title>([^<]*)<\/title>/i) || [])[1] || '';
          
          const ogImage = (body.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i) || [])[1] || '';
          
          const ogDesc = (body.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i) ||
                          body.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) || [])[1] || '';

          // Tratar URL relativa de imagem
          let finalImg = ogImage;
          if (ogImage && !ogImage.startsWith('http')) {
            try { finalImg = new URL(ogImage, targetUrl).href; } catch(e){}
          }

          resolve({
            platform: parsed.hostname.replace('www.', ''),
            title: ogTitle.trim(),
            description: ogDesc.trim(),
            thumbnail: finalImg,
            thumbnailType: finalImg ? 'OpenGraph' : 'Nenhuma imagem encontrada',
            raw: { ogTitle, ogImage: finalImg, ogDesc }
          });
        });
      });
      req.on('error', (err) => resolve({ platform: 'Web', error: err.message }));
      req.setTimeout(6000, () => { req.destroy(); resolve({ platform: 'Web', error: 'Timeout de 6s' }); });
    } catch(err) {
      resolve({ platform: 'Web', error: err.message });
    }
  });
}

// Roteador inteligente de scrape
async function scrapeUrl(targetUrl) {
  if (targetUrl.includes('youtube.com') || targetUrl.includes('youtu.be')) {
    return await fetchYouTube(targetUrl);
  }
  if (targetUrl.includes('spotify.com')) {
    return await fetchSpotify(targetUrl);
  }
  return await fetchOpenGraph(targetUrl);
}

// Servidor local simples com UI de teste
const server = http.createServer(async (req, res) => {
  const parsedUrl = urlModule.parse(req.url, true);

  if (parsedUrl.pathname === '/api/scrape' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { targetUrl } = JSON.parse(body);
        const metadata = await scrapeUrl(targetUrl);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(metadata));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // HTML da interface de teste
  const html = `<!DOCTYPE html>
<html lang="pt-BR" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Laboratório de Teste de Links — Biblioteca de Imersão</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    body { background-color: #09090b; color: #fafafa; font-family: 'Plus Jakarta Sans', sans-serif; }
  </style>
</head>
<body class="min-h-screen p-6 sm:p-12">
  <div class="max-w-3xl mx-auto space-y-8">
    
    <div>
      <span class="text-xs font-mono text-purple-400">Teste em Tempo Real</span>
      <h1 class="text-2xl font-bold text-zinc-100 mt-1">Laboratório de Extração de Links</h1>
      <p class="text-xs text-zinc-400 mt-1">
        Cole qualquer link de YouTube, Spotify, Netflix ou blog/site para ver exatamente o que a nossa engine de scrape consegue puxar.
      </p>
    </div>

    <!-- Botões de Exemplo Rápido -->
    <div class="space-y-2">
      <span class="text-xs text-zinc-500 font-medium">Exemplos para testar com 1 clique:</span>
      <div class="flex flex-wrap gap-2 text-xs">
        <button onclick="setAndTest('https://www.youtube.com/watch?v=0kP0s1Z9b88')" class="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300">
          ▶️ YouTube Vídeo
        </button>
        <button onclick="setAndTest('https://open.spotify.com/show/79CkJF3UJTHFV8Dwn390LJ')" class="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300">
          🎙️ Spotify Podcast
        </button>
        <button onclick="setAndTest('https://www.netflix.com/title/70153404')" class="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300">
          🎬 Netflix (Friends)
        </button>
        <button onclick="setAndTest('https://3ears.com')" class="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300">
          🌐 3Ears (Blog/Site)
        </button>
      </div>
    </div>

    <!-- Formulário -->
    <div class="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
      <label class="block text-xs font-medium text-zinc-300">Cole uma URL qualquer:</label>
      <div class="flex gap-2">
        <input id="urlInput" type="url" placeholder="https://..." value="https://www.youtube.com/watch?v=0kP0s1Z9b88" class="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-purple-600">
        <button id="testBtn" onclick="testUrl()" class="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-xs font-semibold rounded-lg text-white transition">
          Extrair dados
        </button>
      </div>
    </div>

    <!-- Feedback / Preview do Card Extraído -->
    <div id="resultContainer" class="hidden space-y-6">
      
      <div>
        <h2 class="text-sm font-semibold text-zinc-200 mb-2">1. Como o Card Ficaria Montado:</h2>
        
        <div id="cardPreview" class="max-w-sm rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
          <!-- Inserido dinamicamente -->
        </div>
      </div>

      <div>
        <h2 class="text-sm font-semibold text-zinc-200 mb-2">2. Dados Brutos Extraídos (JSON):</h2>
        <pre id="rawJson" class="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300 overflow-x-auto"></pre>
      </div>

    </div>

  </div>

  <script>
    function setAndTest(url) {
      document.getElementById('urlInput').value = url;
      testUrl();
    }

    async function testUrl() {
      const url = document.getElementById('urlInput').value.trim();
      if (!url) return;

      const btn = document.getElementById('testBtn');
      btn.innerText = 'Extraindo...';
      btn.disabled = true;

      try {
        const res = await fetch('/api/scrape', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetUrl: url })
        });
        const data = await res.json();
        
        document.getElementById('resultContainer').classList.remove('hidden');
        document.getElementById('rawJson').textContent = JSON.stringify(data, null, 2);

        // Render card preview
        const card = document.getElementById('cardPreview');
        const hasThumb = data.thumbnail && data.thumbnail.startsWith('http');
        
        let thumbHtml = '';
        if (hasThumb) {
          if (data.thumbnailType && data.thumbnailType.includes('1:1')) {
            // Quadrada (Spotify)
            thumbHtml = \`<div class="relative aspect-video w-full bg-zinc-950 flex items-center justify-center p-3">
              <img src="\${data.thumbnail}" class="h-full aspect-square object-cover rounded-lg border border-zinc-800 shadow">
              <span class="absolute top-2.5 right-2.5 text-xs px-2 py-0.5 rounded bg-zinc-950/80 border border-zinc-800 text-emerald-400">\${data.platform}</span>
            </div>\`;
          } else {
            // 16:9 / Normal
            thumbHtml = \`<div class="relative aspect-video w-full bg-zinc-950 overflow-hidden">
              <img src="\${data.thumbnail}" class="w-full h-full object-cover">
              <span class="absolute top-2.5 right-2.5 text-xs px-2 py-0.5 rounded bg-zinc-950/80 border border-zinc-800 text-zinc-200">\${data.platform}</span>
            </div>\`;
          }
        } else {
          thumbHtml = \`<div class="relative aspect-video w-full bg-zinc-950 flex flex-col items-center justify-center p-4 text-center">
            <span class="text-2xl mb-1">🌐</span>
            <span class="text-xs font-mono text-zinc-500">\${data.platform || 'Sem imagem'}</span>
            <span class="absolute top-2.5 right-2.5 text-xs px-2 py-0.5 rounded bg-zinc-950/80 border border-zinc-800 text-zinc-400">\${data.platform}</span>
          </div>\`;
        }

        card.innerHTML = \`
          \${thumbHtml}
          <div class="p-4 space-y-2">
            <h3 class="text-sm font-semibold text-zinc-100 line-clamp-2">\${data.title || '(Sem título detectado)'}</h3>
            \${data.description ? \`<p class="text-xs text-zinc-400 line-clamp-2">\${data.description}</p>\` : ''}
            <div class="pt-2 flex items-center gap-1.5 flex-wrap">
              <span class="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 text-xs">🌱 Iniciante</span>
              <span class="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-xs">Legendas</span>
            </div>
          </div>
        \`;

      } catch (err) {
        alert('Erro ao extrair link: ' + err.message);
      } finally {
        btn.innerText = 'Extrair dados';
        btn.disabled = false;
      }
    }
  </script>
</body>
</html>`;

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
});

const PORT = 3456;
server.listen(PORT, () => {
  console.log(`Servidor de teste de extração rodando em http://localhost:${PORT}`);
});
