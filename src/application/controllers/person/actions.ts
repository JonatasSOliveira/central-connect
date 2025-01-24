'use server'

import { ServiceFacade } from '@/application/service-facade'
import { PersonCreateDTO } from '@/domain/dtos/person/create'

export async function create(data: PersonCreateDTO) {
  return await ServiceFacade.getPersonService().create(data)
}

export async function listAll() {
  return await ServiceFacade.getPersonService().listAll()
}

export async function deleteData(id: string) {
  return await ServiceFacade.getPersonService().delete(id)
}

export async function update(id: string, data: PersonCreateDTO) {
  return await ServiceFacade.getPersonService().update(id, data)
}

export async function listOneById(id: string) {
  return await ServiceFacade.getPersonService().listOneById(id)
}
