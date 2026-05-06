import { NextResponse } from 'next/server';
export const dynamic = 'force-static';


import { writeFile, readFile } from 'fs/promises';
import path from 'path';
import { optimizeImage } from '../../../../lib/imageOptimizer';

const DATA_PATH = path.join(process.cwd(), 'public', 'data', 'projets.json');

async function getProjectData() {
  try {
    const content = await readFile(DATA_PATH, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    return [];
  }
}

async function saveProjectData(data) {
  await writeFile(DATA_PATH, JSON.stringify(data, null, 2));
}

export async function GET() {
  const data = await getProjectData();
  return NextResponse.json(data);
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const id = formData.get('id');
    const title = formData.get('title');
    const category = formData.get('category');
    const client = formData.get('client');
    const description = formData.get('description');
    const location = formData.get('location');
    const technicalDetails = formData.get('technicalDetails');
    const missions = formData.get('missions'); // comma separated

    const beforeImage = formData.get('beforeImage');
    const afterImage = formData.get('afterImage');
    const galleryFiles = formData.getAll('gallery');
    const documentFiles = formData.getAll('documents');

    if (!title || !description) {
      return NextResponse.json({ success: false, message: 'Titre et description requis' }, { status: 400 });
    }

    const projects = await getProjectData();
    let project;
    if (id) {
      project = projects.find(p => p.id.toString() === id.toString());
      if (!project) return NextResponse.json({ success: false, message: 'Projet non trouvé' }, { status: 404 });
    }

    const projectId = id ? parseInt(id) : Date.now();
    const projectSlug = title.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    const handleFileUpload = async (file, prefix) => {
      if (!file || typeof file === 'string' || file.size === 0) return '';
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Si c'est un PDF, on ne l'optimise pas comme une image
      if (file.name.toLowerCase().endsWith('.pdf')) {
        const filename = `${projectId}-${prefix}-${file.name.replace(/\s+/g, '-')}`;
        const uploadPath = path.join(process.cwd(), 'public', 'uploads', 'projets', filename);
        await writeFile(uploadPath, buffer);
        return `/uploads/projets/${filename}`;
      }

      // Pour les images, on utilise l'optimiseur "Magic"
      return await optimizeImage(buffer, 'uploads/projets', `${prefix}-${file.name}`);
    };

    const beforeImageUrl = await handleFileUpload(beforeImage, 'before') || (project ? project.images.before : '');
    const afterImageUrl = await handleFileUpload(afterImage, 'after') || (project ? project.images.after : '');
    
    const galleryUrls = project ? [...project.images.gallery] : [];
    for (const [index, file] of galleryFiles.entries()) {
      const url = await handleFileUpload(file, `gallery-${Date.now()}-${index}`);
      if (url) galleryUrls.push(url);
    }

    const documentUrls = project ? [...(project.documents || [])] : [];
    for (const [index, file] of documentFiles.entries()) {
      const url = await handleFileUpload(file, `doc-${Date.now()}-${index}`);
      if (url) {
        documentUrls.push({
          name: file.name,
          url: url
        });
      }
    }

    const updatedProject = {
      id: projectId,
      title,
      slug: projectSlug,
      category,
      client,
      description,
      location,
      technicalDetails,
      missions: missions ? missions.split(',').map(m => m.trim()) : [],
      images: {
        before: beforeImageUrl,
        after: afterImageUrl,
        gallery: galleryUrls
      },
      documents: documentUrls,
      date: project ? project.date : new Date().toISOString()
    };

    if (id) {
      const index = projects.findIndex(p => p.id.toString() === id.toString());
      projects[index] = updatedProject;
    } else {
      projects.unshift(updatedProject);
    }

    await saveProjectData(projects);

    return NextResponse.json({ success: true, project: updatedProject });
  } catch (error) {
    console.error('Project upload error:', error);
    return NextResponse.json({ success: false, message: 'Erreur lors de la création du projet' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    let data = await getProjectData();
    data = data.filter(p => p.id !== id);
    await saveProjectData(data);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
