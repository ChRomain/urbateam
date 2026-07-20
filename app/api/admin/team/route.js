import { NextResponse } from 'next/server';
import {
  getTeam,
  supabaseAdmin,
  updateItem,
  createItem,
  deleteItem,
} from '../../../../lib/supabase';
import { verifyAdminSession } from '../../../../lib/auth-helper';

/**
 * GET /api/admin/team
 * Retourne les données de l'équipe (header + membres) depuis Supabase.
 */
export async function GET(request) {
  try {
    const admin = await verifyAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teamData = await getTeam();
    return NextResponse.json(teamData);
  } catch (error) {
    console.error('[Team GET Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch team data' }, { status: 500 });
  }
}

/**
 * POST /api/admin/team
 * Sauvegarde les données de l'équipe (header + membres) dans Supabase.
 *
 * Body JSON attendu :
 * {
 *   header: {
 *     fr: { title, subtitle },
 *     en: { title, subtitle },
 *     br: { title, subtitle },
 *     teamPhoto: "url ou nom de fichier Supabase"
 *   },
 *   members: [
 *     {
 *       id: "...",
 *       image: "url ou nom de fichier Supabase",
 *       linkedin: "...",
 *       generic: false,
 *       fr: { name, role, desc, email, phone },
 *       en: { name, role, desc, email, phone },
 *       br: { name, role, desc, email, phone }
 *     }
 *   ]
 * }
 */
export async function POST(request) {
  try {
    const admin = await verifyAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { header, members } = body;

    // Helper pour extraire le nom du fichier (key) si c'est une URL publique Supabase
    const extractFilename = (urlOrName) => {
      if (!urlOrName) return null;
      if (urlOrName.includes('/storage/v1/object/public/urbateam-media/')) {
        return urlOrName.split('/storage/v1/object/public/urbateam-media/').pop();
      }
      if (urlOrName.includes('/storage/v1/render/image/public/urbateam-media/')) {
        // Enlève aussi les query params éventuels
        const pathPart = urlOrName.split('/storage/v1/render/image/public/urbateam-media/').pop();
        return pathPart.split('?')[0];
      }
      return urlOrName;
    };

    // ── 1. Mise à jour du header (team_header, id = 1) ────────────────────────
    if (header) {
      const headerPayload = {
        title_fr: header.fr?.title ?? null,
        subtitle_fr: header.fr?.subtitle ?? null,
        title_en: header.en?.title ?? null,
        subtitle_en: header.en?.subtitle ?? null,
        title_br: header.br?.title ?? null,
        subtitle_br: header.br?.subtitle ?? null,
        team_photo: extractFilename(header.teamPhoto),
      };

      const { error: headerError } = await supabaseAdmin
        .from('team_header')
        .upsert({ id: 1, ...headerPayload });

      if (headerError) {
        console.error('[Team POST] Erreur mise à jour header:', headerError.message);
        return NextResponse.json({ success: false, message: headerError.message }, { status: 500 });
      }
    }

    // ── 2. Mise à jour des membres ─────────────────────────────────────────────
    if (Array.isArray(members)) {
      // Récupère les IDs existants dans la DB
      const { data: existingMembers } = await supabaseAdmin
        .from('team_members')
        .select('id');

      const existingIds = new Set((existingMembers || []).map(m => String(m.id)));
      const incomingIds = new Set(members.map(m => String(m.id)));

      // Supprimer les membres retirés
      for (const existingId of existingIds) {
        if (!incomingIds.has(existingId)) {
          await deleteItem('team_members', existingId);
        }
      }

      // Créer ou mettre à jour chaque membre
      for (let i = 0; i < members.length; i++) {
        const m = members[i];
        const memberPayload = {
          name_fr: m.fr?.name ?? null,
          role_fr: m.fr?.role ?? null,
          desc_fr: m.fr?.desc ?? null,
          name_en: m.en?.name ?? null,
          role_en: m.en?.role ?? null,
          desc_en: m.en?.desc ?? null,
          name_br: m.br?.name ?? null,
          role_br: m.br?.role ?? null,
          desc_br: m.br?.desc ?? null,
          email: m.fr?.email ?? null,
          phone: m.fr?.phone ?? null,
          linkedin: m.linkedin ?? null,
          generic: m.generic ?? false,
          image: extractFilename(m.image),
          sort: i,
          status: 'published',
        };

        if (existingIds.has(String(m.id))) {
          await updateItem('team_members', m.id, memberPayload);
        } else {
          await createItem('team_members', { ...memberPayload });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Team POST Error]:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
