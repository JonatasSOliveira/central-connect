import { H1 } from '@/components/atoms/h1'
import { weeklyConfigFormPageDefinition } from './page-definition'
import { Separator } from '@/components/atoms/separator'
import { WeeklyConfigForm } from './form'

const WeeklyConfigFormPage: React.FC = () => (
  <>
    <H1>{weeklyConfigFormPageDefinition.title}</H1>
    <Separator />
    <WeeklyConfigForm />
  </>
)

export default WeeklyConfigFormPage
