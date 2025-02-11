import { RecordListTemplate } from '@/components/templates/record-list'
import { churchFormPageDefinition } from './form/page-definition'
import { ChurchController } from '@/application/controllers/church'
import { ChurchListDto } from '@/domain/dtos/church/list'
import { churchPageDefinition } from './page-definition'

const ChurchPage: React.FC = () => {
  const deleteRecordHandler = async (church: ChurchListDto) => {
    'use server'
    await ChurchController.delete(church.id)
  }

  return (
    <RecordListTemplate<ChurchListDto>
      title={churchPageDefinition.title}
      newRecordPageDefinition={churchFormPageDefinition}
      getRecords={ChurchController.listAll}
      labelAttribute="name"
      deleteRecord={deleteRecordHandler}
    />
  )
}

export default ChurchPage
