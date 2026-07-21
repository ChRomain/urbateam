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
    console.log(`[Project API] Received documentFiles: ${documentFiles.length} files. Details: ${JSON.stringify(documentFiles.map(f => ({ name: f.name, size: f.size })))}\n`);
    for (const file of documentFiles) {
      if (file && typeof file !== 'string' && file.size > 0) {
        const fileId = await uploadFile(file);
        console.log(`[Project API] Upload file returned: ${fileId} for file ${file.name}\n`);
        if (!fileId) {
          throw new Error(`Le téléversement du fichier PDF "${file.name}" a échoué. Veuillez vérifier que le stockage Supabase l'autorise.`);
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

    console.log(`[Project API] Saving itemData: ${JSON.stringify(itemData)}\n`);

    let result;
    if (id) {
      delete itemData.date;
      result = await updateItem('projets', id, itemData);
    } else {
      result = await createItem('projets', itemData);
    }

    console.log(`[Project API] Save result: ${JSON.stringify(result)}\n`);

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
    return NextResponse.json({ success });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
