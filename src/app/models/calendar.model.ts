import { z } from 'zod';
import { EntitySchema } from './schedule.model';

export const EventsResponseSchema = z.array(
  z.object({
    id: z.string(),
    type: z.string().optional(),
    course: z.object({ displayName: z.string() }).optional(),
    teachers: z.array(z.object({ to: EntitySchema })),
    groups: z.array(z.object({ to: EntitySchema })),
    inLocations: z.array(EntitySchema),
    start: z.string(),
    end: z.string(),
    color: z.string().optional()
  })
);

export type EventsResponse = z.infer<typeof EventsResponseSchema>;

export type Event = EventsResponse[number];

export type CalendarEvent = {
  title: string;
  start: string;
  end: string;
  color?: string;
};
