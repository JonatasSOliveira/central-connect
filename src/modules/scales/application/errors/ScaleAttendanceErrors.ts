export const ScaleAttendanceErrors = {
  SCALE_NOT_FOUND: {
    code: "SCALE_NOT_FOUND",
    message: "Escala não encontrada",
  },
  SCALE_MEMBER_NOT_FOUND: {
    code: "SCALE_MEMBER_NOT_FOUND",
    message: "Membro da escala não encontrado",
  },
  SCALE_MEMBER_NOT_IN_SCALE: {
    code: "SCALE_MEMBER_NOT_IN_SCALE",
    message: "Membro informado não pertence a esta escala",
  },
  ATTENDANCE_ALREADY_PUBLISHED: {
    code: "ATTENDANCE_ALREADY_PUBLISHED",
    message: "A chamada já foi publicada e está bloqueada para este usuário",
  },
  INVALID_ATTENDANCE_JUSTIFICATION: {
    code: "INVALID_ATTENDANCE_JUSTIFICATION",
    message: "Justificativa é obrigatória para falta justificada",
  },
  ATTENDANCE_FETCH_FAILED: {
    code: "ATTENDANCE_FETCH_FAILED",
    message: "Falha ao buscar chamada da escala",
  },
  ATTENDANCE_SAVE_FAILED: {
    code: "ATTENDANCE_SAVE_FAILED",
    message: "Falha ao salvar chamada da escala",
  },
  ATTENDANCE_PUBLISH_FAILED: {
    code: "ATTENDANCE_PUBLISH_FAILED",
    message: "Falha ao publicar chamada da escala",
  },
} as const;
