const fs = require('fs');

// 1. Update Card model
let cardPath = 'c:\\AM\\amt-nfc-system\\backend\\models\\Card.js';
let cardContent = fs.readFileSync(cardPath, 'utf8');
if (!cardContent.includes('showMenuImages')) {
  cardContent = cardContent.replace("menuCategories: {", `showMenuImages: { type: Boolean, default: true },\n    menuCategories: {`);
  fs.writeFileSync(cardPath, cardContent, 'utf8');
  console.log('Updated Card.js');
}

// 2. Update route.js GET
let routePath = 'c:\\AM\\amt-nfc-system\\app\\api\\cards\\[cardId]\\route.js';
let routeContent = fs.readFileSync(routePath, 'utf8');
if (!routeContent.includes('showMenuImages:      card.showMenuImages')) {
  routeContent = routeContent.replace("menuCategories:     card.menuCategories", `showMenuImages:     card.showMenuImages !== false,\n            menuCategories:     card.menuCategories`);
}
// Update route.js POST
if (!routeContent.includes('const cleanShowMenuImages')) {
  routeContent = routeContent.replace("const cleanMenuCategories", `const cleanShowMenuImages = body.showMenuImages;\n        const cleanMenuCategories`);
}
if (!routeContent.includes('card.showMenuImages = cleanShowMenuImages')) {
  routeContent = routeContent.replace("if (cleanMenuCategories !== undefined)", `if (cleanShowMenuImages !== undefined) card.showMenuImages = cleanShowMenuImages;\n        if (cleanMenuCategories !== undefined)`);
}
if (!routeContent.includes('showMenuImages: cleanShowMenuImages')) {
  routeContent = routeContent.replace("menuCategories: cleanMenuCategories", `showMenuImages: cleanShowMenuImages !== false,\n                menuCategories: cleanMenuCategories`);
}
fs.writeFileSync(routePath, routeContent, 'utf8');
console.log('Updated route.js');
