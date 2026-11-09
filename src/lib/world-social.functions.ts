import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { z } from 'zod';
export const findTowners = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ name: z.string().trim().max(60) }).parse(i))
  .handler(async ({ data, context }) => {
    let query = context.supabase.from('profiles').select('id,name,city').neq('id', context.userId).order('name').limit(20);
    if (data.name) query = query.ilike('name', `%${data.name.replace(/[%_]/g, '')}%`);
    const { data: users, error } = await query;
    if (error) throw new Error(error.message);
    return users ?? [];
  });