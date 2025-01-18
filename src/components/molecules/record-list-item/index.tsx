import { JSX } from 'react'

interface RecordListItemProps<RecordType extends { id: string }> {
  record: RecordType
  labelAttribute: keyof RecordType
}

export const RecordListItem = <RecordType extends { id: string }>({
  record,
  labelAttribute,
}: RecordListItemProps<RecordType>): JSX.Element => {
  return (
    <div className="flex">
      <p>{String(record[labelAttribute])}</p>
    </div>
  )
}
