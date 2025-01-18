'use client'

import { RecordFormTemplate } from '@/components/templates/record-form'
import { churchFormPageDefinition } from './page-definition'
import {
  ChurchCreateDTO,
  ChurchCreateDTOSchema,
} from '@/domain/dtos/church/create'
import { churchPageDefinition } from '../page-definition'
import { ChurchController } from '@/application/controllers/church'

const ChurchFormPage = () => (
  <RecordFormTemplate<ChurchCreateDTO>
    title={churchFormPageDefinition.title}
    schema={ChurchCreateDTOSchema}
    sucessPageDefinition={churchPageDefinition}
    sucessMessage="Igreja criada com sucesso!"
    onSubmit={ChurchController.create}
    inputsDefinition={[
      { field: 'name', label: 'Nome:', placeholder: 'Igreja' },
    ]}
  />
)

export default ChurchFormPage
