export function shouldNavigateBack(isSelfEdit: boolean, historyLength: number): boolean {
  return isSelfEdit && historyLength > 1;
}
