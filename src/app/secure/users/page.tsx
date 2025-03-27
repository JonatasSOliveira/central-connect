import { RecordListTemplate } from '@/components/templates/record-list'
import { UserListDTO } from '@/domain/dtos/users/list.dto'
import { usersPageDefinition } from './page-definition'
import { UserController } from '@/application/controllers/user'
import { userFormPageDefinition } from './form/page-definition'

const UsersPage = () => {
  const deleteRecordHandler = async (userRole: UserListDTO) => {
    'use server'
    await UserController.delete(userRole.id)
  }

  return (
    <RecordListTemplate<UserListDTO>
      title={usersPageDefinition.title}
      getRecords={UserController.listAll}
      labelAttribute="person.name"
      deleteRecord={deleteRecordHandler}
      newRecordPageDefinition={userFormPageDefinition}
    />
  )
}

export default UsersPage
