// app/api/wallet/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initFirebaseAdmin } from '@/lib/firebase-admin';
import { verifyTelegramPayload } from '@/utils/telegram';
import { createWallet } from '@/lib/solana';

initFirebaseAdmin();

export async function POST(req: NextRequest) {
  const db = getFirestore();
  const body = await req.json();
  const { telegramUser } = body;

  if (!verifyTelegramPayload(telegramUser)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userRef = db.collection('users').doc(`${telegramUser.id}`);
  const doc = await userRef.get();
  let wallets = doc.exists ? doc.data()?.wallets || [] : [];

  if (wallets.length >= 5) {
    return NextResponse.json({ error: 'Максимум 5 кошельков' }, { status: 400 });
  }

  const newWallet = createWallet();
  wallets.push({
    ...newWallet,
    createdAt: new Date().toISOString()
  });

  await userRef.set({ telegram_id: telegramUser.id, wallets }, { merge: true });

  await db.collection('logs').add({
    action: 'create_wallet',
    telegram_id: telegramUser.id,
    timestamp: new Date().toISOString()
  });

  return NextResponse.json({ wallets });
}
