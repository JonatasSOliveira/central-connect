export const NotificationErrors = {
  PUSH_TOKEN_UPSERT_FAILED: {
    code: "PUSH_TOKEN_UPSERT_FAILED",
    message: "Falha ao registrar token de notificação",
  },
  PUSH_TOKEN_DEACTIVATE_FAILED: {
    code: "PUSH_TOKEN_DEACTIVATE_FAILED",
    message: "Falha ao remover token de notificação",
  },
  PUSH_NOTIFY_FAILED: {
    code: "PUSH_NOTIFY_FAILED",
    message: "Falha ao enviar notificações push",
  },
} as const;
