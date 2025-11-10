import { getErrorMessage } from "@/utils/apiHandlerError";

import { useState } from "react";
import { toast } from "sonner";

export function useServiceHook<TArgs extends unknown[], TReturn>(
  serviceMethod: (...args: TArgs) => Promise<TReturn>
) {
  const [data, setData] = useState<TReturn | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async (...args: TArgs): Promise<TReturn> => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const result = await serviceMethod(...args);
      setData(result);
      return result;
    } catch (err) {
      const message = getErrorMessage(err) ?? "Não foi possível completar a requisição.";
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, execute };
}
