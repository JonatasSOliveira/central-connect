import { churchRolePageDefinition } from '../page-definition'
import { ChurchRoleFormComponent } from './form-component'
import { ChurchRoleController } from '@/application/controllers/church-role'

const ChurchRoleFormPage = () => (
  <ChurchRoleFormComponent
    title={churchRolePageDefinition.title}
    onSubmit={ChurchRoleController.create}
  />
)

export default ChurchRoleFormPage
