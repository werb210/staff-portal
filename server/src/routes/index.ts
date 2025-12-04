import { Router } from "express";

import contacts from "./contacts.routes.js";
import companies from "./companies.routes.js";
import tags from "./tags.routes.js";
import users from "./users.routes.js";
import deals from "./deals.routes.js";
import tasks from "./tasks.routes.js";

const router = Router();

router.use("/contacts", contacts);
router.use("/companies", companies);
router.use("/tags", tags);
router.use("/users", users);
router.use("/deals", deals);
router.use("/tasks", tasks);

export default router;
