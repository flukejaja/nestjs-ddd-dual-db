export interface IBaseService<T> {
  create(data: any): Promise<T>;
  findById(id: string): Promise<T>;
  findAll(): Promise<T[]>;
  update(id: string, data: any): Promise<T>;
  delete(id: string): Promise<boolean>;
}
