import { MaritalStatus } from "@/domain/enums/MaritalStatus";

export const maritalStatusLabels: Record<MaritalStatus, string> = {
  [MaritalStatus.Single]: "Solteiro(a)",
  [MaritalStatus.Married]: "Casado(a)",
  [MaritalStatus.Widowed]: "Viúvo(a)",
  [MaritalStatus.Divorced]: "Divorciado(a)",
  [MaritalStatus.StableUnion]: "União estável",
};
