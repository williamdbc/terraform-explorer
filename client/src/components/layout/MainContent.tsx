import type { TerraformStructure } from "@/interfaces/TerraformStructure";
import type { SelectedType } from "@/enums/SelectedType";
import { ModulesTable } from "@/components/modules/ModulesTable";
import { TerraformContentContainer } from "@/components/terraform/TerraformContentContainer";
import type { AppView } from "@/types/AppView";
import { ProvidersTable } from "@/components/providers/ProvidersTable";
import { AccountsTable } from "@/components/accounts/AccountsTable";
import { UsedModulesTable } from "@/components/usedModules/UsedModulesTable";
import { ProjectsTable } from "@/components/projects/ProjectsTable";

interface MainContentProps {
  activeView: AppView;
  structure?: TerraformStructure | null;
  selectedPath: string | null;
  selectedType: SelectedType | null;
  onSelectItem: (path: string, type: SelectedType) => void;
  loadStructure: () => void;
}

export function MainContent({
  activeView,
  structure,
  selectedPath,
  selectedType,
  onSelectItem,
  loadStructure,
}: MainContentProps) {
  switch (activeView) {
    case "modules":
      return <ModulesTable/>;
    case "accounts":
      return <AccountsTable/>;
    case "providers":
      return <ProvidersTable/>;
    case "usedModules":
      return <UsedModulesTable/>;
    case "projects":
      return <ProjectsTable/>;
    default:
      return (
        <TerraformContentContainer
          structure={structure ?? null}
          selectedPath={selectedPath}
          selectedType={selectedType}
          onSelectItem={onSelectItem}
          loadStructure={loadStructure}
        />
      );
  }
}
