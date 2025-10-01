import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://sonyiatltmqdyoezfbnj.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvbnlpYXRsdG1xZHlvZXpmYm5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMDE2MTksImV4cCI6MjA3NDg3NzYxOX0.qr76yAQ8Rrjx9dvwWggx3hOURqwO0pp4gXiahRn86Dc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: any;
    }
  }
}

export async function authenticateUser(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.substring(7);

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return next();
    }

    req.userId = user.id;
    req.user = user;
  } catch (error) {
    console.error('Auth error:', error);
  }

  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
}
