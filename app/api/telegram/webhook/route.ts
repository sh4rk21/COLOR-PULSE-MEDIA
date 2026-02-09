import { NextRequest, NextResponse } from 'next/server';

const NOCODB_ORDERS_URL = 'https://a2db.a2cloud.link/api/v2/tables/m7u1f1wi4wr9dzz/records';
const NOCODB_API_TOKEN = process.env.NOCODB_API_TOKEN;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const STATUS_MAP: Record<string, { nocodb: string; label: string }> = {
  paye:    { nocodb: 'paye',      label: 'Payé' },
  annule:  { nocodb: 'annule',    label: 'Annulé' },
  encours: { nocodb: 'en_cours',  label: 'En cours' },
  publie:  { nocodb: 'publie',    label: 'Publié' },
};

async function answerCallbackQuery(callbackQueryId: string, text: string): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN) return;
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackQueryId, text }),
  });
}

async function editMessageReplyMarkup(
  chatId: number | string,
  messageId: number,
  currentAction: string,
  recordIds: string
): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN) return;

  // Rebuild keyboard with the selected button highlighted
  const buttons = [
    [
      { text: `${currentAction === 'paye' ? '>> ' : ''}Payé`, callback_data: `paye|${recordIds}` },
      { text: `${currentAction === 'annule' ? '>> ' : ''}Annuler`, callback_data: `annule|${recordIds}` },
    ],
    [
      { text: `${currentAction === 'encours' ? '>> ' : ''}En cours`, callback_data: `encours|${recordIds}` },
      { text: `${currentAction === 'publie' ? '>> ' : ''}Publié`, callback_data: `publie|${recordIds}` },
    ],
  ];

  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageReplyMarkup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      reply_markup: { inline_keyboard: buttons },
    }),
  });
}

async function updateNocoDBStatus(recordId: string, status: string): Promise<boolean> {
  if (!NOCODB_API_TOKEN) return false;

  const response = await fetch(NOCODB_ORDERS_URL, {
    method: 'PATCH',
    headers: {
      'xc-token': NOCODB_API_TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ Id: parseInt(recordId, 10), Statut: status }),
  });

  return response.ok;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Telegram sends callback_query when inline button is clicked
    const callbackQuery = body.callback_query;
    if (!callbackQuery) {
      return NextResponse.json({ ok: true });
    }

    const callbackData: string = callbackQuery.data || '';
    const callbackQueryId: string = callbackQuery.id;
    const chatId = callbackQuery.message?.chat?.id;
    const messageId = callbackQuery.message?.message_id;

    // Parse: "action|id1,id2,id3"
    const [action, idsString] = callbackData.split('|');
    if (!action || !idsString || !STATUS_MAP[action]) {
      await answerCallbackQuery(callbackQueryId, 'Action inconnue');
      return NextResponse.json({ ok: true });
    }

    const recordIds = idsString.split(',').filter(Boolean);
    const statusInfo = STATUS_MAP[action];

    // Update all records in NocoDB
    let allSuccess = true;
    for (const id of recordIds) {
      const success = await updateNocoDBStatus(id, statusInfo.nocodb);
      if (!success) allSuccess = false;
    }

    // Answer the callback (toast in Telegram)
    const count = recordIds.length;
    const toastText = allSuccess
      ? `${statusInfo.label} (${count} commande${count > 1 ? 's' : ''})`
      : 'Erreur lors de la mise a jour';
    await answerCallbackQuery(callbackQueryId, toastText);

    // Update the keyboard to highlight the selected button
    if (chatId && messageId) {
      await editMessageReplyMarkup(chatId, messageId, action, idsString);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ ok: true });
  }
}
