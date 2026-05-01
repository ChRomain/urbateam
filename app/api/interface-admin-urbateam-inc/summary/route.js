import { NextResponse } from 'next/server';
export const dynamic = 'force-static';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  const dataDir = path.join(process.cwd(), 'public/data');
  
  const safeReadJSON = async (filename, fallback) => {
    try {
      const filePath = path.join(dataDir, filename);
      const content = await fs.readFile(filePath, 'utf-8');
      if (!content.trim()) return fallback;
      return JSON.parse(content);
    } catch (err) {
      console.error(`Error reading ${filename}:`, err.message);
      return fallback;
    }
  };

  try {
    const [blog, social, stats, team, faq, projets] = await Promise.all([
      safeReadJSON('blog.json', []),
      safeReadJSON('social.json', []),
      safeReadJSON('stats.json', { totalVisits: 0, pages: {}, articles: {} }),
      safeReadJSON('team.json', { members: [] }),
      safeReadJSON('faq.json', []),
      safeReadJSON('projets.json', [])
    ]);

    // Format KPIs
    const kpis = {
      totalArticles: Array.isArray(blog) ? blog.length : 0,
      totalSocial: Array.isArray(social) ? social.length : 0,
      totalVisits: stats?.totalVisits || 0,
      totalTeam: (Array.isArray(team?.members) ? team.members.length : (Array.isArray(team) ? team.length : 0)),
      totalFaq: Array.isArray(faq) ? faq.length : 0,
      totalProjets: Array.isArray(projets) ? projets.length : 0
    };

    // Recent activity mock
    const recentActivity = [
      { id: 1, action: "Dernière visite", target: "Page d'accueil", date: new Date().toISOString(), type: 'stats' },
      { id: 2, action: "Contenu Blog", target: `${kpis.totalArticles} articles publiés`, date: new Date().toISOString(), type: 'blog' },
      { id: 3, action: "Galerie Photos", target: `${kpis.totalSocial} images en ligne`, date: new Date().toISOString(), type: 'social' }
    ];

    return NextResponse.json({
      success: true,
      kpis,
      stats,
      recentActivity
    });
  } catch (err) {
    console.error('Summary API Error:', err);
    return NextResponse.json({ 
      success: false, 
      error: err.message,
      kpis: { totalArticles: 0, totalSocial: 0, totalVisits: 0, totalTeam: 0, totalFaq: 0, totalProjets: 0 },
      recentActivity: []
    }, { status: 200 }); // Return success:false but 200 to allow UI to handle it gracefully
  }
}
