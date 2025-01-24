import { ChurchRoleFormComponent } from '../form-component'
import { ChurchRoleController } from '@/application/controllers/church-role'
import { churchRoleEditFormPageDefinition } from './page-definition'

interface ChurchRoleEditFormPageProps {
  params: Promise<{ id: string }>
}

const ChurchRoleEditFormPage: React.FC<ChurchRoleEditFormPageProps> = async ({
  params,
}) => {
  const { id } = await params
  const churchRole = await ChurchRoleController.listOneById(id)

  return (
    <ChurchRoleFormComponent
      title={churchRoleEditFormPageDefinition.title}
      onSubmit={async (data) =>
        await ChurchRoleController.update(churchRole.id, data)
      }
      initialValue={churchRole}
    />
  )
}

export default ChurchRoleEditFormPage
