import { ChurchRoleController } from '@/application/controllers/church-role'
import {
  PersonFormProps,
  PersonFormTemplateConfig,
} from './record-form-template-config'

type PersonFormComponentProps = Omit<PersonFormProps, 'churchRolesOptions'>

export const PersonFormComponent: React.FC<PersonFormComponentProps> = async (
  props,
) => {
  const churchRoles = await ChurchRoleController.listAll()
  const churchRoleOptions = churchRoles.map((churchRole) => ({
    label: churchRole.name,
    value: churchRole.id,
    id: churchRole.id,
  }))

  return (
    <PersonFormTemplateConfig
      {...props}
      churchRolesOptions={churchRoleOptions}
    />
  )
}
