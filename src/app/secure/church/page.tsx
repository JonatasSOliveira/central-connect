import { RecordListTemplate } from '@/components/templates/record-list'
import { churchFormPageDefinition } from './form/page-definition'
import { ChurchController } from '@/application/controllers/church'
import { ChurchListDto } from '@/domain/dtos/church/list'

const ChurchPage: React.FC = () => (
  <RecordListTemplate<ChurchListDto>
    title={churchFormPageDefinition.title}
    newRecordPageDefinition={churchFormPageDefinition}
    getRecords={ChurchController.listAll}
    labelAttribute="name"
  />
)

export default ChurchPage
