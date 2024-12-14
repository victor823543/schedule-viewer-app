import { z } from 'zod';

export const EntitySchema = z.object({
  id: z.string(),
  displayName: z.string()
});

export type Entity = z.infer<typeof EntitySchema>;

export type Teacher = Entity;
export type Group = Entity;
export type Location = Entity;

export const ScheduleResponseSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  start: z.string(),
  end: z.string(),
  teachers: z.array(EntitySchema),
  groups: z.array(EntitySchema),
  locations: z.array(EntitySchema)
});

export type ScheduleResponse = z.infer<typeof ScheduleResponseSchema>;

export const SchedulesResponseSchema = z.array(EntitySchema);

export type SchedulesResponse = z.infer<typeof SchedulesResponseSchema>;

export enum FilterOption {
  TEACHER = 'teacher',
  GROUP = 'group',
  LOCATION = 'location'
}
