'use server'

import { ServiceFacade } from '@/application/service-facade'
import { ChurchCreateDTO } from '@/domain/dtos/church/create'

export async function create(data: ChurchCreateDTO) {
  return await ServiceFacade.getChurchService().create(data)
}

export async function listAll() {
  return await ServiceFacade.getChurchService().listAll()
}

export async function deleteData(id: string) {
  return await ServiceFacade.getChurchService().delete(id)
}

export async function update(id: string, data: ChurchCreateDTO) {
  return await ServiceFacade.getChurchService().update(id, data)
}
