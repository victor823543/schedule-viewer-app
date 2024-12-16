import { z } from 'zod';
import { Entity, EntitySchema } from './schedule.model';

export const EventsResponseSchema = z.array(
  z.object({
    id: z.string(),
    type: z.string().optional(),
    course: z.object({ displayName: z.string(), subject: z.string(), id: z.string() }).optional(),
    teachers: z.array(EntitySchema),
    groups: z.array(EntitySchema),
    inLocations: z.array(EntitySchema),
    belongsTo: EntitySchema,
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
  id: string;
};

export type CreateEventBody = {
  start: string;
  end: string;
  duration: number;
  type?: 'LUNCH';
  course?: string;
  locations: string[];
  teachers: string[];
  groups: string[];
  color: string;
};

export type CreateEventResponse = {
  week: string;
  teacher: Entity;
  group: Entity;
  location: Entity;
};
