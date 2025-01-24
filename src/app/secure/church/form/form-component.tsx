'use client'

import { RecordFormTemplate } from '@/components/templates/record-form'
import {
  ChurchCreateDTO,
  ChurchCreateDTOSchema,
} from '@/domain/dtos/church/create'
import { churchPageDefinition } from '../page-definition'

interface ChurchFormProps {
  title: string
  onSubmit: (data: ChurchCreateDTO) => Promise<unknown>
  initialValue?: ChurchCreateDTO
}

export const ChurchFormComponent: React.FC<ChurchFormProps> = ({
  title,
  onSubmit,
  initialValue,
}) => (
  <RecordFormTemplate<ChurchCreateDTO>
    title={title}
    schema={ChurchCreateDTOSchema}
    sucessPageDefinition={churchPageDefinition}
    sucessMessage="Igreja salva com sucesso!"
    onSubmit={onSubmit}
    inputsDefinition={[
      { field: 'name', label: 'Nome:', placeholder: 'Igreja' },
    ]}
    initialValue={initialValue}
  />
)
