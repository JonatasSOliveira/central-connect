'use client'

import { RecordFormTemplate } from '@/components/templates/record-form'

import {
  UserRoleFormDTO,
  UserRoleFormDTOSchema,
} from '@/domain/dtos/user-role/form.dto'
import { userRolesPageDefinition } from '../page-definition'
import { ResourceID } from '@/domain/enums/resource-id.enum'
import { ResourcePermissionModel } from '@/domain/models/resource-permission.model'
import { PermissionsConfigTable } from './permissions-config-table'
import { Control } from 'react-hook-form'

export interface UserRoleFormProps {
  title: string
  onSubmit: (data: UserRoleFormDTO) => Promise<unknown>
  initialValue?: UserRoleFormDTO
}

export const UserRoleFormTemplateConfig: React.FC<UserRoleFormProps> = ({
  title,
  onSubmit,
  initialValue,
}) => {
  const resourcePermissions: ResourcePermissionModel[] = Object.values(
    ResourceID,
  ).map((resourceId) => ({
    resourceId,
    permissions: [],
  }))

  return (
    <RecordFormTemplate<UserRoleFormDTO>
      title={title}
      schema={UserRoleFormDTOSchema}
      sucessPageDefinition={userRolesPageDefinition}
      sucessMessage="Pessoa salva com sucesso!"
      onSubmit={onSubmit}
      inputsDefinition={[
        { field: 'name', label: 'Nome:', placeholder: 'NOME' },
        {
          field: 'resourcePermissions',
          customComponent: ({ control, errors }) => (
            <PermissionsConfigTable
              control={control as unknown as Control}
              error={errors.resourcePermissions?.message}
            />
          ),
        },
      ]}
      initialValue={initialValue ?? { resourcePermissions }}
    />
  )
}
