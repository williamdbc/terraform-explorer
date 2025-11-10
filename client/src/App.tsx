import { useState, useEffect } from "react";
import { toast } from "sonner";

import { Layout } from "@/layout/mainLayout";
import { MainContent } from "@/components/layout/MainContent";
import { ErrorScreen } from "@/components/common/ErrorScreen";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { TerraformService } from "@/services/TerraformService";
import { SelectedType } from "@/enums/SelectedType";
import { useServiceHook } from "@/hooks/useServiceHook";
import type { AppView } from "@/types/AppView";
import { StructureProvider } from "@/providers/StructureProvider";

export default function App() {
  const { data: structure, error, execute: loadStructure } = useServiceHook(() => TerraformService.getStructure());

  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<SelectedType | null>(null);
  const [activeView, setActiveView] = useState<AppView>("content");
  const [localLoading, setLocalLoading] = useState(true);

  const load = () => {
    setLocalLoading(true);
    return loadStructure()
      .then(() => {
        toast.success("Estrutura carregada com sucesso");
      })
      .finally(() => {
        setLocalLoading(false);
      });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (localLoading) {
    return <LoadingScreen message="Carregando estrutura Terraform..." />;
  }

  if (!localLoading && (error || !structure)) {
    return (
      <ErrorScreen
        message="Falha ao conectar ao serviço. Verifique se o backend está em execução."
        onRetry={load}
      />
    );
  }

  const handleSelectItem = (path: string, type: SelectedType): void => {
    setSelectedPath(path);
    setSelectedType(type);
    setActiveView("content");
  };

  return (
    <StructureProvider>
      <Layout
        loadStructure={loadStructure}
        structure={structure}
        selectedPath={selectedPath}
        onSelectItem={handleSelectItem}
        activeView={activeView}
        setActiveView={setActiveView}
      >
        <MainContent
          activeView={activeView}
          structure={structure}
          selectedPath={selectedPath}
          selectedType={selectedType}
          onSelectItem={handleSelectItem}
          loadStructure={loadStructure}
        />
      </Layout>
    </StructureProvider>
  );
}
