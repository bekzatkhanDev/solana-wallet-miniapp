'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [wallets, setWallets] = useState([]);
  const [telegramUser, setTelegramUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Проверяем наличие объекта Telegram
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const user = (window as any).Telegram.WebApp.initDataUnsafe;
      setTelegramUser(user);
    }
  }, []);

  const createWallet = async () => {
    if (!telegramUser) return alert("Telegram не инициализирован");

    setLoading(true);
    const res = await fetch('/api/wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telegramUser })
    });
    const data = await res.json();
    if (data.wallets) setWallets(data.wallets);
    setLoading(false);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Solana Кошельки</h1>
      <button
        onClick={createWallet}
        disabled={loading || !telegramUser}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? 'Создание...' : 'Создать кошелек'}
      </button>
      <ul className="mt-4">
        {wallets.map((w: any, i: number) => (
          <li key={i} className="mt-2 text-sm break-all">
            {i + 1}. {w.publicKey}
          </li>
        ))}
      </ul>
    </div>
  );
}
