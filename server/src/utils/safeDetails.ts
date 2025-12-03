export const safeDetails = (value: any): Record<string, any> => {
  return value && typeof value === "object" ? (value as Record<string, any>) : {};
};
