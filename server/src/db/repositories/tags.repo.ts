import { BaseRepo } from "./base.repo.js";
import { tags } from "../schema/tags.js";

export const tagsRepo = new BaseRepo(tags);
export default tagsRepo;
