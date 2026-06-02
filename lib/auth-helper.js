/**
 * lib/auth-helper.js
 * Utilitaire d'authentification pour sécuriser les routes d'API d'administration
 */

import { getCurrentUser } from './supabase';

/**
 * Valide si la requête provient bien d'un administrateur connecté
 * @param {Request} request 
 * @returns {Promise<Object|null>} L'utilisateur authentifié ou null
 */
export async function verifyAdminSession(request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const token = cookieHeader.split('; ').find(row => row.startsWith('admin_session='))?.split('=')[1];

    if (!token) {
      return null;
    }

    const user = await getCurrentUser(token);
    
    // Vérification stricte de l'email administrateur officiel
    if (!user || user.email !== 'admin@urbateam.fr') {
      return null;
    }

    return user;
  } catch (err) {
    console.error('[Verify Admin Session Error]:', err);
    return null;
  }
}
