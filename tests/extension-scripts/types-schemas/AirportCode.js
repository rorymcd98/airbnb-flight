import * as zod from 'zod';
export const AirportCodeSchema = zod.string().regex(/^[A-Z]{3}$/);
