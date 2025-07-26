'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [telegramUser, setTelegramUser] = useState<any>(null);
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initTelegram = () => {
      const tg = (window as any).Telegram?.WebApp;

      if (tg) {
        tg.ready();
        const user = tg.initDataUnsafe?.user;
        const hash = tg.initData; // ✅ именно initData, а не hash из initDataUnsafe

        if (user && hash) {
          setTelegramUser({ ...user, hash });
        } else {
          console.warn('Telegram WebApp инициализирован, но user/hash отсутствуют');
        }
      } else {
        console.warn('Telegram WebApp не найден, включён mock-режим');
        // ✅ Mock-пользователь для тестов в браузере
        setTelegramUser({
          id: 123456789,
          username: 'dev_user',
          first_name: 'Dev',
          auth_date: Math.floor(Date.now() / 1000),
          hash: 'mock_hash',
        });
      }
    };

    if (typeof window !== 'undefined') {
      setTimeout(initTelegram, 300); // немного подождать загрузку Telegram WebApp
    }
  }, []);

  const createWallet = async () => {
    if (!telegramUser) {
      alert('Telegram WebApp не инициализирован');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramUser }),
      });

      const data = await res.json();

      if (res.ok && data.wallets) {
        setWallets(data.wallets);
      } else {
        alert(data.error || 'Ошибка при создании кошелька');
      }
    } catch (err) {
      alert('Ошибка сети');
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <main className="p-4">
      <h1 className="text-xl font-bold mb-4">Solana Wallet Mini App</h1>

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
        onClick={createWallet}
        disabled={!telegramUser || loading}
      >
        {loading ? 'Создание...' : 'Создать кошелёк'}
      </button>

      <div className="mt-6 space-y-2">
        {wallets.length > 0 && (
          <>
            <h2 className="font-semibold">Ваши кошельки:</h2>
            {wallets.map((wallet, i) => (
              <p key={i} className="text-sm break-all">
                {i + 1}. {wallet.publicKey}
              </p>
            ))}
          </>
        )}
      </div>
    </main>
  );
}
