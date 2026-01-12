import { z } from 'zod';
import { insertServerSchema, insertBattlepassConfigSchema, insertBattlepassLevelSchema, servers, battlepassConfig, battlepassLevels } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const supportRequestSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  discordUsername: z.string().optional(),
  category: z.string(),
  subject: z.string(),
  message: z.string(),
});

export const api = {
  servers: {
    list: {
      method: 'GET' as const,
      path: '/api/servers',
      responses: {
        200: z.array(z.custom<typeof servers.$inferSelect>()),
      },
    },
  },
  battlepass: {
    getConfig: {
      method: 'GET' as const,
      path: '/api/battlepass/config',
      responses: {
        200: z.custom<typeof battlepassConfig.$inferSelect>(),
      },
    },
    updateConfig: {
      method: 'PATCH' as const,
      path: '/api/battlepass/config',
      input: insertBattlepassConfigSchema.partial(),
      responses: {
        200: z.custom<typeof battlepassConfig.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    listLevels: {
      method: 'GET' as const,
      path: '/api/battlepass/levels',
      responses: {
        200: z.array(z.custom<typeof battlepassLevels.$inferSelect>()),
      },
    },
    updateLevel: {
      method: 'PUT' as const,
      path: '/api/battlepass/levels/:id',
      input: insertBattlepassLevelSchema.partial(),
      responses: {
        200: z.custom<typeof battlepassLevels.$inferSelect>(),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
    createLevel: {
      method: 'POST' as const,
      path: '/api/battlepass/levels',
      input: insertBattlepassLevelSchema,
      responses: {
        201: z.custom<typeof battlepassLevels.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  support: {
    submit: {
      method: 'POST' as const,
      path: '/api/support',
      input: supportRequestSchema,
      responses: {
        200: z.object({ success: z.boolean(), message: z.string() }),
        400: errorSchemas.validation,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type SupportRequest = z.infer<typeof supportRequestSchema>;
