import { NextResponse } from 'next/server';
import { getProjets, createItem, updateItem, deleteItem, uploadFile } from '../../../../lib/supabase';
import { verifyAdminSession } from '../../../../lib/auth-helper';

export async function GET(request) {
  try {
    const admin = await verifyAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const projects = await getProjets(null);
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
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
    const status = formData.get('status') || 'published';
    const title = formData.get('title');
    const category = formData.get('category');
    const client = formData.get('client');
    const description = formData.get('description');
    const location = formData.get('location');
    const technicalDetails = formData.get('technicalDetails');
    const latitude = formData.get('latitude');
    const longitude = formData.get('longitude');
    const missions = formData.get('missions');

    const beforeImage = formData.get('beforeImage');
    const afterImage = formData.get('afterImage');
    const galleryFiles = formData.getAll('gallery');

    const slug = title.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    const itemData = {
      status,
      title,
      slug,
      category,
      client,
      description,
      location,
      technical_details: technicalDetails,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      missions: missions ? missions.split(',').map(m => m.trim()) : [],
      date: new Date().toISOString()
    };

    // Upload images if provided
    if (beforeImage && typeof beforeImage !== 'string' && beforeImage.size > 0) {
      itemData.image_before = await uploadFile(beforeImage);
    }
    if (afterImage && typeof afterImage !== 'string' && afterImage.size > 0) {
      itemData.image_after = await uploadFile(afterImage);
    }

    const galleryIds = [];
    for (const file of galleryFiles) {
      if (file && typeof file !== 'string' && file.size > 0) {
        const fileId = await uploadFile(file);
        if (fileId) galleryIds.push(fileId);
      }
    }
    
    if (galleryIds.length > 0) {
      itemData.images_gallery = galleryIds;
    }

    let result;
    if (id) {
      delete itemData.date;
      result = await updateItem('projets', id, itemData);
    } else {
      result = await createItem('projets', itemData);
    }

    return NextResponse.json({ success: true, project: result });
  } catch (error) {
    console.error('Project API Error:', error);
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

    const success = await deleteItem('projets', id);
    return NextResponse.json({ success });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
