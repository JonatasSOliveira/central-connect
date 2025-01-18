import { H1 } from '@/components/atoms/h1'
import { RecordListItem } from '@/components/molecules/record-list-item'
import { PageDefinition } from '@/types/page-definition'
import Link from 'next/link'
import { JSX } from 'react'

interface RecordListTemplateProps<RecordType extends { id: string }> {
  title: string
  newRecordPageDefinition: PageDefinition
  getRecords: () => Promise<RecordType[]>
  labelAttribute: keyof RecordType
}

export const RecordListTemplate = async <RecordType extends { id: string }>({
  title,
  newRecordPageDefinition,
  getRecords,
  labelAttribute,
}: RecordListTemplateProps<RecordType>): Promise<JSX.Element> => {
  const records = await getRecords()

  return (
    <>
      <H1>{title}</H1>
      <hr className="border-t-gray-300 border-t-2 w-full" />
      <div className="flex-1">
        {records.map((record) => (
          <RecordListItem<RecordType>
            key={record.id}
            record={record}
            labelAttribute={labelAttribute}
          />
        ))}
      </div>
      <div className="flex justify-center">
        <Link
          className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
          href={newRecordPageDefinition.path}
        >
          {newRecordPageDefinition.title}
        </Link>
      </div>
    </>
  )
}
