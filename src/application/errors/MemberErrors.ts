export const MemberErrors = {
  MEMBER_NOT_FOUND: {
    code: "MEMBER_NOT_FOUND",
    message: "Membro não encontrado",
  },
  MEMBER_ALREADY_EXISTS: {
    code: "MEMBER_ALREADY_EXISTS",
    message: "Este e-mail já está cadastrado",
  },
  MEMBER_CREATION_FAILED: {
    code: "MEMBER_CREATION_FAILED",
    message: "Falha ao criar membro",
  },
  MEMBER_UPDATE_FAILED: {
    code: "MEMBER_UPDATE_FAILED",
    message: "Falha ao atualizar membro",
  },
  MEMBER_DELETION_FAILED: {
    code: "MEMBER_DELETION_FAILED",
    message: "Falha ao excluir membro",
  },
} as const;
