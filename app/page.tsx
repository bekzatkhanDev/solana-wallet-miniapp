'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [telegramUser, setTelegramUser] = useState<any>(null);
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initTelegram = () => {
      const tg = (window as any)?.Telegram?.WebApp;

      if (tg) {
        tg.ready();
        const user = tg.initDataUnsafe?.user;
        if (user) {
          setTelegramUser({
            id: user.id,
            username: user.username,
            hash: tg.initData,
          });
        } else {
          console.warn('Telegram WebApp загружен, но user отсутствует');
        }
      } else {
        // Мок-режим для локального браузера или вне Telegram
        console.warn('Telegram WebApp недоступен. Используется mock-режим.');
        setTelegramUser({
          id: 123456789,
          username: 'mock_user',
          hash: 'mock_hash',
        });
      }
    };

    if (typeof window !== 'undefined') {
      // Задержка нужна, чтобы Telegram успел подгрузиться
      setTimeout(initTelegram, 200);
    }
  }, []);

  const createWallet = async () => {
    if (!telegramUser) {
      alert('Telegram WebApp не инициализирован');
      return;
    }

    setLoading(true);

    const res = await fetch('/api/wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telegramUser }),
    });

    const data = await res.json();
    if (data.wallets) {
      setWallets(data.wallets);
    } else {
      alert(data.error || 'Ошибка при создании кошелька');
    }

    setLoading(false);
  };

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-4">Solana Кошельки</h1>

      <button
        onClick={createWallet}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
        disabled={!telegramUser || loading}
      >
        {loading ? 'Создание...' : 'Создать кошелёк'}
      </button>

      <div className="mt-6">
        {wallets.map((wallet, index) => (
          <p key={index} className="break-all text-sm">
            {index + 1}. {wallet.publicKey}
          </p>
        ))}
      </div>
    </main>
  );
}
