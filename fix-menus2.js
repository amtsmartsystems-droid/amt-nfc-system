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

    // Replace ANY handleClick that matches the #menu-section pattern.
    // The previous regex failed due to whitespace/formatting. Let's use a simpler replace
    
    content = content.replace(/if \(link\.url === '#menu-section'\) {[\s\n]*e\.preventDefault\(\);[\s\n]*setIsMenuModalOpen\(true\);[\s\n]*}/g, 
`if (link.url === '#menu-section') {
          e.preventDefault();
          if (menuMode === 'pdf' && pdfMenuUrl) {
            window.open(pdfMenuUrl, '_blank');
          } else {
            setIsMenuModalOpen(true);
          }
        }`);

    content = content.replace(/if \(link\.url === '#menu-section'\) {[\s\n]*setIsMenuModalOpen\(true\);[\s\n]*}/g, 
`if (link.url === '#menu-section') {
        e.preventDefault();
        if (menuMode === 'pdf' && pdfMenuUrl) {
          window.open(pdfMenuUrl, '_blank');
        } else {
          setIsMenuModalOpen(true);
        }
      }`);

    // If there is any handleClick that doesn't have preventDefault but handles #menu-section:
    // (We also need to make sure `e` is passed in `const handleClick = () =>`)
    content = content.replace(/const handleClick = \(\) => {/g, 'const handleClick = (e) => {');

    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('Fixed', f);
});
