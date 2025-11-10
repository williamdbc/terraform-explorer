import { useState, useEffect, type ReactNode } from "react";
import { StructureContext } from "@/contexts/StructureContext";
import type { TerraformStructure } from "@/interfaces/TerraformStructure";
import { TerraformService } from "@/services/TerraformService";

interface StructureProviderProps {
  children: ReactNode;
}

export function StructureProvider({ children }: StructureProviderProps) {
  const [structure, setStructure] = useState<TerraformStructure | null>(null);

  const loadStructure = async () => {
    try {
      const data = await TerraformService.getStructure();
      setStructure(data);
    } catch (e) {
      console.error("Erro ao carregar estrutura", e);
    }
  };

  useEffect(() => {
    loadStructure();
  }, []);

  return (
    <StructureContext.Provider value={{ structure, loadStructure }}>
      {children}
    </StructureContext.Provider>
  );
}