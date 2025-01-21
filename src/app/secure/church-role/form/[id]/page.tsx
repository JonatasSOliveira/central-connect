import { ChurchRoleEditForm } from './form'
import { ChurchRoleController } from '@/application/controllers/church-role'

interface ChurchEditFormPageProps {
  params: Promise<{ id: string }>
}

const ChurchEditFormPage: React.FC<ChurchEditFormPageProps> = async ({
  params,
}) => {
  const { id } = await params
  const churchRole = await ChurchRoleController.listOneById(id)

  return <ChurchRoleEditForm churchRole={churchRole} />
}

export default ChurchEditFormPage
