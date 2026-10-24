const fs = require('fs');

function inspect() {
  const content = fs.readFileSync('generate-production-app.js', 'utf8');
  
  // Find where items are defined or arrays
  const tags = new Set();
  const re = /tags:\s*\[(.*?)\]/g;
  let m;
  while((m = re.exec(content)) !== null) {
    m[1].split(',').map(s => s.trim().replace(/['"]/g, '')).filter(Boolean).forEach(t => tags.add(t));
  }
  
  const levels = new Set();
  const lre = /levelTag:\s*['"](.*?)['"]/g;
  while((m = lre.exec(content)) !== null) {
    levels.add(m[1]);
  }
  
  const paces = new Set();
  const pre = /paceTag:\s*['"](.*?)['"]/g;
  while((m = pre.exec(content)) !== null) {
    paces.add(m[1]);
  }

  console.log('--- GENERATE-PRODUCTION-APP.JS ---');
  console.log('Tags:', Array.from(tags).sort());
  console.log('Levels:', Array.from(levels));
  console.log('Paces:', Array.from(paces));

  // Check filter UI
  const filterMatches = content.match(/filter[a-zA-Z0-9_]*|badge[a-zA-Z0-9_]*/gi);
  console.log('Filter mentions count:', filterMatches ? filterMatches.length : 0);
}

inspect();
