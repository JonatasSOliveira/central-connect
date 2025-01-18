'use server'

import { ServiceFacade } from '@/application/service-facade'
import { ChurchCreateDTO } from '@/domain/dtos/church/create'

export async function create(data: ChurchCreateDTO) {
  return await ServiceFacade.getChurch().create(data)
}

export async function listAll() {
  return await ServiceFacade.getChurch().listAll()
}
