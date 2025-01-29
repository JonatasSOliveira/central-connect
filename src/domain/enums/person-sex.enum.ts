export enum PersonSex {
  MALE = 'male',
  FEMALE = 'female',
}

export const PersonSexLabels: Record<PersonSex, string> = {
  [PersonSex.MALE]: 'Masculino',
  [PersonSex.FEMALE]: 'Feminino',
}
