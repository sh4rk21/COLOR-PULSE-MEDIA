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
  'Discover Score': number | string;
  'VUE DISCOVER': number | string;
  'Google News': boolean | string;
  'URL GNEWS': string | null;
  TF: string;
  CF: string;
  RD: string;
  DR: string;
}

interface NocoDBResponse {
  list: NocoDBSiteRecord[];
}

function parsePrice(value: string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? null : parsed;
}

function parseNocoDBRecord(record: NocoDBSiteRecord): SitePricing {
  return {
    Id: record.Id,
    Site: record.Site,
    Nom: record.Nom,
    Langue: record.Langue,
    Thematique: record.Thematique,
    Prix_Lien: parsePrice(record.Prix_Lien),
    Prix_Lien_Sup: parsePrice(record.Prix_Lien_Sup),
    Prix_Article: parsePrice(record.Prix_Article),
    Prix_Article_Redige: parsePrice(record.Prix_Article_Redige),
    Prix_500_Mots: parsePrice(record.Prix_500_Mots),
    Prix_800_Mots: parsePrice(record.Prix_800_Mots),
    Prix_1000_Mots: parsePrice(record.Prix_1000_Mots),
    Prix_1500_Mots: parsePrice(record.Prix_1500_Mots),
    Actif: record.Actif === 'true' || record.Actif === '1',
    Discover_Score: Number(record['Discover Score']) || 0,
    Discover_Views: Number(record['VUE DISCOVER']) || 0,
    Google_News: record['Google News'] === true || record['Google News'] === 'true' || record['Google News'] === '1',
    Google_News_URL: record['URL GNEWS'] || null,
    TF: parseInt(record.TF, 10) || 0,
    CF: parseInt(record.CF, 10) || 0,
    RD: parseInt(record.RD, 10) || 0,
    DR: Math.round(parseFloat(String(record.DR)) || 0),
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
