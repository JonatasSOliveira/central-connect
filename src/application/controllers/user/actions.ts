'use server'

import { ServiceFacade } from '@/application/service-facade'
import { UserFormDTO } from '@/domain/dtos/users/form.dto'

export async function create(data: UserFormDTO) {
  return await ServiceFacade.getUserService().create(data)
}

export async function listAll() {
  return await ServiceFacade.getUserService().listAll()
}

export async function deleteData(id: string) {
  return await ServiceFacade.getUserService().delete(id)
}

export async function update(id: string, data: UserFormDTO) {
  return await ServiceFacade.getUserService().update(id, data)
}

export async function listOneById(id: string) {
  return await ServiceFacade.getUserService().listOneById(id)
}
