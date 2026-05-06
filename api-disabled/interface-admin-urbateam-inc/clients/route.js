import { NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import path from 'path';
import { optimizeImage } from '../../../../lib/imageOptimizer';

const DATA_PATH = path.join(process.cwd(), 'public', 'data', 'clients.json');

async function getClientsData() {
  try {
    const content = await readFile(DATA_PATH, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    return [];
  }
}

async function saveClientsData(data) {
  await writeFile(DATA_PATH, JSON.stringify(data, null, 2));
}

export async function GET() {
  const data = await getClientsData();
  return NextResponse.json(data);
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const id = formData.get('id');
    const name = formData.get('name');
    const category = formData.get('category');
    const logoFile = formData.get('logo');

    if (!name || !category) {
      return NextResponse.json({ success: false, message: 'Nom et catégorie requis' }, { status: 400 });
    }

    const clients = await getClientsData();
    let client;
    if (id) {
      client = clients.find(c => c.id.toString() === id.toString());
      if (!client) return NextResponse.json({ success: false, message: 'Client non trouvé' }, { status: 404 });
    }

    const clientId = id ? parseInt(id) : Date.now();
    let logoUrl = client ? client.logo : '';

    if (logoFile && typeof logoFile !== 'string' && logoFile.size > 0) {
      const bytes = await logoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      logoUrl = await optimizeImage(buffer, 'uploads/clients', logoFile.name, { width: 400 }); // Logos don't need to be 1920px
    }

    const updatedClient = {
      id: clientId,
      name,
      category,
      logo: logoUrl,
      date: client ? client.date : new Date().toISOString()
    };

    if (id) {
      const index = clients.findIndex(c => c.id.toString() === id.toString());
      clients[index] = updatedClient;
    } else {
      clients.unshift(updatedClient);
    }

    await saveClientsData(clients);

    return NextResponse.json({ success: true, client: updatedClient });
  } catch (error) {
    console.error('Client upload error:', error);
    return NextResponse.json({ success: false, message: 'Erreur lors de l\'ajout du client' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    let data = await getClientsData();
    data = data.filter(c => c.id !== id);
    await saveClientsData(data);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
