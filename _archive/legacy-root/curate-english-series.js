const fs = require('fs');
const https = require('https');

const data = JSON.parse(fs.readFileSync('app/src/data/content.json', 'utf8'));
const en = data['english'];
let cache = {};
try {
  cache = JSON.parse(fs.readFileSync('cache-series.json', 'utf8'));
} catch(e) {}

// Curated Netflix Title IDs & search queries
const seriesMetadata = {
  'Modern Family': {
    netflixUrl: 'https://www.netflix.com/title/70143860',
    desc: 'Três famílias contemporâneas diferentes em Los Angeles enfrentam as alegrias, confusões e desafios do cotidiano familiar.',
    genres: ['Comédia', 'Família']
  },
  'Sherlock Holmes BBC': {
    netflixUrl: 'https://www.netflix.com/title/70202589',
    desc: 'Uma adaptação moderna das clássicas histórias de detetive de Sir Arthur Conan Doyle, ambientada na Londres contemporânea.',
    genres: ['Drama', 'Crime & Suspense']
  },
  'Carmen Sandiego': {
    netflixUrl: 'https://www.netflix.com/title/80167821',
    desc: 'Uma ladra talentosa usa suas habilidades pelo bem ao redor do globo enquanto revela seu próprio passado.',
    genres: ['Animação', 'Ação & Aventura']
  },
  'Explained: Our Brain/Mind': {
    netflixUrl: 'https://www.netflix.com/title/80218134',
    desc: 'Documentário dinâmico que investiga o funcionamento da mente humana, memórias, sonhos, ansiedade e foco.',
    genres: ['Documentário', 'Ciência']
  },
  'Jurassic World: New Adventures': {
    netflixUrl: 'https://www.netflix.com/title/81005126',
    desc: 'Seis adolescentes presos em um acampamento na Ilha Nublar precisam se unir para sobreviver à fuga dos dinossauros.',
    genres: ['Animação', 'Ação & Aventura']
  },
  'We Bare Bears': {
    netflixUrl: 'https://www.netflix.com/title/80081155',
    desc: 'Três irmãos ursos — Pardo, Panda e Polar — tentam desajeitadamente se integrar à sociedade humana contemporânea.',
    genres: ['Comédia', 'Animação']
  },
  'Disenchantment': {
    netflixUrl: 'https://www.netflix.com/title/80095603',
    desc: 'As desventuras da princesa rebelde Bean, de seu companheiro Elfo e do demônio Luci no reino medieval de Dreamland.',
    genres: ['Comédia', 'Fantasia']
  },
  'DC Titans': {
    netflixUrl: 'https://www.netflix.com/title/80218200',
    desc: 'Jovens heróis de todo o universo DC se reúnem sob a liderança de Dick Grayson contra forças sombrias.',
    genres: ['Ação & Aventura', 'Fantasia']
  },
  'The Crown': {
    netflixUrl: 'https://www.netflix.com/title/80025678',
    desc: 'Dramatização biográfica da vida da Rainha Elizabeth II, rivalidades políticas e eventos que moldaram o século XX.',
    genres: ['Drama', 'História']
  },
  'Cobra Kai': {
    netflixUrl: 'https://www.netflix.com/title/81002370',
    desc: 'Décadas após o torneio de Karatê de 1984, a rivalidade histórica entre Daniel LaRusso e Johnny Lawrence renasce.',
    genres: ['Ação & Aventura', 'Comédia']
  },
  'Warrior Nun': {
    netflixUrl: 'https://www.netflix.com/title/80242724',
    desc: 'Uma jovem acorda em um necrotério com poderes inexplicáveis e se vê em meio a uma antiga guerra contra demônios.',
    genres: ['Ação & Aventura', 'Fantasia']
  },
  "The Queen's Gambit": {
    netflixUrl: 'https://www.netflix.com/title/80234304',
    desc: 'Uma órfã prodígio do xadrez luta contra o vício enquanto busca se tornar a maior jogadora do mundo na era da Guerra Fria.',
    genres: ['Drama']
  },
  'Umbrella Academy': {
    netflixUrl: 'https://www.netflix.com/title/80186863',
    desc: 'Irmãos adotivos extraordinários com superpoderes se reúnem após a morte do pai para impedir um apocalipse iminente.',
    genres: ['Ação & Aventura', 'Ficção Científica']
  },
  'Atypical': {
    netflixUrl: 'https://www.netflix.com/title/80117540',
    desc: 'Sam, um garoto de 18 anos no espectro autista, decide que é hora de começar a namorar e buscar sua independência.',
    genres: ['Comédia', 'Drama']
  },
  'Star Trek Discovery': {
    netflixUrl: 'https://www.netflix.com/title/80126024',
    desc: 'Quase um século antes dos eventos de Kirk e Spock, a Frota Estelar explora novos mundos e civilizações.',
    genres: ['Ficção Científica', 'Ação & Aventura']
  },
  'Avatar: The Legend of Korra': {
    netflixUrl: 'https://www.netflix.com/title/80027957',
    desc: 'A nova Avatar Korra precisa dominar os quatro elementos e proteger a metrópole Cidade República de novas ameaças.',
    genres: ['Animação', 'Ação & Aventura', 'Fantasia']
  },
  'Community': {
    netflixUrl: 'https://www.netflix.com/title/70155589',
    desc: 'Um advogado com diploma suspenso é forçado a frequentar uma faculdade comunitária e monta um excêntrico grupo de estudos.',
    genres: ['Comédia']
  },
  'Avatar: The Legend of Aang': {
    netflixUrl: 'https://www.netflix.com/title/70142405',
    desc: 'Aang, o último dominador de ar, embarca em uma jornada épica pelo mundo para dominar os quatro elementos e trazer a paz.',
    genres: ['Animação', 'Ação & Aventura', 'Fantasia']
  },
  'The Good Place': {
    netflixUrl: 'https://www.netflix.com/title/80113701',
    desc: 'Após morrer, uma mulher egocêntrica vai parar por engano no "Bom Lugar" e tenta desesperadamente se tornar uma pessoa boa.',
    genres: ['Comédia', 'Fantasia']
  },
  'Peaky Blinders': {
    netflixUrl: 'https://www.netflix.com/title/80002479',
    desc: 'A ascensão implacável da gangue de Thomas Shelby nas ruas sujas e violentas da Birmingham pós-Primeira Guerra.',
    genres: ['Drama', 'Crime & Suspense']
  },
  'Lost in Space': {
    netflixUrl: 'https://www.netflix.com/title/80104198',
    desc: 'A família Robinson sai em busca de um novo planeta para viver, mas sofre um acidente e fica presa em um ambiente hostil.',
    genres: ['Ficção Científica', 'Ação & Aventura']
  },
  'Spongebob Squarepants': {
    netflixUrl: 'https://www.netflix.com/title/70153369',
    desc: 'As hilárias aventuras subaquáticas de Bob Esponja Calça Quadrada e seus amigos na Fenda do Biquíni.',
    genres: ['Comédia', 'Animação']
  },
  'Star Trek: Deep Space Nine': {
    netflixUrl: 'https://www.netflix.com/title/70158329',
    desc: 'O comandante Sisko administra uma estação espacial estratégica próxima a uma fenda espacial estável.',
    genres: ['Ficção Científica', 'Drama']
  },
  'Rick and Morty': {
    netflixUrl: 'https://www.netflix.com/title/80014749',
    desc: 'O cientista genial e sociopata Rick arrasta seu neto tímido Morty em aventuras interdimensionais surreais e perigosas.',
    genres: ['Animação', 'Comédia', 'Ficção Científica']
  },
  'Breaking Bad': {
    netflixUrl: 'https://www.netflix.com/title/70143836',
    desc: 'Um professor de química diagnosticado com câncer terminal passa a fabricar metanfetamina para garantir o futuro da família.',
    genres: ['Drama', 'Crime & Suspense']
  },
  'Stranger Things': {
    netflixUrl: 'https://www.netflix.com/title/80057281',
    desc: 'O desaparecimento de um garoto leva uma pequena cidade a desvendar segredos governamentais e forças sobrenaturais.',
    genres: ['Ficção Científica', 'Terror', 'Drama']
  },
  'Trollhunters: Tales of Arcadia': {
    netflixUrl: 'https://www.netflix.com/title/80073207',
    desc: 'Um adolescente comum encontra um amuleto mágico e descobre uma civilização secreta de trolls vivendo sob sua cidade.',
    genres: ['Animação', 'Fantasia', 'Ação & Aventura']
  },
  'Wizards - Tales from Arcadia': {
    netflixUrl: 'https://www.netflix.com/title/81005881',
    desc: 'O aprendiz de Merlin é transportado para a Camelot medieval em uma batalha mágica pelo controle de Arcádia.',
    genres: ['Animação', 'Fantasia']
  },
  '3 Below: Tales from Arcadia': {
    netflixUrl: 'https://www.netflix.com/title/80221348',
    desc: 'Dois irmãos da realeza alienígena fogem de seu planeta natal e precisam se disfarçar de adolescentes na Terra.',
    genres: ['Animação', 'Ficção Científica']
  },
  'Brooklyn Nine-Nine': {
    netflixUrl: 'https://www.netflix.com/title/70281561',
    desc: 'O talentoso e imaturo detetive Jake Peralta entra em conflito e ganha o respeito do novo e rígido capitão da 99ª delegacia.',
    genres: ['Comédia']
  }
};

en.Séries.forEach(s => {
  const meta = seriesMetadata[s.name];
  if (meta) {
    s.url = meta.netflixUrl;
    s.desc = meta.desc;
    s.tags = Array.from(new Set(['Áudio Original', ...meta.genres]));
  }
});

fs.writeFileSync('app/src/data/content.json', JSON.stringify(data, null, 2), 'utf8');

console.log('--- ATUALIZAÇÃO COMPLETA DAS SÉRIES EM INGLÊS ---');
en.Séries.forEach((s, idx) => {
  console.log(`${idx + 1}. ${s.name}`);
  console.log(`   URL: ${s.url}`);
  console.log(`   Desc: ${s.desc}`);
  console.log(`   Tags: ${s.tags.join(', ')}\n`);
});
