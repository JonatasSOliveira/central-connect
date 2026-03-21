export const AuthErrors = {
  INVALID_GOOGLE_TOKEN: {
    code: "INVALID_GOOGLE_TOKEN",
    message: "Token do Google inválido ou expirado",
  },
  NO_INVITE_FOUND: {
    code: "NO_INVITE_FOUND",
    message: "Você não tem um convite para acessar o sistema",
  },
  USER_CREATION_FAILED: {
    code: "USER_CREATION_FAILED",
    message: "Erro ao criar sua conta. Tente novamente",
  },
  INTERNAL_ERROR: {
    code: "INTERNAL_ERROR",
    message: "Erro ao processar login. Tente novamente",
  },
  UNAUTHORIZED: {
    code: "UNAUTHORIZED",
    message: "Não autenticado",
  },
  INVALID_TOKEN: {
    code: "INVALID_TOKEN",
    message: "Token inválido ou expirado",
  },
  NOT_AUTHORIZED: {
    code: "NOT_AUTHORIZED",
    message: "Você não tem permissão para realizar esta ação",
  },
} as const;
