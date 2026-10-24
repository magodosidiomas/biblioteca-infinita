const fs = require('fs');

async function testSiteScrape(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7'
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(8000)
    });
    const html = await res.text();
    const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i);
    const metaDesc = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
    const twitterDesc = html.match(/<meta[^>]*name=["']twitter:description["'][^>]*content=["']([^"']*)["']/i);
    const ogImg = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i);
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);

    console.log(`\n=== URL: ${url} ===`);
    console.log('Title:       ', titleMatch ? titleMatch[1].trim() : 'NONE');
    console.log('og:desc:     ', ogDesc ? ogDesc[1].slice(0, 150) : 'NONE');
    console.log('meta:desc:   ', metaDesc ? metaDesc[1].slice(0, 150) : 'NONE');
    console.log('twitter:desc:', twitterDesc ? twitterDesc[1].slice(0, 150) : 'NONE');
    console.log('og:img:      ', ogImg ? ogImg[1].slice(0, 100) : 'NONE');
  } catch (e) {
    console.log(`Error ${url}:`, e.message);
  }
}

async function run() {
  await testSiteScrape('https://gloss.dliflc.edu/');
  await testSiteScrape('https://newsinfrench.org/daily-newsletter/');
  await testSiteScrape('https://francaisdenosregions.com/');
  await testSiteScrape('https://www.dw.com/de/deutsch-lernen/deutschkurse/s-2068');
}

run();
