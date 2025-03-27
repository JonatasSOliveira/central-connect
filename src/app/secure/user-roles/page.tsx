import { RecordListTemplate } from '@/components/templates/record-list'
import { UserRoleListDTO } from '@/domain/dtos/user-role/list.dto'
import { userRolesPageDefinition } from './page-definition'
import { UserRoleController } from '@/application/controllers/user-role'
import { userRoleFormPageDefinition } from './form/page-definition'

const UserRolesPage: React.FC = () => {
  const deleteRecordHandler = async (userRole: UserRoleListDTO) => {
    'use server'
    await UserRoleController.delete(userRole.id)
  }

  return (
    <RecordListTemplate<UserRoleListDTO>
      title={userRolesPageDefinition.title}
      getRecords={UserRoleController.listAll}
      labelAttribute="name"
      deleteRecord={deleteRecordHandler}
      newRecordPageDefinition={userRoleFormPageDefinition}
    />
  )
}

export default UserRolesPage
