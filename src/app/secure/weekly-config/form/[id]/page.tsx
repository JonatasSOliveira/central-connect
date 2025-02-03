import { WeeklyConfigController } from '@/application/controllers/weekly-config'
import { H1 } from '@/components/atoms/h1'
import { Separator } from '@/components/atoms/separator'
import { WeeklyConfigForm } from '../form'
import { weeklyConfigEditFormPageDefinition } from './page-definition'

interface WeeklyConfigEditFormPageProps {
  params: Promise<{ id: string }>
}

const WeeklyConfigEditFormPage: React.FC<
  WeeklyConfigEditFormPageProps
> = async ({ params }) => {
  const { id } = await params
  const weeklyConfig = await WeeklyConfigController.listOneById(id)

  return (
    <>
      <H1>{weeklyConfigEditFormPageDefinition.title}</H1>
      <Separator />
      <WeeklyConfigForm weeklyConfig={weeklyConfig} />
    </>
  )
}

export default WeeklyConfigEditFormPage
