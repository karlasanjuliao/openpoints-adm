import { format as dateFnsFormat } from 'date-fns'

export const formatDate = (date: string | number, format: string) => {
    const dt = new Date(date)
    const dtDateOnly = new Date(dt.valueOf() + dt.getTimezoneOffset() * 60 * 1000)
    return dateFnsFormat(dtDateOnly, format)
}