const fs = require('fs');

const data = JSON.parse(fs.readFileSync('app/src/data/content.json', 'utf8'));
const fr = data['french'];

// 1. Curar e expandir Séries Francesas (Originals + Dubladas icônicas na Netflix)
// Produções nativas francesas aclamadas na Netflix:
const frenchSeriesCurated = [
  {
    name: 'Lupin',
    url: 'https://www.netflix.com/title/80994082',
    tags: ['Áudio Original', 'Mistério', 'Crime & Suspense', 'Ação & Aventura'],
    platformTag: 'Netflix',
    levelTag: 'B1-B2',
    paceTag: 'Fala natural',
    avatar: 'https://static.tvmaze.com/uploads/images/original_untouched/289/724905.jpg',
    desc: 'Inspirado pelas aventuras de Arsène Lupin, o ladrão cavalheiro Assane Diop busca vingar o pai por uma injustiça cometida por uma família rica.'
  },
  {
    name: 'Dix pour cent (Call My Agent!)',
    url: 'https://www.netflix.com/title/80133335',
    tags: ['Áudio Original', 'Comédia', 'Drama'],
    platformTag: 'Netflix',
    levelTag: 'B2-C1',
    paceTag: 'Fala rápida',
    avatar: 'https://static.tvmaze.com/uploads/images/original_untouched/26/66432.jpg',
    desc: 'Em uma prestigiada agência de talentos em Paris, quatro agentes se desdobram para manter clientes famosos felizes e os negócios de pé.'
  },
  {
    name: 'A Very Secret Service (Au service de la France)',
    url: 'https://www.netflix.com/title/80097771',
    tags: ['Áudio Original', 'Comédia', 'História'],
    platformTag: 'Netflix',
    levelTag: 'B1-B2',
    paceTag: 'Fala natural',
    avatar: 'https://static.tvmaze.com/uploads/images/original_untouched/67/169947.jpg',
    desc: 'Em plena Guerra Fria de 1960, um jovem recruta ingressa no serviço de inteligência francês e descobre que a burocracia é sua maior rival.'
  },
  {
    name: 'La Trêve (The Break)',
    url: 'https://www.netflix.com/title/80134910',
    tags: ['Áudio Original', 'Crime & Suspense', 'Drama'],
    platformTag: 'Netflix',
    levelTag: 'B1-B2',
    paceTag: 'Fala natural',
    avatar: 'https://static.tvmaze.com/uploads/images/original_untouched/92/231128.jpg',
    desc: 'Um detetive de polícia traumatizado volta para sua pacata cidade natal na Bélgica, onde o assassinato de um jogador de futebol revela segredos sombrios.'
  },
  {
    name: 'Marianne',
    url: 'https://www.netflix.com/title/80217779',
    tags: ['Áudio Original', 'Terror', 'Suspense'],
    platformTag: 'Netflix',
    levelTag: 'B1-B2',
    paceTag: 'Fala natural',
    avatar: 'https://static.tvmaze.com/uploads/images/original_untouched/209/523621.jpg',
    desc: 'Uma romancista famosa descobre que a bruxa demoníaca que assombra seus pesadelos e seus livros está viva e aterrorizando sua cidade natal.'
  },
  {
    name: 'Zone Blanche (Black Spot)',
    url: 'https://www.netflix.com/title/81079044',
    tags: ['Áudio Original', 'Mistério', 'Ficção Científica', 'Crime & Suspense'],
    platformTag: 'Netflix',
    levelTag: 'B1-B2',
    paceTag: 'Fala natural',
    avatar: 'https://static.tvmaze.com/uploads/images/original_untouched/108/271065.jpg',
    desc: 'Uma major de polícia e um promotor investigam uma série de crimes brutais em uma cidade isolada cercada por uma floresta misteriosa.'
  },
  {
    name: 'Plan Cœur (The Hook Up Plan)',
    url: 'https://www.netflix.com/title/80190086',
    tags: ['Áudio Original', 'Comédia', 'Romance'],
    platformTag: 'Netflix',
    levelTag: 'B1-B2',
    paceTag: 'Fala natural',
    avatar: 'https://static.tvmaze.com/uploads/images/original_untouched/387/968964.jpg',
    desc: 'Amigas parisienses contratam secretamente um acompanhante para ajudar a eterna solteira Elsa a recuperar sua autoconfiança no amor.'
  },
  {
    name: 'Family Business',
    url: 'https://www.netflix.com/title/81010818',
    tags: ['Áudio Original', 'Comédia'],
    platformTag: 'Netflix',
    levelTag: 'B1-B2',
    paceTag: 'Fala natural',
    avatar: 'https://static.tvmaze.com/uploads/images/original_untouched/200/501254.jpg',
    desc: 'Ao descobrir que a maconha será legalizada na França, um jovem convence sua família a transformar o açougue tradicional em uma "coffeeshop".'
  },
  {
    name: 'Into the Night',
    url: 'https://www.netflix.com/title/81008221',
    tags: ['Áudio Original', 'Ficção Científica', 'Suspense'],
    platformTag: 'Netflix',
    levelTag: 'B1-B2',
    paceTag: 'Fala natural',
    avatar: 'https://static.tvmaze.com/uploads/images/original_untouched/257/644938.jpg',
    desc: 'Passageiros de um voo noturno sequestrado correm contra o relógio para escapar dos raios fatais de um evento solar repentino.'
  },
  {
    name: 'Mortel',
    url: 'https://www.netflix.com/title/80241539',
    tags: ['Áudio Original', 'Fantasia', 'Drama', 'Adolescente'],
    platformTag: 'Netflix',
    levelTag: 'B1-B2',
    paceTag: 'Gírias & Juventude',
    avatar: 'https://static.tvmaze.com/uploads/images/original_untouched/220/551090.jpg',
    desc: 'Dois estudantes do ensino médio fazem um pacto com uma entidade vodu para obter poderes extraordinários e solucionar um desaparecimento.'
  }
];

fr.Séries = frenchSeriesCurated;

// 2. Curar Podcasts de Francês
// Substituir NHK em inglês por podcasts autênticos de francês:
const curatedPodcasts = [
  {
    id: 'innerfrench_podcast',
    name: 'InnerFrench Podcast',
    url: 'https://innerfrench.com/podcast/',
    tags: ['Aprendizado de Idiomas', 'Cultura', 'Sociedade'],
    paceTag: 'Fala intermediária',
    avatar: 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts126/v4/5f/4b/51/5f4b5121-b307-4b0c-4ba9-3fba7aba161d/mza_1141892237621262066.jpg/600x600bb.jpg',
    desc: 'Hugo Cotton fala sobre sociedade, psicologia e cultura em um francês claro e envolvente, perfeito para intermediários (B1-B2).',
    transcriptTag: 'Com transcrição',
    creator: 'Hugo Cotton'
  },
  {
    id: 'rfi_francais_facile',
    name: 'RFI - Journal en Français Facile',
    url: 'https://savoirs.rfi.fr/fr/apprendre-enseigner/langue-francaise/journal-en-francais-facile',
    tags: ['Notícias', 'Geopolítica'],
    paceTag: 'Fala moderada',
    avatar: 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts116/v4/74/18/13/741813fb-4590-7f98-9723-6129532d5402/mza_12541061958878865421.png/600x600bb.jpg',
    desc: 'Noticiário diário com os principais acontecimentos do mundo apresentados com vocabulário acessível e transcrição completa.',
    transcriptTag: 'Com transcrição',
    creator: 'Radio France Internationale'
  },
  {
    id: 'one_thing_in_a_french_day',
    name: 'One Thing in A French Day',
    url: 'http://onethinginafrenchday.podbean.com/',
    tags: ['Cotidiano', 'Cultura'],
    paceTag: 'Fala natural',
    avatar: 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts125/v4/8d/f3/d3/8df3d3cf-5a02-5c4d-f63b-6979685e1388/mza_6435012224536294719.jpg/600x600bb.jpg',
    desc: 'Um pequeno pedaço do cotidiano francês contado três vezes por semana por Laetitia diretamente da região parisiense.',
    transcriptTag: 'Com áudio',
    creator: 'Laetitia'
  },
  {
    id: 'france_bienvenue',
    name: 'France Bienvenue',
    url: 'https://francebienvenue1.fr/',
    tags: ['Diálogos', 'Conversação'],
    paceTag: 'Fala natural',
    avatar: 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts113/v4/a4/09/e9/a409e99a-f4ef-5e76-03f6-47b744d03d36/mza_3879222421297593630.jpg/600x600bb.jpg',
    desc: 'Conversas espontâneas e diálogos cotidianos gravados entre franceses nativos em Nice, com transcrições e explicações.',
    transcriptTag: 'Com transcrição',
    creator: 'France Bienvenue'
  },
  {
    id: 'transfert_slate',
    name: 'Transfert (Slate.fr)',
    url: 'https://www.slate.fr/podcasts/transfert',
    tags: ['Histórias Reais', 'Cultura', 'Sociedade'],
    paceTag: 'Fala natural',
    avatar: 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts116/v4/03/49/a9/0349a941-fcda-0d48-ae0f-31a89c9e8324/mza_10815197828469399859.jpg/600x600bb.jpg',
    desc: 'Pessoas anônimas contam histórias íntimas, comoventes e surpreendentes sobre momentos que transformaram suas vidas.',
    transcriptTag: 'Com áudio',
    creator: 'Slate Podcasts'
  }
];

fr.Podcasts = curatedPodcasts;

// 3. Limpar títulos e vídeos nos Canais de YouTube de Francês
fr.YouTube.forEach(item => {
  if (item.name.includes('How to pronounce "R" sound in French')) {
    item.name = 'Pronounce "R" in French (Tutorial)';
    item.tags = ['Pronúncia', 'Guia Rápido'];
  } else if (item.name === 'ARTE : chaîne télé culturelle franco-allemande - TV direct & replay') {
    item.name = 'ARTE';
    item.tags = ['Documentários', 'Cultura', 'Cinema & TV'];
    item.desc = 'Canal cultural europeu de referência com documentários de alta qualidade, reportagens e programas investigativos em francês.';
  } else if (item.name === 'French IPA Playlist (Fluent Forever)') {
    item.name = 'Fluent Forever - French Sounds';
    item.tags = ['Pronúncia', 'Fonética'];
  } else if (item.name === 'SPOKEN FRENCH Playlist') {
    item.name = 'Comme une Française (Spoken French)';
    item.tags = ['Francês do Dia a Dia', 'Gírias & Expressões'];
  } else if (item.name === 'TED Talks in French') {
    item.name = 'TEDx Talks Français';
    item.tags = ['Palestras', 'Desenvolvimento Pessoal', 'Ideias'];
  }
});

// Remover canais que eram na verdade links de sites já presentes na aba Sites
fr.YouTube = fr.YouTube.filter(y => y.name !== 'Innerfrench'); // Já é um podcast rico com site próprio

fs.writeFileSync('app/src/data/content.json', JSON.stringify(data, null, 2), 'utf8');

console.log('--- ATUALIZAÇÃO FRANCÊS COMPLETA ---');
console.log('YouTube count:', fr.YouTube.length);
console.log('Podcasts count:', fr.Podcasts.length);
console.log('Séries count:', fr.Séries.length);
console.log('Sites count:', fr.Sites.length);
