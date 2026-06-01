const fs = require('fs');

const files = [
  'c:\\AM\\amt-nfc-system\\components\\templates\\GastroBarTheme.js',
  'c:\\AM\\amt-nfc-system\\components\\templates\\CafeTheme.js',
  'c:\\AM\\amt-nfc-system\\components\\templates\\CafeTheme1.js',
  'c:\\AM\\amt-nfc-system\\components\\templates\\RestaurantTheme.js'
];

for (let file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // GastroBar / Restaurant / Cafe / Cafe1 often have this structure:
  // <div className="flex-1">
  //   <h4 ...>{t(item.name, item.nameAr)}</h4>
  //   ...
  // </div>
  // <button ...><LucideIcons.Plus ... /></button>

  // We want to insert the image right before the flex-1 div, so it's on the left,
  // or right after the button? "يحطها مع ازرار الاضافه" -> put it with the add buttons
  // Let's put it on the left (or right based on RTL, but flex row takes care of it).
  
  const searchStr = `<div className="flex-1">
                              <h4`;
                              
  const imageJSX = `{item.image && (
                              <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 mr-4 ml-4 rtl:mr-0 rtl:ml-4 ltr:ml-0 ltr:mr-4 relative">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                            )}
                            <div className="flex-1">
                              <h4`;
                              
  if (content.includes(searchStr)) {
    content = content.replaceAll(searchStr, imageJSX);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated', file);
  } else {
    // CafeTheme might have different spacing
    const searchStr2 = `<div className="flex-1 min-w-0">
                              <h4`;
    const imageJSX2 = `{item.image && (
                              <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 mr-4 ml-4 rtl:mr-0 rtl:ml-4 ltr:ml-0 ltr:mr-4 relative">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4`;
                              
    if (content.includes(searchStr2)) {
      content = content.replaceAll(searchStr2, imageJSX2);
      fs.writeFileSync(file, content, 'utf8');
      console.log('Updated (min-w-0)', file);
    } else {
       console.log('Could not find item render block in', file);
    }
  }
}
