import { NextRequest, NextResponse } from 'next/server';
import type { SitePricing, PricingResult } from '@/lib/order/types';

const NOCODB_API_URL = 'https://a2db.a2cloud.link/api/v2/tables/mbk7x65sgr10nud/records';
const NOCODB_API_TOKEN = process.env.NOCODB_API_TOKEN;

// NocoDB returns strings, we need to parse them
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

export async function GET(request: NextRequest): Promise<NextResponse<PricingResult>> {
  const searchParams = request.nextUrl.searchParams;
  const site = searchParams.get('site');

  if (!site) {
    return NextResponse.json(
      { success: false, error: 'Site parameter is required' },
      { status: 400 }
    );
  }

  if (!NOCODB_API_TOKEN) {
    console.error('NOCODB_API_TOKEN not configured');
    return NextResponse.json(
      { success: false, error: 'Server configuration error' },
      { status: 500 }
    );
  }

  try {
    const url = `${NOCODB_API_URL}?where=(Site,eq,${encodeURIComponent(site)})`;

    const response = await fetch(url, {
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
        { success: false, error: 'Failed to fetch pricing data' },
        { status: 500 }
      );
    }

    const data: NocoDBResponse = await response.json();

    if (!data.list || data.list.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Site not found' },
        { status: 404 }
      );
    }

    const pricing = parseNocoDBRecord(data.list[0]);

    if (!pricing.Actif) {
      return NextResponse.json(
        { success: false, error: 'Site is not available' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, pricing });
  } catch (error) {
    console.error('Error fetching pricing:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
