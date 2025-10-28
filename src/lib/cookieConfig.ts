// lib/cookieConfig.ts
export const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
    //the browser handles it
  };
};

export const getAccessTokenOptions = () => ({
  ...getCookieOptions(),
  maxAge: 15 * 60, // 15 minutes
});

export const getRefreshTokenOptions = () => ({
  ...getCookieOptions(),
  maxAge: 7 * 24 * 60 * 60, // 7 days
});