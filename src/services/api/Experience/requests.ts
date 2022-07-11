import { Experience } from 'models/Experience'

export type GetExperiencesRequest = {
    page: number
    search?: string
}

export type GetExperienceByIdRequest = {
    id: string
}

export type CreateExperienceRequest = Experience

export type EditExperienceRequest = Experience

export type DeleteExperienceRequest = {
    id: number
  }

export type GetExperienceTypesRequest = {
    customerId: string
}

export type DeleteExperienceDateRequest = number