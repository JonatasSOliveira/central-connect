'use client'

import { RecordFormTemplate } from '@/components/templates/record-form'
import { personsPageDefinition } from '../page-definition'
import {
  PersonCreateDTO,
  PersonCreateDTOSchema,
} from '@/domain/dtos/person/create'
import { FormInputType } from '@/components/molecules/form-input'
import { ComboBoxOption } from '@/components/atoms/combo-box'
import { PersonSex, PersonSexLabels } from '@/domain/enums/person-sex.enum'

export interface PersonFormProps {
  title: string
  onSubmit: (data: PersonCreateDTO) => Promise<unknown>
  initialValue?: PersonCreateDTO
  churchRolesOptions: ComboBoxOption[]
}

export const PersonFormTemplateConfig: React.FC<PersonFormProps> = ({
  title,
  onSubmit,
  initialValue,
  churchRolesOptions,
}) => (
  <RecordFormTemplate<PersonCreateDTO>
    title={title}
    schema={PersonCreateDTOSchema}
    sucessPageDefinition={personsPageDefinition}
    sucessMessage="Pessoa salva com sucesso!"
    onSubmit={onSubmit}
    inputsDefinition={[
      { field: 'name', label: 'Nome:', placeholder: 'NOME' },
      { field: 'phoneNumber', label: 'Telefone:', placeholder: '99999999999' },
      {
        field: 'churchRoleId',
        label: 'Cargo:',
        type: FormInputType.COMBO_BOX,
        options: churchRolesOptions,
      },
      {
        field: 'sex',
        label: 'Sexo:',
        type: FormInputType.COMBO_BOX,
        options: Object.values(PersonSex).map((sex) => ({
          label: PersonSexLabels[sex],
          value: sex,
          id: sex,
        })),
      },
    ]}
    initialValue={initialValue}
  />
)
