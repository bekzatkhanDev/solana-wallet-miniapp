import type { NextApiRequest, NextApiResponse } from 'next';
import { getFirestore } from 'firebase-admin/firestore';
import { initFirebaseAdmin } from '@/lib/firebase-admin';
import { verifyTelegramPayload } from '@/utils/telegram';
import { createWallet } from '@/lib/solana';

initFirebaseAdmin();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = getFirestore();
  const { telegramUser } = req.body;

  if (!verifyTelegramPayload(telegramUser)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userRef = db.collection('users').doc(`${telegramUser.id}`);
  const doc = await userRef.get();
  let wallets = doc.exists ? doc.data()?.wallets || [] : [];

  if (wallets.length >= 5) {
    return res.status(400).json({ error: 'Максимум 5 кошельков' });
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

  return res.status(200).json({ wallets });
}