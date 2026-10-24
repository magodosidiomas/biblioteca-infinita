const channels = [
  'https://www.youtube.com/@TED',
  'https://www.youtube.com/@RussianProgress',
  'https://www.youtube.com/@EasyFrench'
];

async function testChannels() {
  for (const url of channels) {
    try {
      console.log(`\n--- Testando canal: ${url} ---`);
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
        }
      });
      const html = await res.text();

      // 1. Meta Description / OG Description
      const ogDesc = (html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i) || [])[1] || '';
      const metaDesc = (html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) || [])[1] || '';

      // 2. Avatar oficial do canal
      const avatar = (html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i) || [])[1] || '';

      // 3. Título do canal
      const title = (html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i) || [])[1] || '';

      console.log('Título:', title);
      console.log('Avatar:', avatar);
      console.log('Descrição Oficial do Canal:', ogDesc || metaDesc || '(Vazia)');
    } catch(err) {
      console.error('Erro:', err.message);
    }
  }
}

testChannels();
