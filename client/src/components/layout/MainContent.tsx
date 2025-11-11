import type { SelectedType } from "@/enums/SelectedType";
import { TerraformContentContainer } from "@/components/terraform/TerraformContentContainer";
import type { AppView } from "@/types/AppView";
import { ProvidersTable } from "@/components/providers/ProvidersTable";
import { AccountsTable } from "@/components/accounts/AccountsTable";
import { ProjectsTable } from "@/components/projects/ProjectsTable";
import { ModulesTable } from "@/components/modules/ModulesTable";
import { ProjectGroupTable } from "@/components/projectGroup/ProjectGroupsTable";

interface MainContentProps {
  activeView: AppView;
  selectedPath: string | null;
  selectedType: SelectedType | null;
  onSelectItem: (path: string, type: SelectedType) => void;
}

export function MainContent({
  activeView,
  selectedPath,
  selectedType,
  onSelectItem,
}: MainContentProps) {
  switch (activeView) {
    case "modules":
      return <ModulesTable/>;
    case "accounts":
      return <AccountsTable/>;
    case "providers":
      return <ProvidersTable/>;
    case "projectGroups":
      return <ProjectGroupTable/>;
    case "projects":
      return <ProjectsTable/>;
    default:
      return (
        <TerraformContentContainer
          selectedPath={selectedPath}
          selectedType={selectedType}
          onSelectItem={onSelectItem}
        />
      );
  }
}
