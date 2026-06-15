import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const db = await mysql.createConnection(process.env.DATABASE_URL);

// Update stores with logos and links
const stores = [
  { name: "shein",      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Shein_logo.svg/320px-Shein_logo.svg.png",       link: "/commander?store=shein" },
  { name: "amazon",     logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/320px-Amazon_logo.svg.png",      link: "/commander?store=amazon" },
  { name: "zara",       logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Zara_Logo.svg/320px-Zara_Logo.svg.png",          link: "/commander?store=zara" },
  { name: "nike",       logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/320px-Logo_NIKE.svg.png",          link: "/commander?store=nike" },
  { name: "sephora",    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Sephora_logo.svg/320px-Sephora_logo.svg.png",    link: "/commander?store=sephora" },
  { name: "adidas",     logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/320px-Adidas_Logo.svg.png",      link: "/commander?store=adidas" },
  { name: "h&m",        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/H%26M-Logo.svg/320px-H%26M-Logo.svg.png",        link: "/commander?store=hm" },
  { name: "aliexpress", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/AliExpress_logo.svg/320px-AliExpress_logo.svg.png", link: "/commander?store=aliexpress" },
  { name: "temu",       logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Temu_logo.svg/320px-Temu_logo.svg.png",          link: "/commander?store=temu" },
];

for (const s of stores) {
  const [r] = await db.execute(
    "UPDATE homepage_stores SET logoUrl = ?, linkUrl = ? WHERE LOWER(name) = ?",
    [s.logo, s.link, s.name]
  );
  console.log(`${s.name}: ${r.affectedRows} row(s) updated`);
}

// Update card1-4 content
const [cr] = await db.execute(`
  UPDATE homepage_settings SET
    card1Label = 'Commander', card1BgColor = '#1a1a2e', card1TextColor = '#ffffff', card1Link = '/commander',
    card2Label = 'Arrivages', card2BgColor = '#e63946', card2TextColor = '#ffffff', card2Link = '/arrivage',
    card3Label = 'Suivi ••',  card3BgColor = '#2d6a4f', card3TextColor = '#ffffff', card3Link = '/suivi',
    card4Label = 'Calculer',  card4BgColor = '#f4a261', card4TextColor = '#1a1a1a', card4Link = '/calculer'
  WHERE id = 1
`);
console.log(`cards updated: ${cr.affectedRows} row(s)`);

await db.end();
console.log("Done!");
