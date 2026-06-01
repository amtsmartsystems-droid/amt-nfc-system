const fs = require('fs');

let pagePath = 'c:\\AM\\amt-nfc-system\\app\\page.js';
let pageContent = fs.readFileSync(pagePath, 'utf8');

if (!pageContent.includes('showMenuImages')) {
  pageContent = pageContent.replace('const [isMenuEnabled, setIsMenuEnabled] = useState(false);', 'const [isMenuEnabled, setIsMenuEnabled] = useState(false);\n  const [showMenuImages, setShowMenuImages] = useState(true);');
  
  pageContent = pageContent.replace('isMenuEnabled,', 'isMenuEnabled,\n          showMenuImages,');
  
  pageContent = pageContent.replace('if (data.isMenuEnabled !== undefined) setIsMenuEnabled(data.isMenuEnabled);', 'if (data.isMenuEnabled !== undefined) setIsMenuEnabled(data.isMenuEnabled);\n      if (data.showMenuImages !== undefined) setShowMenuImages(data.showMenuImages !== false);');
  
  pageContent = pageContent.replace('isMenuEnabled, menuMode, pdfMenuUrl, menuCategories };', 'isMenuEnabled, menuMode, pdfMenuUrl, menuCategories, showMenuImages };');
  
  // Add the UI toggle inside the interactive menu section
  // It is placed inside the menuMode === 'interactive' block.
  const interactiveMenuHeaderRegex = /(<div className="space-y-4">[\s\S]*?<div className="flex items-center gap-3">)/;
  
  const uiToggle = `<div className="flex items-center justify-between p-3 bg-black/40 border border-white/5 rounded-xl mb-4">
                            <Label className="text-white text-[12px] flex items-center gap-2">
                              <LucideIcons.Image size={14} className="text-yellow-500" />
                              عرض صور الأصناف
                            </Label>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" checked={showMenuImages} onChange={(e) => setShowMenuImages(e.target.checked)} />
                              <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-yellow-500"></div>
                            </label>
                          </div>\n$1`;
  
  pageContent = pageContent.replace(interactiveMenuHeaderRegex, uiToggle);
  
  fs.writeFileSync(pagePath, pageContent, 'utf8');
  console.log('Updated page.js');
}

// 3. Update the 4 themes to consume showMenuImages
const files = [
  'c:\\AM\\amt-nfc-system\\components\\templates\\GastroBarTheme.js',
  'c:\\AM\\amt-nfc-system\\components\\templates\\CafeTheme.js',
  'c:\\AM\\amt-nfc-system\\components\\templates\\CafeTheme1.js',
  'c:\\AM\\amt-nfc-system\\components\\templates\\RestaurantTheme.js'
];

for (let file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Add showMenuImages to props
  content = content.replace(/(lang\s*=\s*"en",\s*isMenuEnabled,\s*menuMode,\s*menuCategories,\s*addToCart,\s*pdfMenuUrl\s*})|isMenuEnabled,\s*menuMode,\s*pdfMenuUrl,\s*menuCategories,\s*addToCart\s*}/, match => match.replace('}', ', showMenuImages }'));
  
  // Conditionally render the image
  content = content.replace(/\{item\.image && \(/g, '{showMenuImages !== false && item.image && (');
  
  fs.writeFileSync(file, content, 'utf8');
  console.log('Updated theme', file);
}
