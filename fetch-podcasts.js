const fs = require('fs');

const shows = [
  { 
    id: "innerfrench", 
    name: "innerFrench", 
    creator: "Hugo Cotton",
    url: "https://open.spotify.com/show/00h8GrMQbmSAfiNWYPLvhx",
    tags: ["Cultura", "Sociedade"],
    transcriptTag: "Com transcrição",
    paceTag: "Fala pausada",
    desc: "Aprenda francês sem estresse através de temas estimulantes sobre sociedade, filosofia e história, falados em ritmo acessível."
  },
  { 
    id: "transfert", 
    name: "Transfert", 
    creator: "Slate Podcasts",
    url: "https://open.spotify.com/show/3XPodkSe4nnc54Jqs8iiwz",
    tags: ["Histórias reais", "Cotidiano"],
    transcriptTag: "Áudio nativo",
    paceTag: "Fala natural",
    desc: "Histórias íntimas, misteriosas e comoventes contadas na primeira pessoa por pessoas comuns em momentos decisivos de suas vidas."
  },
  { 
    id: "emotions", 
    name: "Émotions", 
    creator: "Louie Media",
    url: "https://open.spotify.com/show/1D9CDBNZLICRUB6Z8i6sO2",
    tags: ["Psicologia", "Sociedade"],
    transcriptTag: "Áudio nativo",
    paceTag: "Fala natural",
    desc: "Uma imersão profunda nos sentimentos humanos com depoimentos autênticos e análises de especialistas em neurociência e sociologia."
  },
  { 
    id: "hugodecrypte", 
    name: "HugoDécrypte - Les Actus du Jour", 
    creator: "Hugo Travers",
    url: "https://open.spotify.com/show/6y1PloEyNsCNJH9vHias4T",
    tags: ["Atualidades", "Mundo"],
    transcriptTag: "Áudio nativo",
    paceTag: "Fala rápida",
    desc: "Resumo diário e dinâmico das principais notícias da França e do mundo em menos de 15 minutos, no ritmo autêntico dos jovens franceses."
  },
  { 
    id: "choses_a_savoir", 
    name: "Choses à Savoir", 
    creator: "Louis-Guillaume Kan-Lacas",
    url: "https://open.spotify.com/show/3AL8eKPHOUINc6usVSbRo3",
    tags: ["Curiosidades", "Ciência"],
    transcriptTag: "Áudio nativo",
    paceTag: "Fala natural",
    desc: "Pílulas diárias de cultura geral e curiosidades científicas explicadas de forma concisa e didática em 3 minutos."
  },
  { 
    id: "heure_du_monde", 
    name: "L'Heure du Monde", 
    creator: "Le Monde",
    url: "https://open.spotify.com/show/2ceI3IzPwHJywfQTAtrQSI",
    tags: ["Jornalismo", "Investigação"],
    transcriptTag: "Áudio nativo",
    paceTag: "Fala natural",
    desc: "O podcast diário de grande reportagem do jornal Le Monde. Uma imersão profunda de 20 minutos no grande tema do dia."
  }
];

async function fetchMetadata() {
  for (const show of shows) {
    try {
      const res = await fetch(`https://open.spotify.com/oembed?url=${show.url}`);
      const data = await res.json();
      show.avatar = data.thumbnail_url;
      console.log(`Fetched metadata for ${show.name}:`, data.thumbnail_url);
    } catch (e) {
      console.error(`Failed ${show.name}:`, e.message);
    }
  }
  fs.writeFileSync('podcasts-data.json', JSON.stringify(shows, null, 2), 'utf-8');
  console.log('Saved podcasts-data.json successfully!');
}

fetchMetadata();
