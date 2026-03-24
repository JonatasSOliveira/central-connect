export const ChurchErrors = {
  CHURCH_NOT_FOUND: {
    code: "CHURCH_NOT_FOUND",
    message: "Igreja não encontrada",
  },
  CHURCH_ALREADY_EXISTS: {
    code: "CHURCH_ALREADY_EXISTS",
    message: "Já existe uma igreja com este nome",
  },
  CHURCH_CREATION_FAILED: {
    code: "CHURCH_CREATION_FAILED",
    message: "Falha ao criar igreja",
  },
  CHURCH_UPDATE_FAILED: {
    code: "CHURCH_UPDATE_FAILED",
    message: "Falha ao atualizar igreja",
  },
  CHURCH_DELETION_FAILED: {
    code: "CHURCH_DELETION_FAILED",
    message: "Falha ao excluir igreja",
  },
  NOT_AUTHORIZED: {
    code: "NOT_AUTHORIZED",
    message: "Você não tem permissão para realizar esta ação",
  },
} as const;
