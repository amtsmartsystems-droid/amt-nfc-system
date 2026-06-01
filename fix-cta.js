const fs = require('fs');

function replaceCTA(filePath, original, replacement) {
    let content = fs.readFileSync(filePath, 'utf8');
    if(content.includes(original)) {
        content = content.replace(original, replacement);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Replaced CTA in', filePath);
    } else {
        console.log('Could not find original string in', filePath);
    }
}

// 1. GastroBarTheme.js
const gastroPath = 'c:\\AM\\amt-nfc-system\\components\\templates\\GastroBarTheme.js';
const gastroOrig = `{/* CTA button — relative z-10 makes it always clickable */}
        {primaryLinks[0] && (
          <div className="relative z-10">
            <YellowBtn link={primaryLinks[0]} />
          </div>
        )}`;
const gastroNew = `{/* CTA button — relative z-10 makes it always clickable */}
        {isMenuEnabled ? (
          <div className="relative z-10">
            <button
              onClick={(e) => {
                if (menuMode === 'pdf' && pdfMenuUrl) {
                  window.open(pdfMenuUrl, '_blank');
                } else {
                  setIsMenuModalOpen(true);
                }
              }}
              className="flex items-center justify-center gap-3 w-full py-4 rounded-xl font-black text-[14px] uppercase tracking-wider transition-all duration-300 hover:brightness-110 active:scale-95 hover:shadow-[0_0_24px_rgba(var(--primary-rgb),0.45)]"
              style={{ background: accent, color: "#111", boxShadow: \`0 4px 20px rgba(var(--primary-rgb),0.30)\`, fontFamily:"Cairo,sans-serif" }}
            >
              <LucideIcons.UtensilsCrossed size={18} color="#111" />
              {t("View Menu", "عرض القائمة")}
            </button>
          </div>
        ) : primaryLinks[0] && (
          <div className="relative z-10">
            <YellowBtn link={primaryLinks[0]} />
          </div>
        )}`;
replaceCTA(gastroPath, gastroOrig, gastroNew);

// GastroBarTheme lower button
const gastroLowerOrig = `{/* ── MENU BUTTON: Always show when isMenuEnabled ── */}
        {isMenuEnabled ? (
          <div className="px-5">
            <button
              onClick={() => {
                if (menuMode === 'pdf' && pdfMenuUrl) {
                  window.open(pdfMenuUrl, '_blank');
                } else {
                  setIsMenuModalOpen(true);
                }
              }}
              className="flex items-center justify-center gap-3 w-full py-4 rounded-xl font-black text-[14px] uppercase tracking-wider transition-all duration-300 hover:brightness-110 active:scale-95"
              style={{ background: accent, color: "#111", boxShadow: \`0 4px 20px rgba(var(--primary-rgb),0.30)\`, fontFamily:"Cairo,sans-serif" }}
            >
              <LucideIcons.UtensilsCrossed size={18} color="#111" />
              {t("View Menu", "عرض القائمة")}
            </button>
          </div>
        ) : (() => {`;
const gastroLowerNew = `{/* ── SECONDARY MENU LINK (Fallback) ── */}
        {(() => {`;
let gastroContent = fs.readFileSync(gastroPath, 'utf8');
if(gastroContent.includes(gastroLowerOrig)) {
    gastroContent = gastroContent.replace(gastroLowerOrig, gastroLowerNew);
    fs.writeFileSync(gastroPath, gastroContent, 'utf8');
    console.log('Removed duplicate bottom button in GastroBarTheme');
}

// 2. CafeTheme.js
const cafePath = 'c:\\AM\\amt-nfc-system\\components\\templates\\CafeTheme.js';
const cafeOrig = `{/* ── DYNAMIC LINKS ── */}
      <section className="px-5 pb-10">`;
const cafeNew = `{/* ── MENU BUTTON (TOP CTA) ── */}
      {isMenuEnabled && (
        <section className="px-5 pb-4">
          <button
            onClick={() => {
              if (menuMode === 'pdf' && pdfMenuUrl) {
                window.open(pdfMenuUrl, '_blank');
              } else {
                setIsMenuModalOpen(true);
              }
            }}
            className="group flex items-center gap-4 w-full px-5 py-[15px] rounded-2xl font-bold text-[13.5px] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]"
            style={{ background: primary, color:"#fff", boxShadow:\`0 4px 18px rgba(var(--primary-rgb),.28)\`, fontFamily:"Cairo,sans-serif" }}
          >
            <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center transition-transform group-hover:scale-110 bg-white/20">
              <LucideIcons.UtensilsCrossed size={18} color="#fff" />
            </div>
            <span className="flex-1 truncate">{t("View Menu", "عرض القائمة")}</span>
            <LucideIcons.ArrowLeft size={15} color="rgba(255,255,255,0.50)" />
          </button>
        </section>
      )}

      {/* ── DYNAMIC LINKS ── */}
      <section className="px-5 pb-10">`;

replaceCTA(cafePath, cafeOrig, cafeNew);

const cafeLowerOrig = `{/* ── MENU BUTTON (if isMenuEnabled) ── */}
        {isMenuEnabled && (
          <div className="mt-4">
            <button
              onClick={() => {
                if (menuMode === 'pdf' && pdfMenuUrl) {
                  window.open(pdfMenuUrl, '_blank');
                } else {
                  setIsMenuModalOpen(true);
                }
              }}
              className="group flex items-center gap-4 w-full px-5 py-[15px] rounded-2xl font-bold text-[13.5px] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]"
              style={{ background: primary, color:"#fff", boxShadow:\`0 4px 18px rgba(var(--primary-rgb),.28)\`, fontFamily:"Cairo,sans-serif" }}
            >
              <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center transition-transform group-hover:scale-110 bg-white/20">
                <LucideIcons.UtensilsCrossed size={18} color="#fff" />
              </div>
              <span className="flex-1 truncate">{t("View Menu", "عرض القائمة")}</span>
              <LucideIcons.ArrowLeft size={15} color="rgba(255,255,255,0.50)" />
            </button>
          </div>
        )}`;
let cafeContent = fs.readFileSync(cafePath, 'utf8');
if(cafeContent.includes(cafeLowerOrig)) {
    cafeContent = cafeContent.replace(cafeLowerOrig, '');
    fs.writeFileSync(cafePath, cafeContent, 'utf8');
    console.log('Removed duplicate bottom button in CafeTheme');
}

// 3. CafeTheme1.js
const cafe1Path = 'c:\\AM\\amt-nfc-system\\components\\templates\\CafeTheme1.js';
const cafe1Orig = `{/* ── PRIMARY LINKS ── */}
      <section className="px-5 pb-8">`;
const cafe1New = `{/* ── MENU BUTTON (TOP CTA) ── */}
      {isMenuEnabled && (
        <section className="px-5 pb-4">
          <button
            onClick={() => {
              if (menuMode === 'pdf' && pdfMenuUrl) {
                window.open(pdfMenuUrl, '_blank');
              } else {
                setIsMenuModalOpen(true);
              }
            }}
            className="group flex items-center gap-4 w-full px-5 py-4 rounded-2xl font-bold text-[13.5px] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]"
            style={{ background: primary, color:"#fff", boxShadow:\`0 6px 20px rgba(var(--primary-rgb),.35)\`, fontFamily:"Cairo,sans-serif" }}
          >
            <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center transition-transform group-hover:scale-110 bg-white/20">
              <LucideIcons.UtensilsCrossed size={18} color="#fff" />
            </div>
            <span className="flex-1 truncate">{t("View Menu", "عرض القائمة")}</span>
            <LucideIcons.ArrowLeft size={15} color="rgba(255,255,255,0.40)" />
          </button>
        </section>
      )}

      {/* ── PRIMARY LINKS ── */}
      <section className="px-5 pb-8">`;

replaceCTA(cafe1Path, cafe1Orig, cafe1New);

const cafe1LowerOrig = `{/* ── MENU BUTTON ── */}
        {isMenuEnabled && (
          <div className="mt-4">
            <button
              onClick={() => {
                if (menuMode === 'pdf' && pdfMenuUrl) {
                  window.open(pdfMenuUrl, '_blank');
                } else {
                  setIsMenuModalOpen(true);
                }
              }}
              className="group flex items-center gap-4 w-full px-5 py-4 rounded-2xl font-bold text-[13.5px] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]"
              style={{ background: primary, color:"#fff", boxShadow:\`0 6px 20px rgba(var(--primary-rgb),.35)\`, fontFamily:"Cairo,sans-serif" }}
            >
              <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center transition-transform group-hover:scale-110 bg-white/20">
                <LucideIcons.UtensilsCrossed size={18} color="#fff" />
              </div>
              <span className="flex-1 truncate">{t("View Menu", "عرض القائمة")}</span>
              <LucideIcons.ArrowLeft size={15} color="rgba(255,255,255,0.40)" />
            </button>
          </div>
        )}`;
let cafe1Content = fs.readFileSync(cafe1Path, 'utf8');
if(cafe1Content.includes(cafe1LowerOrig)) {
    cafe1Content = cafe1Content.replace(cafe1LowerOrig, '');
    fs.writeFileSync(cafe1Path, cafe1Content, 'utf8');
    console.log('Removed duplicate bottom button in CafeTheme1');
}

console.log('Done!');
