import { ChurchController } from '@/application/controllers/church'
import { ChurchEditForm } from './form'

interface ChurchEditFormPageProps {
  params: Promise<{ id: string }>
}

const ChurchEditFormPage: React.FC<ChurchEditFormPageProps> = async ({
  params,
}) => {
  const { id } = await params
  const church = await ChurchController.listOneById(id)

  return <ChurchEditForm church={church} />
}

export default ChurchEditFormPage
