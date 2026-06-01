const fs = require('fs');
const path = require('path');

const files = [
    'components/templates/RestaurantTheme.js',
    'components/templates/CafeTheme.js',
    'components/templates/CafeTheme1.js',
    'components/templates/GastroBarTheme.js'
];

files.forEach(f => {
    const fullPath = path.join('c:\\AM\\amt-nfc-system', f);
    if (!fs.existsSync(fullPath)) return;
    
    let content = fs.readFileSync(fullPath, 'utf8');

    // 1. Fix LinkBtn handleClick
    content = content.replace(
        /const handleClick = \([^)]*\) => {[\s\n]*if\(cardId\) fetch\('\/api\/clicks'.*?}\.catch\(\(\)=>{}\);[\s\n]*};/g,
        `const handleClick = (e) => {\n      if(cardId) fetch('/api/clicks', { method: 'POST', body: JSON.stringify({ cardId, linkId: link.id || link._id }) }).catch(()=>{});\n      if (link.url === '#menu-section') {\n        e.preventDefault();\n        if (menuMode === 'pdf' && pdfMenuUrl) {\n          window.open(pdfMenuUrl, '_blank');\n        } else {\n          setIsMenuModalOpen(true);\n        }\n      }\n    };`
    );

    // 2. Fix YellowBtn handleClick
    content = content.replace(
        /const handleClick = \(e\) => {[\s\n]*if\(cardId\) fetch\('\/api\/clicks'.*?}\.catch\(\(\)=>{}\);[\s\n]*if \(link\.url === '#menu-section'\) {[\s\n]*e\.preventDefault\(\);[\s\n]*setIsMenuModalOpen\(true\);[\s\n]*}[\s\n]*};/g,
        `const handleClick = (e) => {\n      if(cardId) fetch('/api/clicks', { method: 'POST', body: JSON.stringify({ cardId, linkId: link.id || link._id }) }).catch(()=>{});\n      if (link.url === '#menu-section') {\n        e.preventDefault();\n        if (menuMode === 'pdf' && pdfMenuUrl) {\n          window.open(pdfMenuUrl, '_blank');\n        } else {\n          setIsMenuModalOpen(true);\n        }\n      }\n    };`
    );

    // 3. Fix OutlineBtn handleClick
    content = content.replace(
        /const handleClick = \(\) => { if\(cardId\) fetch\('\/api\/clicks'.*?}\.catch\(\(\)=>{}\); };/g,
        `const handleClick = (e) => {\n      if(cardId) fetch('/api/clicks', { method: 'POST', body: JSON.stringify({ cardId, linkId: link.id || link._id }) }).catch(()=>{});\n      if (link.url === '#menu-section') {\n        e.preventDefault();\n        if (menuMode === 'pdf' && pdfMenuUrl) {\n          window.open(pdfMenuUrl, '_blank');\n        } else {\n          setIsMenuModalOpen(true);\n        }\n      }\n    };`
    );

    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('Fixed', f);
});
