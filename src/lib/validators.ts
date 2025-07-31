import { z } from 'zod';

export const ThreadTypeEnum = z.enum(['regular', 'viral']);
export const ToneEnum = z.enum(['professional', 'engaging']);
export const IndustryEnum = z.enum([
  'general',
  'saas',
  'developer',
  'marketing',
  'ai',
  'product',
  'design',
  'finance',
  'health',
  'education'
]);

export const GenerateBodySchema = z.object({
  url: z.string().url().max(2048),
  threadType: ThreadTypeEnum.default('regular'),
  tone: ToneEnum.default('professional'),
  industry: IndustryEnum.default('general'),
  openrouterApiKey: z.string().optional(),
  openrouterModel: z.string().optional(),
});

export type GenerateBody = z.infer<typeof GenerateBodySchema>;