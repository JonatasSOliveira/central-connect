import { create, deleteData, listAll } from './actions'

export class ChurchController {
  public static create = create
  public static listAll = listAll
  public static delete = deleteData
}
