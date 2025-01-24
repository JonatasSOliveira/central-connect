'use client'

import { RecordFormTemplate } from '@/components/templates/record-form'

import { churchRolePageDefinition } from '../page-definition'
import {
  ChurchRoleCreateDTO,
  ChurchRoleCreateDTOSchema,
} from '@/domain/dtos/church-role/create'

interface ChurchFormProps {
  title: string
  onSubmit: (data: ChurchRoleCreateDTO) => Promise<unknown>
  initialValue?: ChurchRoleCreateDTO
}

export const ChurchRoleFormComponent: React.FC<ChurchFormProps> = ({
  title,
  onSubmit,
  initialValue,
}) => (
  <RecordFormTemplate<ChurchRoleCreateDTO>
    title={title}
    schema={ChurchRoleCreateDTOSchema}
    sucessPageDefinition={churchRolePageDefinition}
    sucessMessage="Cargo salvo com sucesso!"
    onSubmit={onSubmit}
    inputsDefinition={[
      { field: 'name', label: 'Nome:', placeholder: 'Volutário' },
    ]}
    initialValue={initialValue}
  />
)
