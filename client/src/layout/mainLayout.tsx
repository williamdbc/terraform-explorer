import React from "react";
import { Header } from "@/components/layout/Header";
import type { TerraformStructure } from "@/interfaces/TerraformStructure";
import { FileExplorer } from "@/components/terraform/FileExplorer";
import type { SelectedType } from "@/enums/SelectedType";
import type { AppView } from "@/types/AppView";

interface LayoutProps {
  children: React.ReactNode;
  structure?: TerraformStructure | null;
  loadStructure: () => void;
  selectedPath: string | null;
  onSelectItem: (path: string, type: SelectedType) => void;
  activeView: AppView;
  setActiveView: (view: AppView) => void;
}

export function Layout({
  children,
  structure,
  loadStructure,
  selectedPath,
  onSelectItem,
  setActiveView,
}: LayoutProps) {

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <Header
        setActiveView={setActiveView}
        loadStructure={loadStructure}
      />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <aside className="w-80 bg-white border-r border-gray-200 overflow-auto">
          {!!structure && (
            <FileExplorer selectedPath={selectedPath} onSelect={onSelectItem} />
          )}
        </aside>
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
