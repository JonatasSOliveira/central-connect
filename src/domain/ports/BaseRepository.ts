export interface BaseRepository<Entity> {
  findById(id: string): Promise<Entity | null>;
  findAll(): Promise<Entity[]>;
  save(entity: Entity): Promise<Entity>;
  delete(id: string): Promise<void>;
}
