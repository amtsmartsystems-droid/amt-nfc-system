const fs = require('fs');

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // For RestaurantTheme.js and others that lack the #menu-section handler:
    const target = `const handleClick = (e) => {\n      if(cardId) fetch('/api/clicks', { method: 'POST', body: JSON.stringify({ cardId, linkId: link.id || link._id }) }).catch(()=>{});\n    };`;
    const replacement = `const handleClick = (e) => {
      if(cardId) fetch('/api/clicks', { method: 'POST', body: JSON.stringify({ cardId, linkId: link.id || link._id }) }).catch(()=>{});
      if (link.url === '#menu-section') {
        e.preventDefault();
        if (menuMode === 'pdf' && pdfMenuUrl) {
          window.open(pdfMenuUrl, '_blank');
        } else {
          setIsMenuModalOpen(true);
        }
      }
    };`;

    content = content.replace(target, replacement);

    // Another variation in GastroBarTheme
    const target2 = `const handleClick = (e) => { if(cardId) fetch('/api/clicks', { method: 'POST', body: JSON.stringify({ cardId, linkId: link.id || link._id }) }).catch(()=>{}); };`;
    const replacement2 = `const handleClick = (e) => { 
      if(cardId) fetch('/api/clicks', { method: 'POST', body: JSON.stringify({ cardId, linkId: link.id || link._id }) }).catch(()=>{}); 
      if (link.url === '#menu-section') {
        e.preventDefault();
        if (menuMode === 'pdf' && pdfMenuUrl) {
          window.open(pdfMenuUrl, '_blank');
        } else {
          setIsMenuModalOpen(true);
        }
      }
    };`;

    content = content.replace(target2, replacement2);

    fs.writeFileSync(filePath, content, 'utf8');
}

fixFile('c:\\AM\\amt-nfc-system\\components\\templates\\RestaurantTheme.js');
fixFile('c:\\AM\\amt-nfc-system\\components\\templates\\GastroBarTheme.js');
fixFile('c:\\AM\\amt-nfc-system\\components\\templates\\CafeTheme1.js');
