import { NextResponse } from 'next/server';
import { getClients, createItem, updateItem, deleteItem, uploadFile, getLogoUrl, supabaseAdmin } from '../../../../lib/supabase';
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
    const { data: clients, error } = await supabaseAdmin
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
        sort: c.sort,
        in_carousel: c.in_carousel || false
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
      const { data: lastClients, error: sortErr } = await supabaseAdmin
        .from('clients')
        .select('sort')
        .order('sort', { ascending: false })
        .limit(1);

      const nextSort = sortErr || !lastClients || lastClients.length === 0 
        ? 0 
        : (lastClients[0].sort || 0) + 1;

      itemData.sort = nextSort;
      itemData.in_carousel = false; // default to false on creation
      result = await createItem('clients', itemData);
    }

    return NextResponse.json({ success: true, client: result });
  } catch (error) {
    console.error('Client POST error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const admin = await verifyAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, in_carousel } = await request.json();
    if (id === undefined || in_carousel === undefined) {
      return NextResponse.json({ success: false, message: 'ID et statut requis' }, { status: 400 });
    }

    if (in_carousel === true) {
      // Count how many are already in the carousel
      const { count, error: countErr } = await supabaseAdmin
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('in_carousel', true);

      if (countErr) throw countErr;

      if (count >= 15) {
        return NextResponse.json({ success: false, message: 'Vous ne pouvez pas sélectionner plus de 15 clients pour le carrousel.' }, { status: 400 });
      }
    }

    const result = await updateItem('clients', id, { in_carousel });
    return NextResponse.json({ success: true, client: result });
  } catch (error) {
    console.error('Client PATCH error:', error);
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
