'use client'

import { ChurchRoleFormComponent } from '../form-component'
import { churchRoleEditFormPageDefinition } from './page-definition'
import { ChurchRoleListDto } from '@/domain/dtos/church-role/list'
import { ChurchRoleController } from '@/application/controllers/church-role'

interface ChurchRoleEditFormProps {
  churchRole: ChurchRoleListDto
}

export const ChurchRoleEditForm: React.FC<ChurchRoleEditFormProps> = ({
  churchRole,
}) => (
  <ChurchRoleFormComponent
    title={churchRoleEditFormPageDefinition.title}
    onSubmit={async (data) =>
      await ChurchRoleController.update(churchRole.id, data)
    }
    initialValue={churchRole}
  />
)
