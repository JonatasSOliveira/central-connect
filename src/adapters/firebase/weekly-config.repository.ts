import { WeeklyConfigRepository } from '@/domain/ports/out/weekly-config-repository'
import { FirebaseBaseRepository } from './base-repository'
import { WeeklyConfigModel } from '@/domain/models/weekly-config.model'

export class FirebaseWeeklyConfigRepository
  extends FirebaseBaseRepository<WeeklyConfigModel>
  implements WeeklyConfigRepository
{
  constructor() {
    super('weeklyConfigs')
  }
}
