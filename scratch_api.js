async function checkAPI() {
    const res = await fetch('https://amt-nfc-system.vercel.app/api/cards/DIAMOND');
    const data = await res.json();
    
    console.log("=== siteData.links ===");
    console.log(JSON.stringify(data.siteData.links, null, 2));
    
    console.log("\n=== merged links ===");
    console.log(JSON.stringify(data.links, null, 2));
}

checkAPI().catch(console.error);
