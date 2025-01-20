import { create, deleteData, listAll, update } from './actions'

export class ChurchController {
  public static create = create
  public static listAll = listAll
  public static delete = deleteData
  public static update = update
}
