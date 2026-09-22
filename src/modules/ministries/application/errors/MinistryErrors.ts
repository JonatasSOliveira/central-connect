export const MinistryErrors = {
  MINISTRY_NOT_FOUND: {
    code: "MINISTRY_NOT_FOUND",
    message: "Ministério não encontrado",
  },
  MINISTRY_ALREADY_EXISTS: {
    code: "MINISTRY_ALREADY_EXISTS",
    message: "Já existe um ministério com este nome nesta igreja",
  },
  MINISTRY_ROLE_NOT_FOUND: {
    code: "MINISTRY_ROLE_NOT_FOUND",
    message: "Função não encontrada",
  },
  MINISTRY_CREATION_FAILED: {
    code: "MINISTRY_CREATION_FAILED",
    message: "Falha ao criar ministério",
  },
  MINISTRY_UPDATE_FAILED: {
    code: "MINISTRY_UPDATE_FAILED",
    message: "Falha ao atualizar ministério",
  },
  MINISTRY_DELETION_FAILED: {
    code: "MINISTRY_DELETION_FAILED",
    message: "Falha ao excluir ministério",
  },
  MINISTRY_ROLE_CREATION_FAILED: {
    code: "MINISTRY_ROLE_CREATION_FAILED",
    message: "Falha ao criar função",
  },
  MINISTRY_ROLE_UPDATE_FAILED: {
    code: "MINISTRY_ROLE_UPDATE_FAILED",
    message: "Falha ao atualizar função",
  },
  MINISTRY_ROLE_DELETION_FAILED: {
    code: "MINISTRY_ROLE_DELETION_FAILED",
    message: "Falha ao excluir função",
  },
} as const;
