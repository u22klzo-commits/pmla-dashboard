export type ServiceResult<T> = {
    success: boolean
    data?: T
    error?: string
}

export interface BaseService {
    version: string
}
