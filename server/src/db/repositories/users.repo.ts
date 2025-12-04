import { BaseRepo } from "./base.repo.js";
import { users } from "../schema/users.js";

export const usersRepo = new BaseRepo(users);
export default usersRepo;
