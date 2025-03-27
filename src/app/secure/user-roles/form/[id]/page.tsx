import { UserRoleController } from '@/application/controllers/user-role'
import { userRoleEditFormPageDefinition } from './page-definition'
import { UserRoleFormTemplateConfig } from '../record-form-template-config'

interface UserRoleFormEditPageProps {
  params: Promise<{ id: string }>
}

const UserRoleFormEditPage: React.FC<UserRoleFormEditPageProps> = async ({
  params,
}) => {
  const { id } = await params
  const userRole = await UserRoleController.listOneById(id)

  return (
    <UserRoleFormTemplateConfig
      title={userRoleEditFormPageDefinition.title}
      onSubmit={async (data) => {
        'use server'
        await UserRoleController.update(userRole.id, data)
      }}
      initialValue={userRole}
    />
  )
}

export default UserRoleFormEditPage
