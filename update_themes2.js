const fs = require('fs');

const files = [
  'c:\\AM\\amt-nfc-system\\components\\templates\\GastroBarTheme.js',
  'c:\\AM\\amt-nfc-system\\components\\templates\\CafeTheme.js',
  'c:\\AM\\amt-nfc-system\\components\\templates\\CafeTheme1.js',
  'c:\\AM\\amt-nfc-system\\components\\templates\\RestaurantTheme.js'
];

for (let file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace <div className="flex-1"> or <div className="flex-1 min-w-0"> inside the map
  // that is directly followed by <h4 className="font-bold text-[16px] text-white" (or similar)
  // with the image block + the div.
  
  // Use regex to find it
  const regex = /<div className="flex-1(.*?)">\s*<h4 className="font-bold text-\[16px\]/g;
  
  if (regex.test(content)) {
    content = content.replace(regex, `{item.image && (
                              <div className="w-[70px] h-[70px] sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 mr-3 ml-3 rtl:mr-0 rtl:ml-3 ltr:ml-0 ltr:mr-3 relative shadow-md border border-white/5">
                                <img src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
                              </div>
                            )}
                            <div className="flex-1$1">
                              <h4 className="font-bold text-[16px]`);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated', file);
  } else {
    // try slightly different regex for cafe
    const regex2 = /<div className="flex-1(.*?)">\s*<h4/g;
    let replaced = false;
    content = content.replace(regex2, (match, p1) => {
      // Only replace if it's the item.name one (inside map)
      // we can check if it's followed by `{t(item.name`
      replaced = true;
      return `{item.image && (
                              <div className="w-[70px] h-[70px] sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 mr-3 ml-3 rtl:mr-0 rtl:ml-3 ltr:ml-0 ltr:mr-3 relative shadow-md border border-white/5">
                                <img src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
                              </div>
                            )}
                            <div className="flex-1${p1}">
                              <h4`;
    });
    if(replaced){
       fs.writeFileSync(file, content, 'utf8');
       console.log('Updated via fallback regex', file);
    } else {
       console.log('Could not find item render block in', file);
    }
  }
}
