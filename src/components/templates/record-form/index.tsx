import { JSX } from 'react'
import { FormProps, RecordFormTemplateForm } from './form'

interface RecordFormTemplateProps<T extends Record<string, unknown>>
  extends FormProps<T> {
  title: string
}

export const RecordFormTemplate = <T extends Record<string, unknown>>({
  title,
  ...props
}: RecordFormTemplateProps<T>): JSX.Element => (
  <>
    <h1 className="text-2xl font-bold">{title}</h1>
    <hr className="border-t-gray-300 border-t-2 w-full" />
    <RecordFormTemplateForm {...props} />
  </>
)
