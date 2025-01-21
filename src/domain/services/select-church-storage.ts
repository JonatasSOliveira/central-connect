import {
  ChurchStorageSelectDTO,
  SelectChurchStoragePortInbound,
} from '../ports/inbound/select-church-storage'
import { ServerDataStoragePortOut } from '../ports/out/server-data-storage'

export class SelectChurchStorageService
  implements SelectChurchStoragePortInbound
{
  private readonly storageKey = 'selectedChurch'

  constructor(private readonly dataStore: ServerDataStoragePortOut) {}

  public async set(session: ChurchStorageSelectDTO): Promise<void> {
    return await this.dataStore.set<ChurchStorageSelectDTO>(
      this.storageKey,
      session,
    )
  }

  public async get(): Promise<ChurchStorageSelectDTO> {
    const selectedChurch = await this.dataStore.get<ChurchStorageSelectDTO>(
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
