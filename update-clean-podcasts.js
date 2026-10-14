const fs = require('fs');
const podcasts = JSON.parse(fs.readFileSync('podcasts-data.json', 'utf-8'));

podcasts.forEach(p => {
  if (p.id === 'innerfrench') {
    p.desc = "Salut, c'est Hugo ! I created this podcast to show you that you can learn French naturally simply by listening to it. You will quickly realize that you are capable of understanding a lot more French than you think.";
  } else if (p.id === 'transfert') {
    p.desc = "Chaque semaine, Transfert vous raconte une histoire vraie, excitante, prenante, émouvante, et en creux le monde moderne et ceux qui l'habitent.";
  } else if (p.id === 'emotions') {
    p.desc = "“Émotions”, c’est un podcast dans lequel trouver des réponses lorsque l’on s’interroge sur les émotions qui nous traversent, pour ne plus se sentir seul·e. Un lundi sur deux, découvrez pourquoi vous ressentez ce que vous ressentez.";
  } else if (p.id === 'hugodecrypte') {
    p.desc = "Hugo Décrypte est un journaliste nouvelle génération : chaque jour, retrouvez l'actu résumée et expliquée en dix minutes de manière à la rendre claire et abordable pour tous.";
  } else if (p.id === 'choses_a_savoir') {
    p.desc = "Développez votre culture générale. Des chroniques courtes et percutantes conçues pour développer les connaissances jour après jour en quelques minutes.";
  } else if (p.id === 'heure_du_monde') {
    p.desc = 'Tous les matins du lundi au vendredi, retrouvez la rédaction du "Monde" pour bien comprendre les grands enjeux et les coulisses de l\'actualité.';
  }
});

fs.writeFileSync('podcasts-data.json', JSON.stringify(podcasts, null, 2));
console.log('podcasts-data.json updated cleanly with real descriptions!');
