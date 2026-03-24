export const UserErrors = {
  USER_NOT_FOUND: {
    code: "USER_NOT_FOUND",
    message: "Usuário não encontrado",
  },
  USER_ALREADY_EXISTS: {
    code: "USER_ALREADY_EXISTS",
    message: "Este usuário já existe",
  },
  USER_CREATION_FAILED: {
    code: "USER_CREATION_FAILED",
    message: "Falha ao criar usuário",
  },
  USER_UPDATE_FAILED: {
    code: "USER_UPDATE_FAILED",
    message: "Falha ao atualizar usuário",
  },
  USER_DELETION_FAILED: {
    code: "USER_DELETION_FAILED",
    message: "Falha ao excluir usuário",
  },
  NO_INVITE_FOUND: {
    code: "NO_INVITE_FOUND",
    message: "Convite não encontrado ou já utilizado",
  },
} as const;
