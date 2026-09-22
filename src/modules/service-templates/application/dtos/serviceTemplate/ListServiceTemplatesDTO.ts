export type ServiceTemplateListItem = {
  id: string;
  churchId: string;
  title: string;
  dayOfWeek: string;
  time: string;
  location: string | null;
  isActive: boolean;
};

export type ListServiceTemplatesOutput = {
  templates: ServiceTemplateListItem[];
};
