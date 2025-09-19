'use client';

import { useEffect, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from './client';

export function useSupabaseClient() {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const client = await createClient();
        if (mounted) setSupabase(client);
      } catch (e: any) {
        if (mounted) setError(e instanceof Error ? e : new Error('Failed to init Supabase'));
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return { supabase, ready: !!supabase, error };
}
