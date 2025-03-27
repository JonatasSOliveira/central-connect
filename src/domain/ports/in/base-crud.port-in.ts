export interface BaseCrudPortIn<CreateDTO, UpdateDTO, ListDTO> {
  create(data: CreateDTO): Promise<string>
  listAll(): Promise<ListDTO[]>
  delete(id: string): Promise<void>
  update(id: string, data: UpdateDTO): Promise<void>
  listOneById(id: string): Promise<ListDTO>
}
