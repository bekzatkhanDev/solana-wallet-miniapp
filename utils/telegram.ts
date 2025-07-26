import crypto from 'crypto';

export function verifyTelegramPayload(payload: {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
  auth_date?: number;
  hash: string;
}) {
  const { hash, ...rest } = payload;

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error('TELEGRAM_BOT_TOKEN не установлен');
    return false;
  }

  const secret = crypto.createHash('sha256').update(token).digest();
  const dataCheckString = Object.entries(rest)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  const hmac = crypto
    .createHmac('sha256', secret)
    .update(dataCheckString)
    .digest('hex');

  return hmac === hash;
}
