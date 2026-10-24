const fs = require('fs');

const content = JSON.parse(fs.readFileSync('app/src/data/content.json', 'utf8'));

const urlReplacements = {
  'https://www.netflix.com/title/80027957': 'https://www.netflix.com/title/80027563', // Avatar Korra
  'https://www.netflix.com/title/70281561': 'https://www.netflix.com/title/70281562', // Brooklyn Nine-Nine
  'https://www.netflix.com/title/70153369': 'https://www.netflix.com/title/70155547', // SpongeBob
  'https://www.netflix.com/title/80045731': 'https://www.netflix.com/title/80075820', // Trollhunters
  'https://www.netflix.com/title/81005881': 'https://www.netflix.com/title/80218108', // Wizards
  'https://www.netflix.com/title/80221348': 'https://www.netflix.com/title/80179784', // 3Below
  'https://www.netflix.com/title/80025204': 'https://www.netflix.com/title/70302573', // Sword Art Online
  'https://www.netflix.com/title/81101302': 'https://www.netflix.com/title/81011660', // Biohackers
  'https://www.netflix.com/title/81033251': 'https://www.netflix.com/title/81020518', // Criminal: Deutschland
  'https://www.netflix.com/title/81395874': 'https://www.netflix.com/title/81354529', // La cocinera de Castamar
  'https://www.netflix.com/title/81079044': 'https://www.netflix.com/title/81079046', // Zone Blanche
  'https://www.netflix.com/title/80138988': 'https://www.netflix.com/title/80142550', // La Trêve
  'https://www.netflix.com/title/81031388': 'https://www.netflix.com/title/81221302', // Il Processo
  'https://www.netflix.com/title/80233157': 'https://www.netflix.com/title/80158919', // Omnipresent
  'https://www.netflix.com/title/70293616': 'https://www.netflix.com/title/80168079'  // The Square
};

const urlsToRemove = new Set([
  'https://www.netflix.com/title/80097771', // A Very Secret Service
  'https://www.netflix.com/title/81026702'  // Better Than Us
]);

let updatedCount = 0;
let removedCount = 0;

for (const [lang, categories] of Object.entries(content)) {
  for (const [catName, items] of Object.entries(categories)) {
    if (Array.isArray(items)) {
      const filtered = [];
      for (const item of items) {
        const trimmedUrl = (item.url || '').trim();
        if (urlsToRemove.has(trimmedUrl)) {
          removedCount++;
          console.log(`Removendo [${lang} -> ${catName}]: ${item.title || item.name} (${trimmedUrl})`);
          continue;
        }
        if (urlReplacements[trimmedUrl]) {
          console.log(`Atualizando URL [${lang} -> ${catName}]: ${item.title || item.name} -> ${urlReplacements[trimmedUrl]}`);
          item.url = urlReplacements[trimmedUrl];
          updatedCount++;
        }
        filtered.push(item);
      }
      categories[catName] = filtered;
    }
  }
}

console.log('--- RELATÓRIO DE ALTERAÇÕES ---');
console.log('URLs atualizadas:', updatedCount);
console.log('Itens removidos:', removedCount);

fs.writeFileSync('app/src/data/content.json', JSON.stringify(content, null, 2), 'utf8');
console.log('content.json salvo com sucesso!');
