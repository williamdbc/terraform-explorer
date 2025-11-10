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
import { PencilIcon, TrashIcon, Plus, Link, CopyIcon } from "lucide-react";
import { AccountService } from "@/services/AccountService";
import { useServiceHook } from "@/hooks/useServiceHook";
import { AccountCreateEditDialog } from "@/components/accounts/AccountCreateEditDialog";
import { LinkAccountToProviderDialog } from "@/components/accounts/LinkAccountToProviderDialog";
import { AccountCopyDialog } from "@/components/accounts/AccountCopyDialog";
import { StructureContext } from "@/contexts/StructureContext";

export function AccountsTable() {
  const { structure, loadStructure } = useContext(StructureContext);
  const accounts = structure?.accounts ?? [];
  const providers = structure?.providers ?? [];

  const [showCreateEdit, setShowCreateEdit] = useState(false);
  const [editingAccountName, setEditingAccountName] = useState<string | null>(null);
  const [showLinkProvider, setShowLinkProvider] = useState(false);
  const [linkingAccountName, setLinkingAccountName] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
  const [showCopyDialog, setShowCopyDialog] = useState(false);

  const { execute: deleteAccount, loading: deleting } = useServiceHook(
    (name: string) => AccountService.delete(name)
  );

  const openCreateDialog = () => {
    setEditingAccountName(null);
    setShowCreateEdit(true);
  };

  const openEditDialog = (accountName: string) => {
    setEditingAccountName(accountName);
    setShowCreateEdit(true);
  };

  const closeCreateEditDialog = () => {
    setShowCreateEdit(false);
    setEditingAccountName(null);
  };

  const handleCreateEditSuccess = () => {
    closeCreateEditDialog();
    loadStructure();
  };

  const openLinkDialog = (accountName: string) => {
    setLinkingAccountName(accountName);
    setShowLinkProvider(true);
  };

  const closeLinkDialog = () => {
    setShowLinkProvider(false);
    setLinkingAccountName(null);
  };

  const handleLinkSuccess = () => {
    closeLinkDialog();
    loadStructure();
  };

  const openCopyDialog = () => {
    setShowCopyDialog(true);
  };

  const closeCopyDialog = () => {
    setShowCopyDialog(false);
  };

  const handleCopySuccess = () => {
    closeCopyDialog();
    loadStructure();
  };

  const openDeleteConfirm = (accountName: string) => {
    setAccountToDelete(accountName);
    setConfirmDeleteOpen(true);
  };

  const closeDeleteConfirm = () => {
    setConfirmDeleteOpen(false);
    setAccountToDelete(null);
  };

  const handleDelete = async () => {
    if (!accountToDelete) return;
    
    await deleteAccount(accountToDelete);
    toast.success(`Conta "${accountToDelete}" excluída com sucesso`);
    closeDeleteConfirm();
    loadStructure();
  };

  return (
    <div className="p-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Contas AWS</h2>
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
              <TableHead className="font-semibold text-slate-700">Nome</TableHead>
              <TableHead className="font-semibold text-slate-700">Profile</TableHead>
              <TableHead className="font-semibold text-slate-700">Assume Role ARN</TableHead>
              <TableHead className="text-right font-semibold text-slate-700">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-slate-500 py-8">
                  Nenhuma conta encontrada
                </TableCell>
              </TableRow>
            ) : (
              accounts.map((account, index) => (
                <TableRow
                  key={account.name}
                  className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${index === accounts.length - 1 ? "border-b-0" : ""
                    }`}
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-800">{account.name}</span>
                      <span className="text-xs text-slate-500 font-normal">{account.path}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-700">
                    {account.awsProfile || <span className="text-slate-400">-</span>}
                  </TableCell>
                  <TableCell className="text-slate-700">
                    {account.assumeRoleArn || <span className="text-slate-400">-</span>}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Copiar conta"
                      onClick={() => openCopyDialog()}
                      className="h-9 w-9 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                    >
                      <CopyIcon className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-md bg-blue-500 text-white hover:bg-blue-400 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      title="Linkar Provider"
                      onClick={() => openLinkDialog(account.name)}
                    >
                      <Link className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-md bg-orange-500 text-white hover:bg-orange-400 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                      title="Editar"
                      onClick={() => openEditDialog(account.name)}
                    >
                      <PencilIcon className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-md bg-red-500 text-white hover:bg-red-400 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                      title="Excluir"
                      disabled={deleting}
                      onClick={() => openDeleteConfirm(account.name)}
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

      <AccountCreateEditDialog
        open={showCreateEdit}
        onClose={closeCreateEditDialog}
        mode={editingAccountName ? "edit" : "create"}
        initialName={editingAccountName ?? undefined}
        onCreateSuccess={handleCreateEditSuccess}
        onEditSuccess={handleCreateEditSuccess}
      />

      <AccountCopyDialog
        open={showCopyDialog}
        onClose={closeCopyDialog}
        accounts={accounts}
        onCopySuccess={handleCopySuccess}
      />

      <LinkAccountToProviderDialog
        open={showLinkProvider}
        onClose={closeLinkDialog}
        accountName={linkingAccountName ?? ""}
        providers={providers}
        onLinkSuccess={handleLinkSuccess}
      />

      <ConfirmDialog
        open={confirmDeleteOpen}
        onCancel={closeDeleteConfirm}
        onConfirm={handleDelete}
        title="Confirma exclusão"
        description={`Confirma a exclusão da conta "${accountToDelete}"?`}
        cancelText="Cancelar"
        confirmText="Excluir"
        type="delete"
      />
    </div>
  );
}
