import { NextResponse } from 'next/server';
import { getClients, createItem, updateItem, deleteItem, uploadFile, getLogoUrl, supabase } from '../../../../lib/supabase';
import { verifyAdminSession } from '../../../../lib/auth-helper';

// Map categories from frontend select to Supabase tags
const CATEGORY_MAP = {
  collectivite: 'Collectivite',
  promoteur: 'Aménageur',
  architecte: 'Architecte',
  particulier: 'Particulier',
  entreprise: 'Entreprise'
};

const REVERSE_CATEGORY_MAP = {
  'Collectivite': 'collectivite',
  'Aménageur': 'promoteur',
  'Architecte': 'architecte',
  'Particulier': 'particulier',
  'Entreprise': 'entreprise'
};

export async function GET(request) {
  try {
    const admin = await verifyAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch clients ordered by sort
    const { data: clients, error } = await supabase
      .from('clients')
      .select('*')
      .order('sort', { ascending: true });

    if (error) throw error;

    // Map tags back to category for frontend compatibility
    const formattedClients = (clients || []).map(c => {
      const tag = c.tags?.[0];
      return {
        id: c.id.toString(),
        name: c.name,
        logo: c.logo ? getLogoUrl(c.logo) : null,
        category: REVERSE_CATEGORY_MAP[tag] || 'collectivite',
        tags: c.tags,
        sort: c.sort
      };
    });

    return NextResponse.json(formattedClients);
  } catch (error) {
    console.error('Failed to fetch clients:', error);
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const admin = await verifyAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const id = formData.get('id');
    const name = formData.get('name');
    const category = formData.get('category');
    const logoFile = formData.get('logo');

    if (!name || !category) {
      return NextResponse.json({ success: false, message: 'Nom et catégorie requis' }, { status: 400 });
    }

    // Enforce 15 clients max when adding a new one
    if (!id) {
      const { count, error: countErr } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });

      if (countErr) throw countErr;

      if (count >= 15) {
        return NextResponse.json({ success: false, message: 'Limite de 15 clients atteinte' }, { status: 400 });
      }
    }

    const dbTag = CATEGORY_MAP[category] || 'Collectivite';

    const itemData = {
      name,
      tags: [dbTag],
      status: 'published'
    };

    if (logoFile && typeof logoFile !== 'string' && logoFile.size > 0) {
      const uploadedName = await uploadFile(logoFile);
      if (uploadedName) {
        itemData.logo = uploadedName;
      }
    }

    let result;
    if (id) {
      result = await updateItem('clients', id, itemData);
    } else {
      // Find max sort to append at the end
      const { data: lastClients, error: sortErr } = await supabase
        .from('clients')
        .select('sort')
        .order('sort', { ascending: false })
        .limit(1);

      const nextSort = sortErr || !lastClients || lastClients.length === 0 
        ? 0 
        : (lastClients[0].sort || 0) + 1;

      itemData.sort = nextSort;
      result = await createItem('clients', itemData);
    }

    return NextResponse.json({ success: true, client: result });
  } catch (error) {
    console.error('Client POST error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const admin = await verifyAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const success = await deleteItem('clients', id);
    return NextResponse.json({ success });
  } catch (error) {
    console.error('Client DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
