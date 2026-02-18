import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface UseSupabaseTableConfig {
  table: string;
  orderColumn: string;
  ascending?: boolean;
  filter?: (query: any) => any;
}

export function useSupabaseTable<T extends { id: number }>({
  table,
  orderColumn,
  ascending = true,
  filter,
}: UseSupabaseTableConfig) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from(table).select('*').order(orderColumn, { ascending });
      if (filter) query = filter(query);
      const { data: records, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setData(records || []);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [table, orderColumn, ascending]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const insert = async (record: Record<string, unknown>) => {
    try {
      const { error: insertError } = await supabase.from(table).insert([record]);
      if (insertError) throw insertError;
      await fetchData();
      return true;
    } catch (err: unknown) {
      setError((err as Error).message);
      return false;
    }
  };

  const update = async (id: number, record: Record<string, unknown>) => {
    try {
      const { error: updateError } = await supabase.from(table).update(record).eq('id', id);
      if (updateError) throw updateError;
      await fetchData();
      return true;
    } catch (err: unknown) {
      setError((err as Error).message);
      return false;
    }
  };

  const remove = async (id: number) => {
    try {
      const { error: deleteError } = await supabase.from(table).delete().eq('id', id);
      if (deleteError) throw deleteError;
      await fetchData();
      return true;
    } catch (err: unknown) {
      setError((err as Error).message);
      return false;
    }
  };

  const clearError = () => setError(null);

  return { data, setData, loading, error, setError, clearError, fetchData, insert, update, remove };
}
