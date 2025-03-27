'use server'

import { ServiceFacade } from '@/application/service-facade'
import { WeeklyConfigFormDTO } from '@/domain/dtos/weekly-config/form'

export async function create(data: WeeklyConfigFormDTO) {
  return await ServiceFacade.getWeekConfigService().create(data)
}

export async function listAll() {
  return await ServiceFacade.getWeekConfigService().listAll()
}

export async function deleteData(id: string) {
  return await ServiceFacade.getWeekConfigService().delete(id)
}

export async function update(id: string, data: WeeklyConfigFormDTO) {
  return await ServiceFacade.getWeekConfigService().update(id, data)
}

export async function listOneById(id: string) {
  return await ServiceFacade.getWeekConfigService().listOneById(id)
}
