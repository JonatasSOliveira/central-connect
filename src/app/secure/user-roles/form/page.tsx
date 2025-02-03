import { UserRoleFormTemplateConfig } from './record-form-template-config'
import { userRoleFormPageDefinition } from './page-definition'
import { UserRoleController } from '@/application/controllers/user-role'

const UserRoleForm: React.FC = () => (
  <UserRoleFormTemplateConfig
    title={userRoleFormPageDefinition.title}
    onSubmit={UserRoleController.create}
  />
)

export default UserRoleForm
