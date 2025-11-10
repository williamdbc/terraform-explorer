import { useContext, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import { TrashIcon, Plus } from "lucide-react";
import { ProviderCreateDialog } from "@/components/providers/ProviderCreateDialog";
import { ProvidersService } from "@/services/ProvidersService";
import { useServiceHook } from "@/hooks/useServiceHook";
import { StructureContext } from "@/contexts/StructureContext";

export function ProvidersTable() {
  const { structure, loadStructure } = useContext(StructureContext);
  const providers = structure?.providers ?? [];

  const { execute: deleteProvider, loading: deleting } = useServiceHook(
    (profileName: string) => ProvidersService.deleteProfile(profileName)
  );

  const [showCreate, setShowCreate] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState<string | null>(null);

  const openCreateDialog = () => {
    setShowCreate(true);
  };

  const closeDialog = () => {
    setShowCreate(false);
  };

  const onSuccess = () => {
    closeDialog();
    loadStructure();
  };

  const handleDelete = async () => {
    if (!providerToDelete) return;

    await deleteProvider(providerToDelete);
    toast.success(`Provider "${providerToDelete}" excluído com sucesso`);
    setConfirmDeleteOpen(false);
    setProviderToDelete(null);
    loadStructure();
  };

  return (
    <div className="p-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Providers AWS</h2>
        <Button
          onClick={openCreateDialog}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" /> Adicionar
        </Button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-200 bg-slate-50">
              <TableHead className="font-semibold text-slate-700">Profile Name</TableHead>
              <TableHead className="text-right font-semibold text-slate-700">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {providers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-slate-500 py-8">
                  Nenhum provider encontrado
                </TableCell>
              </TableRow>
            ) : (
              providers.map((provider, index) => (
                <TableRow
                  key={provider.name}
                  className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${index === providers.length - 1 ? "border-b-0" : ""
                    }`}
                >
                  <TableCell className="font-medium text-slate-800">{provider.name}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-md bg-red-500 text-white hover:bg-red-400 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                      title="Excluir"
                      disabled={deleting}
                      onClick={() => {
                        setProviderToDelete(provider.name);
                        setConfirmDeleteOpen(true);
                      }}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ProviderCreateDialog
        open={showCreate}
        onClose={closeDialog}
        onCreateSuccess={onSuccess}
      />

      <ConfirmDialog
        open={confirmDeleteOpen}
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Confirma exclusão"
        description={`Confirma a exclusão do provider "${providerToDelete}"?`}
        cancelText="Cancelar"
        confirmText="Excluir"
        type="delete"
      />
    </div>
  );
}