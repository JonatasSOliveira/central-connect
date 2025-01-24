'use server'

import { ServiceFacade } from '@/application/service-facade'
import { ChurchRoleCreateDTO } from '@/domain/dtos/church-role/create'

export async function create(data: ChurchRoleCreateDTO) {
  return await ServiceFacade.getChurchRoleService().create(data)
}

export async function listAll() {
  return await ServiceFacade.getChurchRoleService().listAll()
}

export async function deleteData(id: string) {
  return await ServiceFacade.getChurchRoleService().delete(id)
}

export async function update(id: string, data: ChurchRoleCreateDTO) {
  return await ServiceFacade.getChurchRoleService().update(id, data)
}

export async function listOneById(id: string) {
  return await ServiceFacade.getChurchRoleService().listOneById(id)
}
