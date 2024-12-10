export type Entity = {
  id: string;
  displayName: string;
};

export type Teacher = Entity;
export type Group = Entity;
export type Location = Entity;

export type ScheduleResponse = {
  id: string;
  displayName: string;
  start: string;
  end: string;
  teachers: Entity[];
  groups: Entity[];
  locations: Entity[];
};

export type SchedulesResponse = Entity[];
