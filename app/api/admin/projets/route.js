import { NextResponse } from 'next/server';
import { getProjets, createItem, updateItem, deleteItem, uploadFile } from '../../../../lib/supabase';
import { verifyAdminSession } from '../../../../lib/auth-helper';
import fs from 'fs/promises';
import path from 'path';

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
    const subcategory = formData.get('subcategory') || '';
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
    const documentFiles = formData.getAll('documents');

    const slug = title.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    const itemData = {
      status,
      title,
      slug,
      category,
      subcategory,
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
      const fileId = await uploadFile(beforeImage);
      if (!fileId) throw new Error("Le téléversement de l'image 'Avant' a échoué.");
      itemData.image_before = fileId;
    }
    if (afterImage && typeof afterImage !== 'string' && afterImage.size > 0) {
      const fileId = await uploadFile(afterImage);
      if (!fileId) throw new Error("Le téléversement de l'image 'Après' a échoué.");
      itemData.image_after = fileId;
    }

    const galleryIds = [];
    for (const file of galleryFiles) {
      if (file && typeof file !== 'string' && file.size > 0) {
        const fileId = await uploadFile(file);
        if (!fileId) throw new Error(`Le téléversement de l'image "${file.name}" de la galerie a échoué.`);
        galleryIds.push(fileId);
      }
    }
    
    if (galleryIds.length > 0) {
      itemData.images_gallery = galleryIds;
    }

    const documentsList = [];
    for (const file of documentFiles) {
      if (file && typeof file !== 'string' && file.size > 0) {
        const fileId = await uploadFile(file);
        if (!fileId) {
          throw new Error(`Le téléversement du fichier PDF "${file.name}" a échoué.`);
        }
        documentsList.push({
          name: file.name,
          url: fileId
        });
      }
    }

    if (documentsList.length > 0) {
      itemData.documents = documentsList;
    }

    let result;
    try {
      if (id) {
        delete itemData.date;
        result = await updateItem('projets', id, itemData);
      } else {
        result = await createItem('projets', itemData);
      }
    } catch (dbErr) {
      console.warn('[Project API] Supabase write fallback:', dbErr.message);
      // If column subcategory doesn't exist in Supabase SQL schema cache
      if (dbErr.message.includes('subcategory') || dbErr.message.includes('schema cache')) {
        const itemDataFallback = { ...itemData };
        delete itemDataFallback.subcategory;
        if (id) {
          result = await updateItem('projets', id, itemDataFallback);
        } else {
          result = await createItem('projets', itemDataFallback);
        }
      } else {
        throw dbErr;
      }
    }

    // Sync item to public/data/projets.json (preserving subcategory)
    try {
      const jsonPath = path.join(process.cwd(), 'public', 'data', 'projets.json');
      let fileItems = [];
      try {
        const fileContent = await fs.readFile(jsonPath, 'utf8');
        fileItems = JSON.parse(fileContent);
      } catch {
        fileItems = [];
      }

      const fullProjectItem = {
        id: (result && result.id) ? result.id : (id || Date.now().toString()),
        ...itemData
      };

      const existingIndex = fileItems.findIndex(p => p.id === fullProjectItem.id || p.slug === fullProjectItem.slug);
      if (existingIndex >= 0) {
        fileItems[existingIndex] = { ...fileItems[existingIndex], ...fullProjectItem };
      } else {
        fileItems.unshift(fullProjectItem);
      }

      await fs.writeFile(jsonPath, JSON.stringify(fileItems, null, 2), 'utf8');
    } catch (fsErr) {
      console.warn('[Project API] Local file sync skipped:', fsErr?.message);
    }

    return NextResponse.json({ success: true, project: result });
  } catch (error) {
    console.error('[Project API Error]:', error.message, error.stack);
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

    // Also delete from public/data/projets.json fallback file if present
    try {
      const jsonPath = path.join(process.cwd(), 'public', 'data', 'projets.json');
      const fileContent = await fs.readFile(jsonPath, 'utf8');
      const fileItems = JSON.parse(fileContent);
      const filtered = fileItems.filter(p => p.id !== id);
      await fs.writeFile(jsonPath, JSON.stringify(filtered, null, 2), 'utf8');
    } catch (fsErr) {
      console.warn('[Project API DELETE File Sync Error]:', fsErr?.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
