export type ExperienceDefaultValues = {
    id?: number
    qtTotal?: number,
    qtAvailable?: number,
    qtSold?: number,
    name?: string,
}

export type ExperiencesInfo = {
    experiencesSalesSummary: ExperienceDefaultValues[]
    salesByExperienceTypes: ExperienceDefaultValues[]
    salesMonth: ExperienceDefaultValues[]
}