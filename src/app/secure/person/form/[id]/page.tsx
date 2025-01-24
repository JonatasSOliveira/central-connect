import { PersonController } from '@/application/controllers/person'
import { PersonFormComponent } from '../form-component'
import { personEditFormPageDefinition } from './page-definition'

interface PersonEditFormPageProps {
  params: Promise<{ id: string }>
}

const PersonEditFormPage: React.FC<PersonEditFormPageProps> = async ({
  params,
}) => {
  const { id } = await params
  const person = await PersonController.listOneById(id)

  return (
    <PersonFormComponent
      title={personEditFormPageDefinition.title}
      onSubmit={async (data) => {
        'use server'
        await PersonController.update(person.id, data)
      }}
      initialValue={person}
    />
  )
}

export default PersonEditFormPage
