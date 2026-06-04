const fs = require('fs');
const path = require('path');

const dir = 'c:\\AM\\amt-nfc-system\\components\\templates';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

files.forEach(file => {
    const fullPath = path.join(dir, file);
    let content = fs.readFileSync(fullPath, 'utf8');
    if (content.includes('src={block.url}')) {
        content = content.replace(/src=\{block\.url\}/g, 'src={block.imageUrl || block.url}');
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Fixed:', file);
    }
});
console.log('Done.');
