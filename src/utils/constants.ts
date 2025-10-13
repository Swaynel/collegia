export const APP_NAME = 'Collegia';
export const SUPPORT_EMAIL = 'support@collegia.com';

export const PRICING_TIERS = {
  basics: { price: 0, name: 'Basics' },
  intermediate: { price: 1500, name: 'Intermediate' },
  advanced: { price: 3000, name: 'Advanced' },
} as const;

export const COURSE_TIERS = ['basics', 'intermediate', 'advanced'] as const;

export const USER_ROLES = ['student', 'instructor', 'admin'] as const;

export const PAYMENT_STATUS = ['pending', 'completed', 'failed', 'refunded'] as const;

export const ZOOM_CLASS_STATUS = ['scheduled', 'ongoing', 'completed', 'cancelled'] as const;