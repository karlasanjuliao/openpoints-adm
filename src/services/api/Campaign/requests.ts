import { Campaign } from "models/Campaign"

export type GetCampaignsRequest = {
    customerId: string
    page: number
    search?: string
}

export type GetAllCampaignsRequest = {
    customerId: string
}

export type GetCampaignByIdRequest = {
    id: string
}

export type CreateCampaignRequest = Campaign

export type EditCampaignRequest = Campaign