export const RoleErrors = {
  ROLE_NOT_FOUND: {
    code: "ROLE_NOT_FOUND",
    message: "Role não encontrada",
  },
  ROLE_ALREADY_EXISTS: {
    code: "ROLE_ALREADY_EXISTS",
    message: "Já existe uma role com este nome",
  },
  ROLE_CREATION_FAILED: {
    code: "ROLE_CREATION_FAILED",
    message: "Falha ao criar role",
  },
  ROLE_UPDATE_FAILED: {
    code: "ROLE_UPDATE_FAILED",
    message: "Falha ao atualizar role",
  },
  ROLE_DELETION_FAILED: {
    code: "ROLE_DELETION_FAILED",
    message: "Falha ao excluir role",
  },
  ROLE_IS_SYSTEM: {
    code: "ROLE_IS_SYSTEM",
    message: "Não é possível modificar uma role do sistema",
  },
  INVALID_PERMISSION: {
    code: "INVALID_PERMISSION",
    message: "Permissão inválida",
  },
} as const;
