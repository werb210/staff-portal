export const formatDate = (date: string | Date) =>
  new Date(date).toLocaleDateString();
