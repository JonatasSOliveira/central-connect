import { Label } from '@/components/atoms/label'
import { Permission } from '@/domain/enums/permission.enum'
import { ResourceID } from '@/domain/enums/resource-id.enum'
import { ResourcePermissionModel } from '@/domain/models/resource-permission.model'
import { Control, Controller } from 'react-hook-form'

interface PermissionsConfigTableProps {
  control: Control
  error?: string
}

export const PermissionsConfigTable: React.FC<PermissionsConfigTableProps> = ({
  control,
}) => {
  const resourcesIds = Object.values(ResourceID)
  const permissions = Object.values(Permission)

  return (
    <>
      <Label htmlFor="permissionsConfigTable">Permisões</Label>
      <Controller
        control={control}
        name="resourcePermissions"
        render={({ field }) => (
          <div id="permissionsConfigTable">
            {resourcesIds.map((resourceId, index) => (
              <div key={`${resourceId}-${index}`}>
                <Label>{resourceId}</Label>
                <div>
                  {permissions.map((permission, index) => (
                    <div
                      key={`${resourceId}-${permission}-${index}`}
                      className="flex items-centerflex-row gap-2"
                    >
                      <Label
                        htmlFor={`${resourceId}-${permission}`}
                        className="font-normal"
                      >
                        {permission}
                      </Label>
                      <input
                        id={`${resourceId}-${permission}`}
                        type="checkbox"
                        key={permission}
                        checked={field.value
                          .find(
                            (rp: ResourcePermissionModel) =>
                              rp.resourceId === resourceId,
                          )
                          ?.permissions.includes(permission)}
                        onChange={() => {
                          const resourcePermission: ResourcePermissionModel =
                            field.value.find(
                              (rp: ResourcePermissionModel) =>
                                rp.resourceId === resourceId,
                            )
                          if (
                            resourcePermission.permissions.includes(permission)
                          ) {
                            resourcePermission.permissions =
                              resourcePermission.permissions.filter(
                                (p) => p !== permission,
                              )
                          } else {
                            resourcePermission.permissions.push(permission)
                          }

                          field.onChange(field.value)
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      />
    </>
  )
}
