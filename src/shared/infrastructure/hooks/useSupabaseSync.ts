import { useState, useEffect } from 'react';
import { supabase } from '@/src/shared/infrastructure/supabase';

/**
 * Custom hook to sync a Supabase table.
 * @param tableName The name of the table.
 * @param orderField The field to order by.
 * @param orderDirection The direction to order by.
 * @param isEnabled Whether the sync is enabled.
 * @param onError Callback for errors.
 * @returns The synced data and loading state.
 */
export function useSupabaseSync<T>(
  tableName: string,
  orderField?: string,
  orderDirection: 'asc' | 'desc' = 'asc',
  isEnabled: boolean = true,
  onError?: (error: unknown) => void
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isEnabled) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }

    setLoading(true);

    const fetchData = async () => {
      let query = supabase.from(tableName).select('*');
      if (orderField) {
        query = query.order(orderField, { ascending: orderDirection === 'asc' });
      }

      const { data: fetchResult, error } = await query;
      
      if (error) {
        console.error(`Error fetching ${tableName}:`, error);
        if (onError) onError(error);
      } else {
        // Adapt docId from id to remain compatible with legacy Firestore UI expectation
        const docs = (fetchResult || [])?.map((doc: unknown) => {
          const typedDoc = doc as Record<string, unknown> & { id: string | number };
          return {
            ...typedDoc,
            docId: String(typedDoc.id) // map id to docId for legacy components
          };
        }) as T[];
        setData(docs || []);
      }
      setLoading(false);
    };

    fetchData();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel(`${tableName}_changes_` + Math.random().toString(36).slice(2))
      .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, (_payload) => {
        // Refetch on any change to ensure accurate sorting and filtering
        // We could also patch the array locally, but a refetch is safer for now.
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [tableName, orderField, orderDirection, isEnabled]);

  return { data, setData, loading };
}
