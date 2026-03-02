export const parsePaginationParams = (page?: number, pageSize?: number) => {
  const limit = pageSize && pageSize > 0 ? pageSize : 20;
  const offset = page && page > 0 ? (page - 1) * limit : 0;
  return { limit, offset, page: offset / limit + 1, pageSize: limit };
};
