export interface BaseRepository<Entity> {
  findById(id: string): Promise<Entity | null>;
  findAll(): Promise<Entity[]>;
  create(entity: Entity): Promise<Entity>;
  update(entity: Entity): Promise<Entity>;
  delete(id: string): Promise<void>;
}
