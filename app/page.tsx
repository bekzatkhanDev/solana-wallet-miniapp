'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [telegramUser, setTelegramUser] = useState<any>(null);
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      tg.ready(); // обязательно вызываем

      const user = tg.initDataUnsafe?.user;
      if (user) {
        setTelegramUser({
          id: user.id,
          username: user.username,
          hash: tg.initData,
        });
      }
    }
  }, []);

  const createWallet = async () => {
    if (!telegramUser) return alert("Telegram WebApp не инициализирован");

    setLoading(true);

    const res = await fetch('/api/wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telegramUser })
    });

    const data = await res.json();
    if (data.wallets) setWallets(data.wallets);
    else alert(data.error || 'Ошибка');

    setLoading(false);
  };

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold mb-4">Solana Кошельки</h1>

      <button
        onClick={createWallet}
        disabled={!telegramUser || loading}
        className={`px-4 py-2 rounded text-white ${(!telegramUser || loading) ? 'bg-gray-400' : 'bg-blue-500'}`}
      >
        {loading ? 'Создание...' : 'Создать кошелёк'}
      </button>

      <div className="mt-4">
        {wallets.map((w, i) => (
          <p key={i} className="text-sm mt-2 break-all">
            {i + 1}. {w.publicKey}
          </p>
        ))}
      </div>
    </div>
  );
}
