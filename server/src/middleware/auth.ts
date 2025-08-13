import { MiddlewareHandler } from 'hono';
import { verifyFirebaseToken } from '../lib/firebase-auth';
import { getFirebaseProjectId } from '../lib/env';

// Simple user type based on Firebase user
interface FirebaseUser {
  id: string;
  email: string;
  display_name?: string;
  photo_url?: string;
}

declare module 'hono' {
  interface ContextVariableMap {
    user: FirebaseUser;
  }
}

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const token = authHeader.split('Bearer ')[1];
    const firebaseProjectId = getFirebaseProjectId();
    const firebaseUser = await verifyFirebaseToken(token, firebaseProjectId);

    // Use Firebase user directly - no PostgreSQL needed
    const user: FirebaseUser = {
      id: firebaseUser.id,
      email: firebaseUser.email!,
      display_name: firebaseUser.display_name || null,
      photo_url: firebaseUser.photo_url || null,
    };

    c.set('user', user);
    await next();
  } catch (error) {
    console.error('Auth error:', error);
    return c.json({ error: 'Unauthorized' }, 401);
  }
}; 