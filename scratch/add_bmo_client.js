const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function run() {
  const sourcePath = '/Users/romaincharretteur/Documents/urbateam/BMO.png';
  const targetDir = path.join(process.cwd(), 'public', 'uploads', 'clients');
  const targetPath = path.join(targetDir, 'bmo.webp');
  const dataPath = path.join(process.cwd(), 'public', 'data', 'clients.json');

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Optimisation
  await sharp(sourcePath)
    .resize(400, null, { withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(targetPath);

  console.log(`Image optimisée et déplacée vers ${targetPath}`);

  // Mise à jour JSON
  let clients = [];
  if (fs.existsSync(dataPath)) {
    try {
      clients = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    } catch (e) {}
  }

  const newClient = {
    id: Date.now().toString(),
    name: "Brest Metropole Oceane",
    logo: "/uploads/clients/bmo.webp",
    tags: ["Collectivite"]
  };

  clients.push(newClient);
  fs.writeFileSync(dataPath, JSON.stringify(clients, null, 2));
  console.log("Client ajouté au fichier JSON");
}

run().catch(console.error);
