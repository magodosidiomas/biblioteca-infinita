const fs = require('fs');

const contentData = JSON.parse(fs.readFileSync('app/src/data/content.json', 'utf8'));

// Build list of unique channels
const channelMap = new Map();

Object.entries(contentData).forEach(([lang, data]) => {
  if (data.YouTube) {
    data.YouTube.forEach(ch => {
      if (ch.url && (ch.url.includes('youtube.com') || ch.url.includes('youtu.be'))) {
        if (!channelMap.has(ch.url)) {
          channelMap.set(ch.url, {
            name: ch.name,
            url: ch.url,
            avatar: ch.avatar
          });
        }
      }
    });
  }
});

const list = Array.from(channelMap.values());
console.log(`Starting avatar fetch for ${list.length} channels...`);

let realAvatars = {};
try {
  realAvatars = JSON.parse(fs.readFileSync('real-avatars.json', 'utf8'));
} catch (e) {}

// Normalize YouTube URL for fetching
function getFetchUrls(url) {
  const urls = [url];
  // If it's a /c/Name, also try /@Name
  const cMatch = url.match(/youtube\.com\/c\/([^\/?#]+)/i);
  if (cMatch) {
    urls.push(`https://www.youtube.com/@${cMatch[1]}`);
  }
  // If it has /videos or /featured or /playlists at the end, also try root
  const root = url.replace(/\/(videos|featured|playlists|search)\/?.*$/i, '');
  if (root !== url) {
    urls.push(root);
    const cMatch2 = root.match(/youtube\.com\/c\/([^\/?#]+)/i);
    if (cMatch2) {
      urls.push(`https://www.youtube.com/@${cMatch2[1]}`);
    }
  }
  return [...new Set(urls)];
}

async function fetchAvatarForChannel(ch) {
  // If we already have a real avatar cached, return it
  if (realAvatars[ch.url] && !realAvatars[ch.url].includes('google.com/s2/favicons')) {
    return realAvatars[ch.url];
  }

  const tryUrls = getFetchUrls(ch.url);

  for (const targetUrl of tryUrls) {
    try {
      const res = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(6000)
      });

      const html = await res.text();
      const ogMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i);
      if (ogMatch && ogMatch[1] && !ogMatch[1].includes('favicon')) {
        return ogMatch[1].replace(/&amp;/g, '&');
      }

      // Secondary check: yt3.googleusercontent.com
      const yt3Match = html.match(/(https:\/\/yt3\.googleusercontent\.com\/[a-zA-Z0-9_\-=]+)/);
      if (yt3Match && yt3Match[1]) {
        return yt3Match[1];
      }
    } catch (e) {
      // Continue to next URL candidate
    }
  }

  // If it's a specific video URL, fallback to YouTube video thumbnail
  const vMatch = ch.url.match(/(?:watch\?v=|\/embed\/|\.be\/)([a-zA-Z0-9_-]{11})/);
  if (vMatch) {
    return `https://i.ytimg.com/vi/${vMatch[1]}/hqdefault.jpg`;
  }

  return null;
}

// Concurrency pool
async function runPool(items, limit = 8) {
  let index = 0;
  let successCount = 0;
  let failCount = 0;

  async function worker() {
    while (index < items.length) {
      const current = items[index++];
      try {
        const avatar = await fetchAvatarForChannel(current);
        if (avatar) {
          realAvatars[current.url] = avatar;
          successCount++;
          if (successCount % 20 === 0 || index === items.length) {
            console.log(`[${index}/${items.length}] Fetched avatar for: ${current.name} -> ${avatar.slice(0, 50)}...`);
            fs.writeFileSync('real-avatars.json', JSON.stringify(realAvatars, null, 2), 'utf8');
          }
        } else {
          failCount++;
        }
      } catch (e) {
        failCount++;
      }
    }
  }

  const workers = Array.from({ length: limit }, () => worker());
  await Promise.all(workers);

  // Final save
  fs.writeFileSync('real-avatars.json', JSON.stringify(realAvatars, null, 2), 'utf8');
  console.log(`\nCompleted! Found ${successCount} avatars. Failed/Not found: ${failCount}.`);
}

runPool(list, 10).then(() => {
  // Now apply avatars to app/src/data/content.json
  const updatedContent = JSON.parse(fs.readFileSync('app/src/data/content.json', 'utf8'));
  let updatedCount = 0;

  Object.values(updatedContent).forEach(lang => {
    if (lang.YouTube) {
      lang.YouTube.forEach(ch => {
        if (realAvatars[ch.url]) {
          ch.avatar = realAvatars[ch.url];
          updatedCount++;
        }
      });
    }
  });

  fs.writeFileSync('app/src/data/content.json', JSON.stringify(updatedContent, null, 2), 'utf8');
  console.log(`Updated ${updatedCount} channel entries in app/src/data/content.json!`);
});
