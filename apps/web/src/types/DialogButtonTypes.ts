export type DialogButtonType = "default" | "create" | "edit" | "delete";

export const buttonClassesByType: Record<DialogButtonType, string> = {
  default: "bg-blue-600 hover:bg-blue-700 text-white",
  create: "bg-green-600 hover:bg-green-700 text-white",
  edit: "bg-orange-500 hover:bg-orange-600 text-white",
  delete: "bg-red-600 hover:bg-red-700 text-white",
};

export const buttonTextsByType: Record<DialogButtonType, string> = {
  default: "Confirmar",
  create: "Criar",
  edit: "Editar",
  delete: "Excluir",
};