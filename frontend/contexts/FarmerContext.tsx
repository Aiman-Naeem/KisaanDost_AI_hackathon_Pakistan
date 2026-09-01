/**
 * FarmerContext — lightweight React context that exposes the persistent
 * `farmerId` and a `loading` flag.
 *
 * On mount the provider calls `getFarmerId()` from the identity service and
 * stores the result in state. While the async read is pending, `loading` is
 * `true` so the app root can render a splash/indicator instead of screens
 * that depend on a valid id.
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getFarmerId } from '../services/farmerIdentity';

interface FarmerContextValue {
  farmerId: string | null;
  loading: boolean;
}

const FarmerContext = createContext<FarmerContextValue>({
  farmerId: null,
  loading: true,
});

export function FarmerProvider({ children }: { children: React.ReactNode }) {
  const [farmerId, setFarmerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFarmerId()
      .then((id) => setFarmerId(id))
      .catch((err) => {
        // getFarmerId already handles AsyncStorage failures internally and
        // should never reject, but guard defensively just in case.
        console.warn('[FarmerContext] Unexpected error resolving farmerId:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <FarmerContext.Provider value={{ farmerId, loading }}>
      {children}
    </FarmerContext.Provider>
  );
}

/**
 * Hook to access the persistent farmer identity from any screen/component.
 * Returns `{ farmerId: string | null, loading: boolean }`.
 */
export function useFarmerContext(): FarmerContextValue {
  return useContext(FarmerContext);
}
