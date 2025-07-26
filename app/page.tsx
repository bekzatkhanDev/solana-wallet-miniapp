'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [telegramUser, setTelegramUser] = useState<any>(null);
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Инициализация Telegram WebApp
  useEffect(() => {
    const initTelegram = () => {
      const tg = (window as any).Telegram?.WebApp;

      if (tg) {
        tg.ready();
        const user = tg.initDataUnsafe?.user;
        const hash = tg.initData;

        if (user && hash) {
          setTelegramUser({ ...user, hash });
        } else {
          console.warn('Telegram WebApp загружен, но user/hash отсутствуют');
        }
      } else {
        console.warn('Telegram WebApp не найден. Используется MOCK-пользователь');
        // Мок-пользователь для разработки вне Telegram
        setTelegramUser({
          id: 999999,
          username: 'dev_mock',
          first_name: 'Mock',
          auth_date: Math.floor(Date.now() / 1000),
          hash: 'mock_hash',
        });
      }
    };

    if (typeof window !== 'undefined') {
      setTimeout(initTelegram, 200); // даём время Telegram загрузиться
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
    } catch (error) {
      alert('Ошибка сети');
    }

    setLoading(false);
  };

  return (
    <main className="p-4">
      <h1 className="text-xl font-bold mb-4">🪙 Solana Mini App</h1>

      <button
        onClick={createWallet}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
        disabled={!telegramUser || loading}
      >
        {loading ? 'Создание...' : 'Создать кошелёк'}
      </button>

      <div className="mt-6 space-y-2">
        {wallets.length > 0 && (
          <>
            <h2 className="font-semibold">Ваши кошельки:</h2>
            {wallets.map((wallet, index) => (
              <p key={index} className="text-sm break-all">
                {index + 1}. {wallet.publicKey}
              </p>
            ))}
          </>
        )}
      </div>
    </main>
  );
}
