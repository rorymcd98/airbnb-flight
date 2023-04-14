import * as zod from 'zod'

export const AirportCodeSchema = zod.string().regex(/^[A-Z]{3}$/)
export type AirportCode = zod.infer<typeof AirportCodeSchema>
