'use server'

import { ServiceFacade } from '@/application/service-facade'
import { UserRoleFormDTO } from '@/domain/dtos/user-role/form.dto'

export async function create(data: UserRoleFormDTO) {
  return await ServiceFacade.getUserRoleService().create(data)
}

export async function listAll() {
  return await ServiceFacade.getUserRoleService().listAll()
}

export async function deleteData(id: string) {
  return await ServiceFacade.getUserRoleService().delete(id)
}

export async function update(id: string, data: UserRoleFormDTO) {
  return await ServiceFacade.getUserRoleService().update(id, data)
}

export async function listOneById(id: string) {
  return await ServiceFacade.getUserRoleService().listOneById(id)
}
