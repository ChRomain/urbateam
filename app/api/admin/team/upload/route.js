import { NextResponse } from 'next/server';
import { uploadFile, getLogoUrl } from '../../../../../lib/supabase';
import { verifyAdminSession } from '../../../../../lib/auth-helper';

/**
 * POST /api/admin/team/upload
 * Upload une image de membre ou de photo d'équipe vers Supabase Storage.
 *
 * FormData attendu :
 *   - file        : le fichier image
 *   - memberId    : (optionnel) ID du membre concerné
 *   - isTeamPhoto : (optionnel) 'true' si c'est la photo d'équipe principale
 */
export async function POST(request) {
  try {
    const admin = await verifyAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const memberId = formData.get('memberId');
    const isTeamPhoto = formData.get('isTeamPhoto') === 'true';

    if (!file || typeof file === 'string' || file.size === 0) {
      return NextResponse.json({ success: false, message: 'Aucun fichier fourni' }, { status: 400 });
    }

    const uploadedName = await uploadFile(file);
    if (!uploadedName) {
      return NextResponse.json({ success: false, message: "Échec de l'upload sur Supabase Storage" }, { status: 500 });
    }

    const url = getLogoUrl(uploadedName);

    return NextResponse.json({
      success: true,
      url,
      fileName: uploadedName,
      memberId: memberId || null,
      isTeamPhoto,
    });
  } catch (error) {
    console.error('[Team Upload Error]:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
