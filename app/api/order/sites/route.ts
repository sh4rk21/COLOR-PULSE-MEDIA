import { NextResponse } from 'next/server';
import type { SitePricing } from '@/lib/order/types';

const NOCODB_API_URL = 'https://a2db.a2cloud.link/api/v2/tables/mbk7x65sgr10nud/records';
const NOCODB_API_TOKEN = process.env.NOCODB_API_TOKEN;

interface NocoDBSiteRecord {
  Id: number;
  Site: string;
  Nom: string;
  Langue: string;
  Thematique: string;
  Prix_Lien: string;
  Prix_Lien_Sup: string;
  Prix_Article: string;
  Prix_Article_Redige: string;
  Prix_500_Mots: string;
  Prix_800_Mots: string;
  Prix_1000_Mots: string;
  Prix_1500_Mots: string;
  Actif: string;
}

interface NocoDBResponse {
  list: NocoDBSiteRecord[];
}

function parseNocoDBRecord(record: NocoDBSiteRecord): SitePricing {
  return {
    Id: record.Id,
    Site: record.Site,
    Nom: record.Nom,
    Langue: record.Langue,
    Thematique: record.Thematique,
    Prix_Lien: parseInt(record.Prix_Lien, 10) || 0,
    Prix_Lien_Sup: parseInt(record.Prix_Lien_Sup, 10) || 0,
    Prix_Article: parseInt(record.Prix_Article, 10) || 0,
    Prix_Article_Redige: parseInt(record.Prix_Article_Redige, 10) || 0,
    Prix_500_Mots: parseInt(record.Prix_500_Mots, 10) || 0,
    Prix_800_Mots: parseInt(record.Prix_800_Mots, 10) || 0,
    Prix_1000_Mots: parseInt(record.Prix_1000_Mots, 10) || 0,
    Prix_1500_Mots: parseInt(record.Prix_1500_Mots, 10) || 0,
    Actif: record.Actif === 'true' || record.Actif === '1',
  };
}

export async function GET(): Promise<NextResponse> {
  if (!NOCODB_API_TOKEN) {
    console.error('NOCODB_API_TOKEN not configured');
    return NextResponse.json(
      { success: false, error: 'Server configuration error' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(`${NOCODB_API_URL}?limit=100`, {
      method: 'GET',
      headers: {
        'xc-token': NOCODB_API_TOKEN,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('NocoDB API error:', response.status, await response.text());
      return NextResponse.json(
        { success: false, error: 'Failed to fetch sites' },
        { status: 500 }
      );
    }

    const data: NocoDBResponse = await response.json();

    // Filter active sites and parse them
    const sites = data.list
      .map(parseNocoDBRecord)
      .filter((site) => site.Actif)
      .sort((a, b) => a.Nom.localeCompare(b.Nom));

    return NextResponse.json({ success: true, sites });
  } catch (error) {
    console.error('Error fetching sites:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
