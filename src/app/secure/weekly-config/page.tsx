import { RecordListTemplate } from '@/components/templates/record-list'
import { WeeklyConfigListDTO } from '@/domain/dtos/weekly-config/list'
import { weeklyConfigPageDefinition } from './page-definition'
import { WeeklyConfigController } from '@/application/controllers/weekly-config'
import { weeklyConfigFormPageDefinition } from './form/page-definition'

const WeeklyConfigPage: React.FC = () => {
  const deleteRecordHandler = async (church: WeeklyConfigListDTO) => {
    'use server'
    await WeeklyConfigController.delete(church.id)
  }

  return (
    <RecordListTemplate<WeeklyConfigListDTO>
      title={weeklyConfigPageDefinition.title}
      newRecordPageDefinition={weeklyConfigFormPageDefinition}
      getRecords={WeeklyConfigController.listAll}
      labelAttribute="name"
      deleteRecord={deleteRecordHandler}
    />
  )
}

export default WeeklyConfigPage
