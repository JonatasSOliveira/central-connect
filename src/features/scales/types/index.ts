export interface ServiceOption {
  id: string;
  title: string;
  date: string;
  time: string;
}

export interface MinistryOption {
  id: string;
  name: string;
}

export interface MemberOption {
  id: string;
  fullName: string;
  ministryRoles: Array<{
    ministryRoleId: string;
    roleName: string;
  }>;
}

export interface MinistryRoleOption {
  id: string;
  name: string;
  requiredCount: number;
  displayOrder: number;
}
