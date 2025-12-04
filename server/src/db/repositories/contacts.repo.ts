import { BaseRepo } from "./base.repo.js";
import { contacts } from "../schema/contacts.js";

export const contactsRepo = new BaseRepo(contacts);
export default contactsRepo;
