import { JSX } from 'react'
import { FormProps, RecordFormTemplateForm } from './form'
import { H1 } from '@/components/atoms/h1'
import { Separator } from '@/components/atoms/separator'

interface RecordFormTemplateProps<T extends Record<string, unknown>>
  extends FormProps<T> {
  title: string
}

export const RecordFormTemplate = <T extends Record<string, unknown>>({
  title,
  ...props
}: RecordFormTemplateProps<T>): JSX.Element => (
  <>
    <H1>{title}</H1>
    <Separator />
    <RecordFormTemplateForm {...props} />
  </>
)
