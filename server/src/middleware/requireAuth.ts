export default function requireAuth(req: any, res: any, next: any) {
  const header = req.headers.authorization;
  const token = header?.toString().replace("Bearer ", "");
  const headerUser = req.headers["x-user-id"];
  const userId = typeof headerUser === "string" ? headerUser : token;
  const roleHeader = req.headers["x-user-role"];
  const role = typeof roleHeader === "string" ? roleHeader : undefined;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  req.user = { id: userId, role };
  next();
}
