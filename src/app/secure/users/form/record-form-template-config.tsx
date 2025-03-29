'use client'

import { RecordFormTemplate } from '@/components/templates/record-form'
import { FormInputType } from '@/components/molecules/form-input'
import { UserFormDTO, UserFormDTOSchema } from '@/domain/dtos/users/form.dto'
import { UserRoleListDTO } from '@/domain/dtos/user-role/list.dto'
import { usersPageDefinition } from '../page-definition'

interface UserFormTemplateConfigProps {
  title: string
  onSubmit: (data: UserFormDTO) => Promise<unknown>
  userRoles: UserRoleListDTO[]
  initialValue?: UserFormDTO
}

export const UserFormTemplateConfig: React.FC<UserFormTemplateConfigProps> = ({
  title,
  onSubmit,
  userRoles,
  initialValue,
}) => (
  <RecordFormTemplate<UserFormDTO>
    title={title}
    schema={UserFormDTOSchema}
    sucessPageDefinition={usersPageDefinition}
    sucessMessage="Usuário salvo com sucesso!"
    onSubmit={onSubmit}
    inputsDefinition={[
      { field: 'person.name', label: 'Nome' },
      { field: 'person.phoneNumber', label: 'Número de celular' },
      {
        field: 'userRoleId',
        label: 'Cargo',
        type: FormInputType.COMBO_BOX,
        options: userRoles.map((userRole) => ({
          id: userRole.id,
          label: userRole.name,
          value: userRole.id,
        })),
      },
      {
        field: 'password',
        label: 'Senha',
        type: FormInputType.PASSWORD,
      },
      {
        field: 'confirmPassword',
        label: 'Confirmar Senha',
        type: FormInputType.PASSWORD,
      },
    ]}
    initialValue={initialValue}
  />
)
