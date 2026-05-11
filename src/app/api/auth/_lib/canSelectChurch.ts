interface SessionChurch {
  churchId: string;
}

interface SessionForChurchSelection {
  isSuperAdmin: boolean;
  churches: SessionChurch[];
}

export function canSelectChurch(
  session: SessionForChurchSelection,
  churchId: string,
): boolean {
  if (session.isSuperAdmin) {
    return true;
  }

  return session.churches.some((church) => church.churchId === churchId);
}
