import { PersonFormComponent } from './form-component'
import { personsFormPageDefinition } from './page-definition'
import { PersonController } from '@/application/controllers/person'

const PersonFormPage = () => (
  <PersonFormComponent
    title={personsFormPageDefinition.title}
    onSubmit={PersonController.create}
  />
)

export default PersonFormPage
