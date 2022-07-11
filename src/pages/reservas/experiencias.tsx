import { useRouter } from 'next/router';

import { useAuth } from 'contexts/AuthUserContext';
import BookingList from 'components/layout/BookingList';
import FormLoadingComponent from 'components/screen/FormLoading/FormLoading';
import { useEffect, useState } from 'react';

export default function ExperienceBookings() {
    const { query } = useRouter()
    const { authUser } = useAuth()
    const [bookingParams, setBookingParams] = useState(null)

    useEffect(() => {
        if (authUser) {
            setBookingParams({
                type: 'experiencias',
                isSystemAdmin: authUser.profileId === 1,
                userCustomerId: authUser.customerId
            })
        }
    }, [query, authUser])

    if (!bookingParams) return <FormLoadingComponent />

    return <BookingList {...bookingParams} />
}