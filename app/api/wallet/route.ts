import { NextRequest, NextResponse } from 'next/server';
import { verifyTelegramPayload } from '@/utils/telegram';
import { createWallet } from '@/lib/solana';
import { initFirebaseAdmin } from '@/lib/firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const telegramUser = body.telegramUser;

  console.log('📦 Получен пользователь:', telegramUser);

  // ✅ Проверка подписи только в production
  if (process.env.NODE_ENV === 'production') {
    const isValid = verifyTelegramPayload(telegramUser);
    if (!isValid) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
  }

  try {
    initFirebaseAdmin();
    const db = getFirestore();

    const walletsRef = db.collection('wallets');
    const snapshot = await walletsRef
      .where('telegramId', '==', telegramUser.id)
      .get();

    if (snapshot.size >= 5) {
      return NextResponse.json({ error: 'Максимум 5 кошельков' }, { status: 400 });
    }

    const newWallet = await createWallet();

    await walletsRef.add({
      telegramId: telegramUser.id,
      publicKey: newWallet.publicKey,
      privateKey: newWallet.secretKey,
      createdAt: new Date(),
    });

    const updatedWallets = await walletsRef
      .where('telegramId', '==', telegramUser.id)
      .get();

    const wallets = updatedWallets.docs.map((doc) => doc.data());

    return NextResponse.json({ wallets });
  } catch (err) {
    console.error('Ошибка в /api/wallet:', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
