import { NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import path from 'path';
import { optimizeImage } from '../../../../lib/imageOptimizer';

const DATA_PATH = path.join(process.cwd(), 'public', 'data', 'partners.json');

async function getPartnersData() {
  try {
    const content = await readFile(DATA_PATH, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    return [];
  }
}

async function savePartnersData(data) {
  await writeFile(DATA_PATH, JSON.stringify(data, null, 2));
}

export async function GET() {
  const data = await getPartnersData();
  return NextResponse.json(data);
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const id = formData.get('id');
    const name = formData.get('name');
    const role = formData.get('role');
    const website = formData.get('website');
    const logoFile = formData.get('logo');

    if (!name || !role) {
      return NextResponse.json({ success: false, message: 'Nom et rôle requis' }, { status: 400 });
    }

    const partners = await getPartnersData();
    let partner;
    if (id) {
      partner = partners.find(p => p.id.toString() === id.toString());
      if (!partner) return NextResponse.json({ success: false, message: 'Partenaire non trouvé' }, { status: 404 });
    }

    const partnerId = id ? parseInt(id) : Date.now();
    let logoUrl = partner ? partner.logo : '';

    if (logoFile && typeof logoFile !== 'string' && logoFile.size > 0) {
      const bytes = await logoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      logoUrl = await optimizeImage(buffer, 'uploads/partners', logoFile.name, { width: 400 });
    }

    const updatedPartner = {
      id: partnerId,
      name,
      role,
      website,
      logo: logoUrl,
      date: partner ? partner.date : new Date().toISOString()
    };

    if (id) {
      const index = partners.findIndex(p => p.id.toString() === id.toString());
      partners[index] = updatedPartner;
    } else {
      partners.unshift(updatedPartner);
    }

    await savePartnersData(partners);

    return NextResponse.json({ success: true, partner: updatedPartner });
  } catch (error) {
    console.error('Partner upload error:', error);
    return NextResponse.json({ success: false, message: 'Erreur lors de l\'ajout du partenaire' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    let data = await getPartnersData();
    data = data.filter(p => p.id !== id);
    await savePartnersData(data);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
