import { z } from 'zod';

export const EntitySchema = z.object({
  id: z.string(),
  displayName: z.string()
});

export const CourseSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  subject: z.string()
});

export type Entity = z.infer<typeof EntitySchema>;

export type Course = z.infer<typeof CourseSchema>;

export type Teacher = Entity;
export type Group = Entity;
export type Location = Entity;

export const ScheduleResponseSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  teachers: z.array(EntitySchema),
  groups: z.array(EntitySchema),
  locations: z.array(EntitySchema),
  courses: z.array(CourseSchema)
});

export type ScheduleResponse = z.infer<typeof ScheduleResponseSchema>;

export const SchedulesResponseSchema = z.array(EntitySchema);

export type SchedulesResponse = z.infer<typeof SchedulesResponseSchema>;

export enum FilterOption {
  TEACHER = 'teacher',
  GROUP = 'group',
  LOCATION = 'location'
}

export type CreateEntityBody =
  | {
      category: 'teacher' | 'group' | 'location';
      displayName: string;
      schedule: string;
    }
  | {
      category: 'course';
      displayName: string;
      subject: string;
      schedule: string;
    };

export type DeleteEntitiesQuery = {
  ids: string;
  category: 'teacher' | 'group' | 'location';
  schedule: string;
};

export type DeleteCoursesQuery = {
  ids: string;
  schedule: string;
};
