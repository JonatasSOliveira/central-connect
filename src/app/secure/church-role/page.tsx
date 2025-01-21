import { RecordListTemplate } from '@/components/templates/record-list'
import { churchRoleFormPageDefinition } from './form/page-definition'
import { churchRolePageDefinition } from './page-definition'
import { ChurchRoleController } from '@/application/controllers/church-role'
import { ChurchRoleListDto } from '@/domain/dtos/church-role/list'

const ChurchPage: React.FC = () => {
  const deleteRecordHandler = async (churchRole: ChurchRoleListDto) => {
    'use server'
    await ChurchRoleController.delete(churchRole.id)
  }

  return (
    <RecordListTemplate<ChurchRoleListDto>
      title={churchRolePageDefinition.title}
      newRecordPageDefinition={churchRoleFormPageDefinition}
      getRecords={ChurchRoleController.listAll}
      labelAttribute="name"
      deleteRecord={deleteRecordHandler}
    />
  )
}

export default ChurchPage
