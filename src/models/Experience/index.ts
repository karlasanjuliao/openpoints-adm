import { Customer } from "models/Customer";
import { City } from "models/City";

export type ExperienceType = {
    id: number,
    customerId: number,
    name: string,
    enabled: boolean
}

export type VoucherType = {
    id: number,
    name: string,
    enabled: boolean
}

export type ExperienceDate = {
    id?: number,
    experienceId: number,
    date: string,
    time?: string,
    qtAvailable: number
    newDate?: boolean
}

export type Experience = {
    id?: number
    customerId: number
    customer: Customer
    name: string
    description: string
    whatToExpect: string
    qtParticipants: number
    category: string
    experienceTypeId: number
    experienceType: ExperienceType
    voucherTypeId: number
    voucherType: VoucherType
    duration: number
    unitDuration: string
    period: string
    whatIsIncluded: string
    whatIsNotIncluded: string
    importantInfo: string
    originalPrice: number
    price: number
    cityId: number
    city: City
    localization: string
    startDate: string
    endDate: string
    freeCancel: boolean
    cancellationPolicy: string
    experienceDates: ExperienceDate[]
}