import { Entity } from './schedule.model';

export type Event = {
  id: string;
  type?: 'LUNCH';
  course?: {
    displayName: string;
  };
  teachers: [
    {
      to: Entity;
    }
  ];
  groups: [
    {
      to: Entity;
    }
  ];
  inLocations: [Entity];
  start: string;
  end: string;
  color: string;
};

export type CalendarEvent = {
  title: string;
  start: string;
  end: string;
  color?: string;
};
