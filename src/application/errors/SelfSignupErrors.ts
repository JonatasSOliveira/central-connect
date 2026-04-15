export const SelfSignupErrors = {
  CHURCH_NOT_FOUND: {
    code: "CHURCH_NOT_FOUND",
    message: "Igreja não encontrada",
  },
  SELF_SIGNUP_NOT_AVAILABLE: {
    code: "SELF_SIGNUP_NOT_AVAILABLE",
    message: "Auto cadastro indisponível para esta igreja",
  },
  SELF_SIGNUP_ROLE_NOT_CONFIGURED: {
    code: "SELF_SIGNUP_ROLE_NOT_CONFIGURED",
    message: "A igreja ainda não configurou o cargo padrão para auto cadastro",
  },
  INVALID_SELF_SIGNUP_ROLE: {
    code: "INVALID_SELF_SIGNUP_ROLE",
    message: "Cargo padrão de auto cadastro inválido",
  },
  INVALID_PHONE: {
    code: "INVALID_PHONE",
    message: "Telefone inválido",
  },
  INVALID_GOOGLE_TOKEN: {
    code: "INVALID_GOOGLE_TOKEN",
    message: "Token do Google inválido",
  },
  FINALIZE_FAILED: {
    code: "SELF_SIGNUP_FINALIZE_FAILED",
    message: "Falha ao finalizar auto cadastro",
  },
  LOOKUP_FAILED: {
    code: "SELF_SIGNUP_LOOKUP_FAILED",
    message: "Falha ao consultar membro",
  },
} as const;
