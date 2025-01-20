'use client'

import { ChurchController } from '@/application/controllers/church'
import { ChurchFormComponent } from '../form-component'
import { churchEditFormPageDefinition } from './page-definition'
import { ChurchListDto } from '@/domain/dtos/church/list'

interface ChurchEditFormProps {
  church: ChurchListDto
}

export const ChurchEditForm: React.FC<ChurchEditFormProps> = ({ church }) => (
  <ChurchFormComponent
    title={churchEditFormPageDefinition.title}
    onSubmit={async (data) => await ChurchController.update(church.id, data)}
    initialValue={church}
  />
)
