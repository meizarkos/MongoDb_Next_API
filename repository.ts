export default interface IRepository<T> {
  getAll: () => T[];
  get: (id: number) => T;
  add: (item: T) => void;
  delete: (id: number) => void;
  put: (id: number, item: any) => void;
  getBy?: (attribute: string, value: string) => T | undefined;
}
