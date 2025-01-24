import { churchPageDefinition } from '../page-definition'
import { ChurchController } from '@/application/controllers/church'
import { ChurchFormComponent } from './form-component'

const ChurchFormPage = () => (
  <ChurchFormComponent
    title={churchPageDefinition.title}
    onSubmit={ChurchController.create}
  />
)

export default ChurchFormPage
