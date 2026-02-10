import { NextRequest, NextResponse } from 'next/server';

const NOCODB_ORDERS_URL = 'https://a2db.a2cloud.link/api/v2/tables/m7u1f1wi4wr9dzz/records';
const NOCODB_API_TOKEN = process.env.NOCODB_API_TOKEN;

const STATUS_MAP: Record<string, string> = {
  paye: 'Payé',
  annule: 'Annulé',
  encours: 'En cours',
  publie: 'Publié',
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { action, recordIds } = await request.json();

    if (!action || !recordIds || !Array.isArray(recordIds) || recordIds.length === 0) {
      return NextResponse.json({ success: false, error: 'Missing action or recordIds' }, { status: 400 });
    }

    const status = STATUS_MAP[action];
    if (!status) {
      return NextResponse.json({ success: false, error: `Unknown action: ${action}` }, { status: 400 });
    }

    if (!NOCODB_API_TOKEN) {
      return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 });
    }

    // PATCH all records at once
    const patchBody = recordIds.map((id: number) => ({ Id: id, Statut: status }));

    const response = await fetch(NOCODB_ORDERS_URL, {
      method: 'PATCH',
      headers: {
        'xc-token': NOCODB_API_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patchBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('NocoDB update error:', response.status, errorText);
      return NextResponse.json({ success: false, error: 'Failed to update NocoDB' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      status,
      updatedCount: recordIds.length,
    });
  } catch (error) {
    console.error('Update status error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
