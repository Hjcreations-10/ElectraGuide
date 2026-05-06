import jwt from 'jsonwebtoken';

export const generateToken = (id: string, role: string): string => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'fallback_secret_change_this',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as any
  );
};

export const generateRefreshToken = (id: string): string => {
  return jwt.sign(
    { id },
    process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
    { expiresIn: '30d' } as any
  );
};
