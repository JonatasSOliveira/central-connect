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
} as const;
