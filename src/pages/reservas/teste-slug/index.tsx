import { useRouter } from 'next/router';

import { useAuth } from 'contexts/AuthUserContext';
import BookingList from 'components/layout/BookingList';
import { useEffect, useState } from 'react';

export default function Bookings() {
    const { query } = useRouter()
    const { authUser } = useAuth()
    const [bookingParams, setBookingParams] = useState(null)

    useEffect(() => {
        if (query && query.type && authUser) {
            setBookingParams({
                type: query.type,
                isSystemAdmin: authUser.profileId === 1,
                userCustomerId: authUser.customerId
            })
        }
    }, [query, authUser])

    if (!bookingParams) return <p> loading... </p>

    return <BookingList {...bookingParams} />
}