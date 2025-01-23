import { ChurchStorageDTO } from '../dtos/church/storage'
import { ChurchStoragePortInbound } from '../ports/inbound/church-storage'
import { ServerDataStoragePortOut } from '../ports/out/server-data-storage'

export class ChurchStorageService implements ChurchStoragePortInbound {
  private readonly storageKey = 'selectedChurch'

  constructor(private readonly dataStore: ServerDataStoragePortOut) {}

  public async set(session: ChurchStorageDTO): Promise<void> {
    return await this.dataStore.set<ChurchStorageDTO>(this.storageKey, session)
  }

  public async get(): Promise<ChurchStorageDTO> {
    const selectedChurch = await this.dataStore.get<ChurchStorageDTO>(
      this.storageKey,
    )

    if (!selectedChurch) {
      throw new Error('No church selected')
    }

    return selectedChurch
  }

  public async erase(): Promise<void> {
    return await this.dataStore.erase(this.storageKey)
  }
}
