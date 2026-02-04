import { NextRequest, NextResponse } from 'next/server';
import { orderSubmitSchema, type OrderSubmitInput } from '@/lib/order/validation';
import { PAYMENT_METHODS } from '@/lib/order/constants';

const NOCODB_API_URL = 'https://a2db.a2cloud.link/api/v2/tables/mselh6m97pb76ec/records';
const NOCODB_ORDERS_URL = 'https://a2db.a2cloud.link/api/v2/tables/m7u1f1wi4wr9dzz/records';
const NOCODB_API_TOKEN = process.env.NOCODB_API_TOKEN;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

interface NocoDBCreateResponse {
  Id: number;
  [key: string]: unknown;
}

async function sendTelegramNotification(
  order: OrderSubmitInput,
  recordId: number,
  orderReference: string
): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('Telegram credentials not configured');
    return;
  }

  const modeLabels: Record<string, string> = {
    lien_seul: 'Lien seul',
    article_fourni: 'Article fourni',
    redaction: 'Rédaction',
  };

  const paymentLabel = PAYMENT_METHODS[order.paymentMethod]?.label || order.paymentMethod;

  const message = `💰 *Nouvelle commande !*

🔖 Référence: *${orderReference}*
📧 Email: ${order.email}
👤 Nom: ${order.name || 'Non renseigné'}
🌐 Site: ${order.siteName} (${order.site})
📝 Mode: ${modeLabels[order.mode]}
🔗 Liens: ${order.links.length}
💵 Montant: ${order.totalPrice}€
💳 Paiement: ${paymentLabel}

⏳ Statut: En attente de vérification`;

  const inlineKeyboard = {
    inline_keyboard: [
      [
        { text: '✅ Payé', callback_data: `paye|${recordId}` },
        { text: '❌ Annuler', callback_data: `annule|${recordId}` },
      ],
      [
        { text: '🔄 En cours', callback_data: `encours|${recordId}` },
        { text: '📤 Publié', callback_data: `publie|${recordId}` },
      ],
    ],
  };

  try {
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
        reply_markup: inlineKeyboard,
      }),
    });
  } catch (error) {
    console.error('Telegram notification error:', error);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Validate input
    const parseResult = orderSubmitSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid data', details: parseResult.error.issues },
        { status: 400 }
      );
    }

    const order = parseResult.data;

    if (!NOCODB_API_TOKEN) {
      console.error('NOCODB_API_TOKEN not configured');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Map mode to NocoDB single select value
    const modeToNocoDB: Record<string, string> = {
      lien_seul: 'LIEN SOLO',
      article_fourni: 'ARTICLE FOURNI',
      redaction: 'REDACTION',
    };

    // Create order record in NocoDB (matching actual column names)
    const orderData: Record<string, unknown> = {
      Site: order.site,
      Mode: modeToNocoDB[order.mode] || order.mode,
      Email: order.email,
      Nom: order.name || null,
      Reference: order.orderReference,
      Briefing: order.briefing || null,
      Titre_Idee: order.titleIdea || null,
      Nb_Mots: order.wordCount || null,
      Nb_Liens: order.links.length,
      Montant: order.totalPrice,
      Paiement_ID: order.paymentMethod,
      Statut: 'en_attente',
      Article_URL: order.fileUrl || null,
      Date: new Date().toISOString(),
    };

    // Add individual link fields (up to 3 links)
    order.links.forEach((link, index) => {
      const num = index + 1;
      if (num <= 3) {
        orderData[`Lien${num}_URL`] = link.url;
        orderData[`Lien${num}_Ancre`] = link.anchor;
        orderData[`Lien${num}_Placement`] = link.placement;
      }
    });

    const response = await fetch(NOCODB_ORDERS_URL, {
      method: 'POST',
      headers: {
        'xc-token': NOCODB_API_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('NocoDB create error:', response.status, errorText);
      return NextResponse.json(
        { success: false, error: 'Failed to save order' },
        { status: 500 }
      );
    }

    const createdRecord: NocoDBCreateResponse = await response.json();
    const recordId = createdRecord.Id;

    // Send Telegram notification with the reference from the order
    await sendTelegramNotification(order, recordId, order.orderReference);

    return NextResponse.json({
      success: true,
      orderId: recordId,
      orderReference: order.orderReference,
      message: 'Order submitted successfully',
    });
  } catch (error) {
    console.error('Error submitting order:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
