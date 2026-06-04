const fs = require('fs');
let c = fs.readFileSync('components/templates/MaroufCoffeeTheme.js', 'utf8');

c = c.replace(/#B99146/gi, 'var(--primary-color)');
c = c.replace(/185,\s*145,\s*70/g, 'var(--primary-rgb)');
c = c.replace(/#050505/gi, 'var(--bg-color)');

// Fix the main component vars to actually set the CSS vars:
c = c.replace('const accent  = "var(--primary-color)";', `
  const accent = siteColors?.primary || "#B99146";
  const bgDark = siteColors?.background || "#050505";

  const hexToRgbStr = (hex) => {
    let c = (hex||'#B99146').substring(1);
    if(c.length===3) c = c.split('').map(x=>x+x).join('');
    const num = parseInt(c, 16);
    return \`\${(num >> 16) & 255}, \${(num >> 8) & 255}, \${num & 255}\`;
  };

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', accent);
    document.documentElement.style.setProperty('--primary-rgb', hexToRgbStr(accent));
    document.documentElement.style.setProperty('--bg-color', bgDark);
  }, [accent, bgDark]);
`);

// Also remove the old useEffect that sets variables
c = c.replace(/useEffect\(\(\) => \{[\s\S]*?document\.documentElement\.style\.setProperty\("--primary-rgb"[\s\S]*?\}, \[accent\]\);/m, '');

fs.writeFileSync('components/templates/MaroufCoffeeTheme.js', c);
console.log('Updated Marouf colors to be dynamic!');
