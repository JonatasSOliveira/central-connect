export const ScaleGenerationErrors = {
  SCALES_REQUIRED: {
    code: "SCALE_GENERATION_SCALES_REQUIRED",
    message: "Selecione pelo menos uma escala",
  },
  SCALE_NOT_FOUND: {
    code: "SCALE_GENERATION_SCALE_NOT_FOUND",
    message: "Uma das escalas não foi encontrada",
  },
  SERVICE_MISMATCH: {
    code: "SCALE_GENERATION_SERVICE_MISMATCH",
    message: "A escala não pertence ao culto informado",
  },
  MINISTRIES_REQUIRED: {
    code: "SCALE_GENERATION_MINISTRIES_REQUIRED",
    message: "Selecione pelo menos um ministério",
  },
  CONTEXT_INVALID: {
    code: "SCALE_GENERATION_CONTEXT_INVALID",
    message: "O culto não pertence à igreja selecionada",
  },
  MINISTRY_INVALID: {
    code: "SCALE_GENERATION_MINISTRY_INVALID",
    message: "Um dos ministérios não pertence à igreja selecionada",
  },
  DUPLICATE_MINISTRY: {
    code: "SCALE_GENERATION_DUPLICATE_MINISTRY",
    message: "Um ministério foi informado mais de uma vez",
  },
  DUPLICATE_MEMBER: {
    code: "SCALE_GENERATION_DUPLICATE_MEMBER",
    message: "O mesmo membro não pode ser escalado duas vezes no culto",
  },
  SAVE_FAILED: {
    code: "SCALE_GENERATION_SAVE_FAILED",
    message: "Não foi possível salvar a geração da escala",
  },
  MEMBER_NOT_ELIGIBLE: {
    code: "SCALE_GENERATION_MEMBER_NOT_ELIGIBLE",
    message: "Um dos membros não está habilitado para a função informada",
  },
  INCOMPLETE_CONFIRMATION_REQUIRED: {
    code: "SCALE_GENERATION_INCOMPLETE_CONFIRMATION_REQUIRED",
    message: "A publicação de uma escala incompleta exige confirmação",
  },
  EXISTING_ASSIGNMENT_CONFLICT: {
    code: "SCALE_GENERATION_EXISTING_ASSIGNMENT_CONFLICT",
    message: "A alteração criaria conflito com uma atribuição existente",
  },
  AVAILABILITY_CONFIRMATION_REQUIRED: {
    code: "SCALE_GENERATION_AVAILABILITY_CONFIRMATION_REQUIRED",
    message: "A escolha inclui uma pessoa indisponível no dia do culto",
  },
  CONSECUTIVE_LIMIT_CONFIRMATION_REQUIRED: {
    code: "SCALE_GENERATION_CONSECUTIVE_LIMIT_CONFIRMATION_REQUIRED",
    message: "A escolha ultrapassa o limite de escalas consecutivas",
  },
  TIME_CONFLICT_CONFIRMATION_REQUIRED: {
    code: "SCALE_GENERATION_TIME_CONFLICT_CONFIRMATION_REQUIRED",
    message: "A escolha inclui uma pessoa em outro culto no mesmo horário",
  },
  REPLACE_CONFIRMATION_REQUIRED: {
    code: "SCALE_GENERATION_REPLACE_CONFIRMATION_REQUIRED",
    message: "Substituirá as atribuições atuais desta escala",
  },
} as const;
