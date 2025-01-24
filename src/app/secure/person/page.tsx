import { RecordListTemplate } from '@/components/templates/record-list'
import { personsPageDefinition } from './page-definition'
import { PersonListDTO } from '@/domain/dtos/person/list'
import { PersonController } from '@/application/controllers/person'
import { personsFormPageDefinition } from './form/page-definition'

const ChurchPage: React.FC = () => {
  const deleteRecordHandler = async (person: PersonListDTO) => {
    'use server'
    await PersonController.delete(person.id)
  }

  return (
    <RecordListTemplate<PersonListDTO>
      title={personsPageDefinition.title}
      newRecordPageDefinition={personsFormPageDefinition}
      getRecords={PersonController.listAll}
      labelAttribute="name"
      deleteRecord={deleteRecordHandler}
    />
  )
}

export default ChurchPage
