import { NextRequest, NextResponse } from 'next/server';
import { multiOrderSubmitSchema, type MultiOrderSubmitInput } from '@/lib/order/validation';
import { PAYMENT_METHODS } from '@/lib/order/constants';

const NOCODB_ORDERS_URL = 'https://a2db.a2cloud.link/api/v2/tables/m7u1f1wi4wr9dzz/records';
const NOCODB_API_TOKEN = process.env.NOCODB_API_TOKEN;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendMultiTelegramNotification(
  order: MultiOrderSubmitInput,
  recordIds: number[]
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

  const itemsDetail = order.items
    .map((item, i) => `  ${i + 1}. ${item.siteName} (${item.site})\n     ${modeLabels[item.mode]} | ${item.links.length} liens | ${item.price}€`)
    .join('\n');

  const message = `💰 *Nouvelle commande MULTI (${order.items.length} sites) !*

🔖 Référence: *${order.orderReference}*
📧 Email: ${order.email}
👤 Nom: ${order.name || 'Non renseigné'}

📋 *Détail des sites:*
${itemsDetail}

💵 *Montant total: ${order.totalPrice}€*
💳 Paiement: ${paymentLabel}

⏳ Statut: En attente de vérification`;

  const idsParam = recordIds.join(',');
  const inlineKeyboard = {
    inline_keyboard: [
      [
        { text: '✅ Payé', callback_data: `paye|${idsParam}` },
        { text: '❌ Annuler', callback_data: `annule|${idsParam}` },
      ],
      [
        { text: '🔄 En cours', callback_data: `encours|${idsParam}` },
        { text: '📤 Publié', callback_data: `publie|${idsParam}` },
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
    const parseResult = multiOrderSubmitSchema.safeParse(body);
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

    const modeToNocoDB: Record<string, string> = {
      lien_seul: 'LIEN SOLO',
      article_fourni: 'ARTICLE FOURNI',
      redaction: 'REDACTION',
    };

    // Create one NocoDB record per item, all sharing the same reference
    const recordIds: number[] = [];

    for (const item of order.items) {
      const orderData: Record<string, unknown> = {
        Site: item.site,
        Mode: modeToNocoDB[item.mode] || item.mode,
        Email: order.email,
        Nom: order.name || null,
        Reference: order.orderReference,
        Briefing: item.briefing || null,
        Titre_Idee: item.titleIdea || null,
        Nb_Mots: item.wordCount || null,
        Nb_Liens: item.links.length,
        Montant: item.price,
        Paiement_ID: order.paymentMethod,
        Statut: 'en_attente',
        Article_URL: item.fileUrl || null,
        Date: new Date().toISOString(),
      };

      // Add individual link fields (up to 3 links)
      item.links.forEach((link, index) => {
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
          { success: false, error: `Failed to save order for ${item.site}` },
          { status: 500 }
        );
      }

      const createdRecord = await response.json();
      recordIds.push(createdRecord.Id);
    }

    // Send single Telegram notification with all items
    await sendMultiTelegramNotification(order, recordIds);

    return NextResponse.json({
      success: true,
      orderIds: recordIds,
      orderReference: order.orderReference,
      message: `${order.items.length} order(s) submitted successfully`,
    });
  } catch (error) {
    console.error('Error submitting multi order:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
