import { NextResponse } from 'next/server';
export const dynamic = 'force-static';

import { writeFile, readFile } from 'fs/promises';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'public', 'data', 'stats.json');

async function getStats() {
  try {
    const content = await readFile(DATA_PATH, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    return { totalVisits: 0, pages: {}, articles: {} };
  }
}

async function saveStats(data) {
  await writeFile(DATA_PATH, JSON.stringify(data, null, 2));
}

export async function GET() {
  const data = await getStats();
  return NextResponse.json(data);
}

export async function POST(request) {
  try {
    const { path: pagePath, isArticle } = await request.json();
    const userAgent = request.headers.get('user-agent') || '';
    const data = await getStats();
    
    // Initialisation si nécessaire
    if (!data.daily) data.daily = {};
    if (!data.devices) data.devices = { Desktop: 0, Mobile: 0, Tablet: 0 };
    if (!data.browsers) data.browsers = {};
    
    const today = new Date().toISOString().split('T')[0];
    
    // Update KPI
    data.totalVisits = (data.totalVisits || 0) + 1;
    data.daily[today] = (data.daily[today] || 0) + 1;
    
    // Page/Article tracking
    if (isArticle) {
      data.articles[pagePath] = (data.articles[pagePath] || 0) + 1;
    } else {
      data.pages[pagePath] = (data.pages[pagePath] || 0) + 1;
    }

    // Basic Device Detection
    if (/mobile/i.test(userAgent)) {
      data.devices.Mobile++;
    } else if (/tablet|ipad/i.test(userAgent)) {
      data.devices.Tablet++;
    } else {
      data.devices.Desktop++;
    }

    // Basic Browser Detection
    let browser = "Autre";
    if (/chrome|crios/i.test(userAgent)) browser = "Chrome";
    else if (/safari/i.test(userAgent)) browser = "Safari";
    else if (/firefox/i.test(userAgent)) browser = "Firefox";
    else if (/edg/i.test(userAgent)) browser = "Edge";
    
    data.browsers[browser] = (data.browsers[browser] || 0) + 1;
    
    await saveStats(data);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
