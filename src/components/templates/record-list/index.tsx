import { Button } from '@/components/atoms/button'
import { H1 } from '@/components/atoms/h1'
import { RecordListItem } from '@/components/organisms/record-list-item'
import { PageDefinition } from '@/types/page-definition'
import Link from 'next/link'
import { JSX } from 'react'

interface RecordListTemplateProps<RecordType extends { id: string }> {
  title: string
  newRecordPageDefinition: PageDefinition
  getRecords: () => Promise<RecordType[]>
  labelAttribute: keyof RecordType
  deleteRecord: (record: RecordType) => Promise<void>
}

export const RecordListTemplate = async <RecordType extends { id: string }>({
  title,
  newRecordPageDefinition,
  getRecords,
  labelAttribute,
  deleteRecord,
}: RecordListTemplateProps<RecordType>): Promise<JSX.Element> => {
  const records = await getRecords()

  return (
    <>
      <H1>{title}</H1>
      <hr className="border-t-gray-300 border-t-2 w-full" />
      <div className="flex-1 w-full">
        {records.map((record) => (
          <RecordListItem<RecordType>
            key={record.id}
            record={record}
            labelAttribute={labelAttribute}
            deleteRecord={deleteRecord}
            updateFormPagePath={newRecordPageDefinition.path}
          />
        ))}
      </div>
      <div className="flex justify-center">
        <Link href={newRecordPageDefinition.path}>
          <Button type="button">{newRecordPageDefinition.title}</Button>
        </Link>
      </div>
    </>
  )
}
