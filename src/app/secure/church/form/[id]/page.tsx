import { ChurchController } from '@/application/controllers/church'
import { ChurchFormComponent } from '../form-component'
import { churchEditFormPageDefinition } from './page-definition'

interface ChurchEditFormPageProps {
  params: Promise<{ id: string }>
}

const ChurchEditFormPage: React.FC<ChurchEditFormPageProps> = async ({
  params,
}) => {
  const { id } = await params
  const church = await ChurchController.listOneById(id)

  return (
    <ChurchFormComponent
      title={churchEditFormPageDefinition.title}
      onSubmit={async (data) => await ChurchController.update(church.id, data)}
      initialValue={church}
    />
  )
}

export default ChurchEditFormPage
