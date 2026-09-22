export const ApiErrors = {
  VALIDATION_ERROR: {
    code: "VALIDATION_ERROR",
    message: "Dados inválidos. Verifique os campos e tente novamente",
  },
  INVALID_JSON: {
    code: "INVALID_JSON",
    message: "Formato de dados inválido",
  },
  INVALID_CONTENT_TYPE: {
    code: "INVALID_CONTENT_TYPE",
    message: "Tipo de conteúdo não suportado",
  },
  INTERNAL_ERROR: {
    code: "INTERNAL_ERROR",
    message: "Algo deu errado. Tente novamente mais tarde",
  },
} as const;
