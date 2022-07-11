import { Customer } from 'models/Customer'
import { Profile } from 'models/Profile'

export type UserBaseProps = {
    name: string
    lastName: string
    customerId: number
    profileId: number,
    userName: string
    enabled: boolean
    password?: string
}

export type User = UserBaseProps & {
    id: number
    uidFirebase: string
    customer: Customer
    profile: Profile
    createdAt: number
}