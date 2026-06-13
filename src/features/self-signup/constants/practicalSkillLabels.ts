import { MutiraoAvailability } from "@/domain/enums/MutiraoAvailability";
import { PracticalSkill } from "@/domain/enums/PracticalSkill";

export const practicalSkillLabels: Record<PracticalSkill, string> = {
  [PracticalSkill.Electrical]: "Elétrica",
  [PracticalSkill.Plumbing]: "Hidráulica",
  [PracticalSkill.Construction]: "Pedreiro / Construção civil",
  [PracticalSkill.Painting]: "Pintura",
  [PracticalSkill.Carpentry]: "Marcenaria",
  [PracticalSkill.Gardening]: "Jardinagem",
  [PracticalSkill.Mechanics]: "Mecânica",
  [PracticalSkill.IT]: "Informática / TI",
  [PracticalSkill.GraphicDesign]: "Design gráfico",
  [PracticalSkill.VideoEditing]: "Edição de vídeo",
  [PracticalSkill.Sewing]: "Costura",
  [PracticalSkill.Cooking]: "Culinária / Confeitaria",
  [PracticalSkill.Driving]: "Direção de veículo",
  [PracticalSkill.Health]: "Saúde",
  [PracticalSkill.Law]: "Direito",
  [PracticalSkill.AccountingFinance]: "Contabilidade / Financeiro",
  [PracticalSkill.Education]: "Educação / Pedagogia",
  [PracticalSkill.TranslationLanguages]: "Tradução / Idiomas",
  [PracticalSkill.Other]: "Outro",
};

export const mutiraoAvailabilityLabels: Record<MutiraoAvailability, string> = {
  [MutiraoAvailability.WheneverPossible]: "Sim, sempre que puder",
  [MutiraoAvailability.Occasionally]: "Sim, ocasionalmente",
  [MutiraoAvailability.PreferNot]: "Prefiro não participar",
};
