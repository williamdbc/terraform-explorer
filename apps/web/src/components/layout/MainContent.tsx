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
    case "accounts":
    case "providers":
    case "projectGroups":
    case "projects":
      return (
        <div className="h-full overflow-auto p-4">
          {activeView === "modules" && <ModulesTable />}
          {activeView === "accounts" && <AccountsTable />}
          {activeView === "providers" && <ProvidersTable />}
          {activeView === "projectGroups" && <ProjectGroupTable />}
          {activeView === "projects" && <ProjectsTable />}
        </div>
      );

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