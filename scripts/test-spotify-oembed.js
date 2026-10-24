const fs = require('fs');

async function testGooglePodcasts(url) {
  try {
    const res = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`);
    if (res.ok) {
      const data = await res.json();
      console.log('Spotify oEmbed for', url, ':', data);
    } else {
      console.log('Spotify oEmbed status:', res.status);
    }
  } catch(e) {
    console.error(e.message);
  }
}

testGooglePodcasts('https://open.spotify.com/show/4rOoJ6Egrf8K2IrywzwOMk');
