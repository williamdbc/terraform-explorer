import { createContext } from "react";
import type { TerraformStructure } from "@/interfaces/TerraformStructure";

interface StructureContextValue {
  structure: TerraformStructure | null;
  loadStructure: () => Promise<void>;
}

export const StructureContext = createContext<StructureContextValue>({
  structure: null,
  loadStructure: async () => {},
});
