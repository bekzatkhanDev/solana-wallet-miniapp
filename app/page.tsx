'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [telegramUser, setTelegramUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [wallets, setWallets] = useState([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const tg = (window as any).Telegram?.WebApp;
      
      if (tg) {
        tg.ready(); // важно!
        const user = tg.initDataUnsafe?.user;

        if (user) {
          setTelegramUser({
            id: user.id,
            username: user.username,
            hash: tg.initData
          });
        } else {
          console.warn('initDataUnsafe.user отсутствует');
        }
      } else {
        console.warn('Telegram WebApp недоступен');
      }
    }
  }, []);

  const createWallet = async () => {
    if (!telegramUser) {
      alert("Telegram WebApp не инициализирован");
      return;
    }

    setLoading(true);

    const res = await fetch('/api/wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telegramUser })
    });

    const data = await res.json();
    if (data.wallets) setWallets(data.wallets);
    else alert(data.error || 'Ошибка при создании кошелька');

    setLoading(false);
  };

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold mb-4">Solana Кошельки</h1>

      <button
        onClick={createWallet}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? 'Создание...' : 'Создать кошелёк'}
      </button>

      <div className="mt-4">
        {wallets.map((w, i) => (
          <p key={i} className="text-sm break-all">
            {i + 1}. {w.publicKey}
          </p>
        ))}
      </div>
    </div>
  );
}
