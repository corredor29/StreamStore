export const getPagination = (page?: unknown, limit?: unknown) => {
    const p = Math.max(Number(page) || 1, 1)
    const l = Math.min(Math.max(Number(limit) || 10, 1), 100)
    return { page: p, limit: l, offset: (p - 1) * l }
}

export const buildMeta = (total: number, page: number, limit: number) => {
    return { total, page, limit, totalPages: Math.ceil(total / limit) }
}
