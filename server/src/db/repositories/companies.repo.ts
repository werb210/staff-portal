import { BaseRepo } from "./base.repo.js";
import { companies } from "../schema/companies.js";

export const companiesRepo = new BaseRepo(companies);
export default companiesRepo;
