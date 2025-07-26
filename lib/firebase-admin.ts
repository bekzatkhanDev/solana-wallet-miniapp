import { initializeApp, cert, getApps } from 'firebase-admin/app';

export const initFirebaseAdmin = () => {
  if (!getApps().length) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

    if (!privateKey || !clientEmail) {
      throw new Error("Firebase credentials are not set");
    }

    initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      })
    });
  }
};
