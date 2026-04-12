export const ScaleErrors = {
  SCALE_NOT_FOUND: {
    code: "SCALE_NOT_FOUND",
    message: "Escala não encontrada",
  },
  SCALE_ALREADY_EXISTS: {
    code: "SCALE_ALREADY_EXISTS",
    message: "Já existe uma escala para este culto e ministério",
  },
  SCALE_CREATION_FAILED: {
    code: "SCALE_CREATION_FAILED",
    message: "Falha ao criar escala",
  },
  SCALE_UPDATE_FAILED: {
    code: "SCALE_UPDATE_FAILED",
    message: "Falha ao atualizar escala",
  },
  SCALE_DELETE_FAILED: {
    code: "SCALE_DELETE_FAILED",
    message: "Falha ao excluir escala",
  },
  SCALE_MEMBER_NOT_FOUND: {
    code: "SCALE_MEMBER_NOT_FOUND",
    message: "Membro da escala não encontrado",
  },
  SCALE_MEMBER_CREATION_FAILED: {
    code: "SCALE_MEMBER_CREATION_FAILED",
    message: "Falha ao adicionar membro à escala",
  },
  SCALE_MEMBER_DELETION_FAILED: {
    code: "SCALE_MEMBER_DELETION_FAILED",
    message: "Falha ao remover membro da escala",
  },
  SERVICE_NOT_FOUND: {
    code: "SERVICE_NOT_FOUND",
    message: "Culto não encontrado",
  },
  MINISTRY_NOT_FOUND: {
    code: "MINISTRY_NOT_FOUND",
    message: "Ministério não encontrado",
  },
  MEMBER_NOT_FOUND: {
    code: "MEMBER_NOT_FOUND",
    message: "Membro não encontrado",
  },
} as const;
