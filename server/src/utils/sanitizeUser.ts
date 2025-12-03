export const sanitizeUser = (u: any) => {
  if (!u) return null;

  const { passwordHash, ...rest } = u;
  return rest;
};
