import { type IUser } from "./model";
import IRepository from "../repository";

export class UserRepository implements IRepository<IUser> {
  users: IUser[];

  constructor() {
    this.users = [];
  }

  getAll(): IUser[] {
    return this.users.map((user, index) => {
      return {
        ...user,
        id: index + 1,
      };
    });
  }

  get(id: number): IUser {
    return this.users[id - 1];
  }

  getBy(attribute: string, value: string): IUser | undefined {
    return this.users.find((u) => (u as any)[attribute] == value);
  }

  put(id: number, item: any): void {
    this.users[id - 1] = {
      ...this.users[id - 1],
      ...item,
    };
  }

  add(item: IUser): void {
    this.users.push(item);
  }

  delete(id: number): boolean {
    if (this.users[id - 1] === undefined) {
      return false;
    }
    this.users.splice(id - 1, 1);

    return true;
  }
}

export default new UserRepository();
