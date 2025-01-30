import { Button, ButtonColors } from '@/components/atoms/button'

interface ListItemProps {
  title: string
  description?: string
  onDelete?: () => void | Promise<void>
  onEdit?: () => void | Promise<void>
  editIsPending?: boolean
  deleteIsPending?: boolean
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  description,
  onDelete,
  onEdit,
  editIsPending,
  deleteIsPending,
}) => (
  <div className="flex flex-col shadow-md p-4 rounded">
    <div className="mb-2">
      <p className="text-center font-bold">{title}</p>
      {description && <p className="text-center">{description}</p>}
    </div>
    <div className="flex justify-center gap-4">
      {onDelete && (
        <Button
          type="button"
          color={ButtonColors.DANGER}
          onClick={onDelete}
          isPending={deleteIsPending}
        >
          Excluir
        </Button>
      )}
      {onEdit && (
        <Button type="button" onClick={onEdit} isPending={editIsPending}>
          Editar
        </Button>
      )}
    </div>
  </div>
)
