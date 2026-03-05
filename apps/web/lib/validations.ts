import { z } from 'zod';

// ---------------------------------------------------------------------------
// Activity Post
// ---------------------------------------------------------------------------

export const createActivityPostSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be 200 characters or fewer'),
  description: z
    .string()
    .max(2000, 'Description must be 2000 characters or fewer')
    .optional(),
  activityType: z.string(),
  postType: z.enum(['im_going', 'open_permit', 'lfg']),
  locationName: z
    .string()
    .max(200, 'Location name must be 200 characters or fewer')
    .optional(),
  activityDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  maxParticipants: z
    .number()
    .int()
    .min(2, 'Must allow at least 2 participants')
    .max(100, 'Cannot exceed 100 participants')
    .optional(),
});

export type CreateActivityPostInput = z.infer<typeof createActivityPostSchema>;

// ---------------------------------------------------------------------------
// Review
// ---------------------------------------------------------------------------

export const createReviewSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
  content: z
    .string()
    .min(10, 'Review must be at least 10 characters')
    .max(5000, 'Review must be 5000 characters or fewer'),
  trailId: z.string().uuid('Invalid trail ID').optional(),
  businessId: z.string().uuid('Invalid business ID').optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

// ---------------------------------------------------------------------------
// Profile Update
// ---------------------------------------------------------------------------

export const profileUpdateSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must be 50 characters or fewer')
    .optional(),
  bio: z
    .string()
    .max(500, 'Bio must be 500 characters or fewer')
    .optional(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
