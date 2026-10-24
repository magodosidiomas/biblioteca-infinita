const fs = require('fs');

function decodeHtml(html) {
  if (!html) return '';
  return html
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

let siteCuratedData = {};
try { siteCuratedData = JSON.parse(fs.readFileSync('sites-curated-data.json', 'utf8')); } catch (e) {}

const contentData = JSON.parse(fs.readFileSync('app/src/data/content.json', 'utf8'));

const allSites = [];
Object.entries(contentData).forEach(([lang, formats]) => {
  if (formats.Sites) {
    formats.Sites.forEach(s => {
      allSites.push({ lang, name: s.name, url: s.url });
    });
  }
});

console.log(`Processing SEO & curation for ${allSites.length} sites...`);

// Curated fallbacks for specific known language resources
const CURATED_SITES = {
  'GLOSS - Global Language Online Support System': 'Defense Language Institute portal providing hundreds of authentic reading and listening immersion lessons across proficiency levels 1 to 3.',
  'Daily Newsletter - News in French': 'A daily morning newsletter delivering French news summaries, vocabulary notes, and idioms straight to your inbox.',
  'Français de nos regions': 'Linguistic exploration and maps documenting lexical variations, regional accents, and expressions across France, Belgium, and Switzerland.',
  'Reddit /francais': 'Community forum for intermediate and advanced discussions in French covering culture, news, and everyday language practice.',
  'Learn French': 'Subreddit dedicated to French learning questions, grammar clarifications, listening practice, and resource recommendations.',
  'Pursuit of Wonder': 'Engaging animated video essays and philosophical explorations exploring psychology, existentialism, and human nature.',
  'Deutschkurse DW': 'Comprehensive interactive German courses from Deutsche Welle covering levels A1 through C1 with audio dialogues and vocabulary exercises.',
  'Betonung | Der Wortakzent im Deutschen (Grundlagen)': 'In-depth phonetic guide explaining syllable stress patterns, word accents, and correct pronunciation rules in German.',
  'pausensprueche': 'Daily German idioms, inspirational quotes, and natural expressions curated for daily immersion on Instagram.',
  'Let\'s go german online': 'Bite-sized grammar breakdowns, everyday conversational phrases, and pronunciation clips for German learners.',
  'Rio aufdeutsch': 'Cultural insights and language mentoring comparing Brazilian and German cultures through bilingual explanations.',
  'WALULIUS': 'Satirical comedy sketches and television media commentary breaking down current cultural trends and pop news.',
  'Der Postillon (Notícias falsas)': 'Germany\'s most famous satirical news portal, publishing sharp parodies of daily politics and media culture.',
  'Deutsch mit benjamin C1/C2': 'Advanced German coaching specializing in C1/C2 vocabulary, natural speech connectors, and nuanced speaking skills.',
  'German with didi': 'Fun, clear explanations of German grammar quirks, vocabulary distinctions, and everyday colloquialisms.',
  'LerneDeutsch': 'Short educational reels demonstrating German pronunciation, false friends, and practical vocabulary.',
  'Alemaocommuryel': 'German mentoring designed for Portuguese speakers, clarifying difficult cases, prepositions, and verb conjugation.',
  'Particles - Forms and Examples | German Grammar | Simple Explanations': 'Clear breakdown of German modal particles (doch, mal, ja, halt, eben) with real conversation examples and audio.',
  'A Mi Aire (LingQ)': 'Conversational Spanish podcast and reading course featuring natural conversations about everyday life and current events.',
  'Mini-Videos for Learners of Intermediate Russian': 'Cornell University collection of authentic mini-video clips recorded with native speakers for listening comprehension.',
  'The Russian Learning Journey: tips, truths, myths, mistakes to avoid, apps and resources': 'Comprehensive master guide and roadmap for self-directed Russian immersion created by experienced polyglots.',
  'Study Russian Online - Phonetics': 'Interactive audio phonetics course covering Russian vowels, hard/soft consonants, and reduction rules.',
  'Mezhdu Nami Interactive Textbook': 'Free open-source interactive textbook designed for beginners with modular dialogue units and native audio recordings.',
  'Cortina Language Course': 'Classic audio-lingual immersion method with recorded native dialogues and sentence pattern drills.',
  'Explore Russian - Learning with Films': 'Step-by-step guides and vocabulary notes for learning authentic spoken Russian through cinema and popular movies.',
  'Learn Russian RT': 'Interactive multimedia portal by RT featuring grammar tables, phonetic exercises, dialogues, and cultural features.',
  'Gratis Global: Russian': 'Curated mega-directory of the finest free resources, news broadcasts, podcasts, and immersion tools for Russian learners.',
  'Simplang Russian Course': 'Structured beginner grammar and reading course with simplified vocabulary lists and grammar cheat-sheets.',
  'Lora\'s Dialogs': 'Cornell University graded Russian listening lessons featuring everyday dialogues with transcripts and English translations.',
  'Where to Find Helpful Content in Japanese for Beginners | LingQ Blog': 'Curated guide highlighting beginner-friendly Japanese materials, graded readers, anime, and podcasts.',
  'Learn Japanese From Scratch: The Ultimate Guide For Beginners': 'Comprehensive immersion guide outlining how to conquer Hiragana, Katakana, Kanji, and natural listening.',
  'Learn Japanese: A Ridiculously Detailed Guide': 'Tofugu\'s famous definitive roadmap breaking down step-by-step Japanese acquisition from zero to fluency.',
  'Japanese Pronunciation Guide': 'Deep dive into pitch accent, vowel length, and sound production nuances in standard Tokyo Japanese.',
  'How to Type in Japanese': 'Comprehensive guide explaining IME setup and keystrokes for typing Hiragana, Katakana, and Kanji on modern devices.',
  'LEARN HIRAGANA: THE ULTIMATE GUIDE': 'Tofugu\'s mnemonic-based visual guide to learning and mastering all 46 Hiragana characters in record time.',
  'How to Install a Japanese Keyboard': 'Step-by-step walkthrough for configuring Japanese input systems on Windows, macOS, iOS, and Android.',
  'Collection of Resources from Refold https://refold.la/': 'Curated master document cataloging Japanese comprehension material, Anki decks, and immersion channels.',
  'Best Resources for Learning BR Portuguese': 'Comprehensive directory of podcasts, YouTube channels, and literature for learning authentic Brazilian Portuguese.',
  'Guia completo sobre o Ucraniano': 'In-depth polyglot forum guide detailing Ukrainian alphabet, case systems, audio resources, and grammar nuances.',
  '(💸 Pago) 100 Easy Ukrainian Texts: with vocabulary and online audio (for beginners) (Ukrainian Language Learning With Audio Book 2) (English Edition)': 'Graded reader collection of 100 short Ukrainian stories with parallel vocabulary and professional native audio.',
  '100 Easy Ukrainian Texts: Audio': 'Accompanying SoundCloud audio tracks for graded Ukrainian reading stories, read clearly by native speakers.',
  'The world\'s best way to learn Ukrainian - Duolingo': 'Interactive gamified Ukrainian learning path covering the Cyrillic alphabet, core vocabulary, and sentence structures.',
  'Read Ukrainian!': 'University of Cambridge open-access reading course for developing intermediate reading proficiency in Ukrainian.',
  '40 Excellent Arabic Listening Resources In All Dialects': 'Extensive guide to listening immersion in Modern Standard Arabic as well as Egyptian, Levantine, and Maghrebi dialects.',
  'All the Arabic you didn\'t learn the first time around': 'Comprehensive online reference textbook clarifying Arabic grammar, verb forms, and sentence structures.',
  'Al Jazeera - Learning Arabic': 'Al Jazeera\'s dedicated educational portal featuring simplified news reports, vocabulary quizzes, and video lessons.',
  'Rocket Arabic (Paid Resource 💸)': 'Comprehensive interactive audio-based course for learning Egyptian and Modern Standard Arabic with speech recognition.',
  'Listen to Arabic (Resource List)': 'Carefully curated index of authentic radio broadcasts, music, and spoken content across the Arab world.',
  'Cornelia - Read by Dwane Thoma': 'Graded classical Latin novella following a Roman girl, recorded with expressive restored classical pronunciation.',
  'Ora Maritima': 'Classic 19th-century graded Latin reader telling historical tales of early Britain with gradual grammatical progression.',
  'Online Latin Content Suitable for Extensive Reading and Listening': 'Crowdsourced repository of comprehensible Latin audiobooks, YouTube channels, novellas, and podcasts.',
  'Teach yourself Latin': 'Practical guide and syllabus for mastering Latin through extensive comprehensible input and reading.',
  'Thesaurus Anbrutalis': 'Exhaustive thematic compendium of spoken and colloquial Latin idioms, modern vocabulary, and conversation topics.',
  'GREEK AND LATIN TEXTS WITH FACING VOCABULARY AND COMMENTARY': 'Geoffrey Steadman\'s acclaimed open textbooks offering classical Latin texts with line-by-line vocabulary keys.',
  'Latin Listening Project': 'Archive of unscripted spoken Latin conversations between polyglots discussing contemporary life and history.',
  'Latinum Institute': 'Audio-based Latin immersion course using the classic Adler and Ollendorff progressive question-and-answer method.',
  'ΛΟΓΕΙΟΝ - Logeion (Greek and Latin Dictionary)': 'University of Chicago comprehensive digital dictionary compiling Lewis & Short, Gaffiot, and classical lexicons.',
  'Cercle Latin de La Nouvelle-France': 'Digital library and wiki offering digitized beginner readers, novellas, and spoken Latin educational audio.',
  'Introduction to Classical Latin': 'Open University free introductory course teaching core Latin nominal and verbal structures through historical inscriptions.',
  'Reading Material In Latin': 'Curated directory of public-domain Latin novellas, fables, and intermediate continuous reading texts.',
  'Latinium': 'Latinitium\'s rich portal of spoken Latin audio stories, animated fables, and video essays on Roman literature.',
  'Alpheios': 'Browser reading tool that provides instant inflection breakdown and dictionary lookups for any classical Latin text.',
  'Latin Teacher Toolbox': 'Resource database for Latin educators featuring comprehensible input stories, lesson plans, and classroom prompts.',
  'Linguam latinam discimus - Lateinisches Übungsbuch - Latin Primer': 'LingQ interactive Latin course with sentence-by-sentence audio and translation lookups.',
  'Audiolibri- Lectio scriptorum classicorum': 'Accademia Vivarium Novum professional audio recordings of classical Latin poetry, prose, and philosophy.',
  'Latin Dictionaries (4 Compiled)': 'Latinitium fast multi-dictionary search engine querying Lewis & Short, Georges, and Smith\'s English-Latin dictionary.'
};

async function fetchSiteSEO(site) {
  if (CURATED_SITES[site.name]) {
    return { desc: CURATED_SITES[site.name] };
  }

  if (site.url && site.url.startsWith('http')) {
    try {
      const res = await fetch(site.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9,pt;q=0.8,fr;q=0.8,de;q=0.8,es;q=0.8'
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(6000)
      });
      const html = await res.text();
      const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i);
      const metaDesc = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
      const twitterDesc = html.match(/<meta[^>]*name=["']twitter:description["'][^>]*content=["']([^"']*)["']/i);
      const ogImg = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i);

      let desc = (ogDesc && ogDesc[1]) || (metaDesc && metaDesc[1]) || (twitterDesc && twitterDesc[1]) || '';
      let img = ogImg && ogImg[1] ? ogImg[1].replace(/&amp;/g, '&') : null;

      if (desc && desc.length > 20) {
        return { desc: decodeHtml(desc).slice(0, 260), avatar: img };
      }
    } catch(e) {}
  }

  return null;
}

async function run() {
  for (const s of allSites) {
    const result = await fetchSiteSEO(s);
    if (result && result.desc) {
      siteCuratedData[s.name] = result;
      console.log(`[Site Curated] ${s.name} -> ${result.desc.slice(0, 80)}...`);
    }
  }

  fs.writeFileSync('sites-curated-data.json', JSON.stringify(siteCuratedData, null, 2), 'utf8');
  console.log('Saved sites-curated-data.json!');
}

run();
