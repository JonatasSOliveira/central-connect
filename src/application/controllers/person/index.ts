import { create, deleteData, listAll, listOneById, update } from './actions'

export class PersonController {
  public static create = create
  public static listAll = listAll
  public static delete = deleteData
  public static update = update
  public static listOneById = listOneById
}
