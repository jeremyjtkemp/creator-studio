import 'dotenv/config';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { authMiddleware } from './middleware/auth';
import { setEnvContext, clearEnvContext } from './lib/env';
import { generateAIHooks } from './lib/ai-service';

type Env = {
  RUNTIME?: string;
  [key: string]: any;
};

const app = new Hono<{ Bindings: Env }>();

// In Node.js environment, set environment context from process.env
if (typeof process !== 'undefined' && process.env) {
  setEnvContext(process.env);
}

// Environment context middleware - detect runtime using RUNTIME env var
app.use('*', async (c, next) => {
  if (c.env?.RUNTIME === 'cloudflare') {
    setEnvContext(c.env);
  }
  
  await next();
  // No need to clear context - env vars are the same for all requests
  // In fact, clearing the context would cause the env vars to potentially be unset for parallel requests
});

// Middleware
app.use('*', logger());
app.use('*', cors());

// Health check route - public
app.get('/', (c) => c.json({ status: 'ok', message: 'API is running' }));

// API routes
const api = new Hono();

// Public routes go here (if any)
api.get('/hello', (c) => {
  return c.json({
    message: 'Hello from Hono!',
  });
});

// Health check route - Firebase only setup
api.get('/health', async (c) => {
  return c.json({
    status: 'ok',
    message: 'Creator Studio API is running',
    database: 'Firebase Firestore',
    timestamp: new Date().toISOString(),
  });
});

// Protected routes - require authentication
const protectedRoutes = new Hono();

protectedRoutes.use('*', authMiddleware);

protectedRoutes.get('/me', (c) => {
  const user = c.get('user');
  return c.json({
    user,
    message: 'You are authenticated!',
  });
});

// Generate AI hooks for projects
protectedRoutes.post('/hooks/generate', async (c) => {
  const user = c.get('user');
  
  try {
    const { appDescription, projectName, hookCount = 10 } = await c.req.json();
    
    if (!appDescription) {
      return c.json({ error: 'App description is required' }, 400);
    }

    console.log(`🎯 Generating ${hookCount} hooks for user ${user.id}`);
    console.log(`📱 Project: ${projectName || 'Unknown'}`);
    console.log(`📝 Description: ${appDescription.substring(0, 100)}...`);
    
    const hooks = await generateAIHooks(appDescription, projectName, hookCount);
    
    console.log(`✅ Successfully generated ${hooks.length} hooks`);
    
    return c.json({ 
      hooks,
      generated: hooks.length,
      timestamp: new Date().toISOString(),
      success: true
    });
    
  } catch (error) {
    console.error('❌ Hook generation error:', error);
    return c.json({ 
      error: 'Failed to generate hooks',
      details: error instanceof Error ? error.message : 'Unknown error',
      success: false
    }, 500);
  }
});

// Mount the protected routes under /protected
api.route('/protected', protectedRoutes);

// Mount the API router
app.route('/api/v1', api);

export default app; 