export function buildPagination(page = 1, pageSize = 25, extra = {}) {
  return {
    page,
    pageSize,
    ...extra,
  };
}

export function parsePaginatedResponse(res: any) {
  return {
    items: res?.items || [],
    total: res?.total || 0,
    page: res?.page || 1,
    pageSize: res?.pageSize || 25,
  };
}
