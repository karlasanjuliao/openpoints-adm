import { Customer } from "models/Customer";

export type Campaign = {
    id: number,
    campaignCode: number
    customerId: number,
    customer: Customer,
    name: string,
    startDate: number
    endDate: number
    destinoFeriasFee: number
    campaignConfig: {
        webpremiosClientId: string
        webpremiosScope: string
        redirectUrlAuth: string
        conversionRate: number
    }
}