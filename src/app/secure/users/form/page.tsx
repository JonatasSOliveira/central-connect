import { UserFormTemplateConfig } from './record-form-template-config'
import { userFormPageDefinition } from './page-definition'
import { UserController } from '@/application/controllers/user'
import { UserRoleController } from '@/application/controllers/user-role'

const UserFormPage: React.FC = async () => {
  const userRoles = await UserRoleController.listAll()

  return (
    <UserFormTemplateConfig
      title={userFormPageDefinition.title}
      onSubmit={UserController.create}
      userRoles={userRoles}
    />
  )
}

export default UserFormPage
