import { Component, effect, input, output, viewChild } from '@angular/core';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { CalendarService } from '../../services/calendar.service';
import { DateService } from '../../services/date.service';

export type CalendarEvent = {
  title: string;
  start: string;
  end: string;
  color?: string;
  id: string;
};

@Component({
  selector: 'app-calendar',
  imports: [FullCalendarModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent {
  // access the full calendar component
  private readonly _fullCalendar = viewChild(FullCalendarComponent);
  viewChange = output<'day' | 'week'>();
  isDragging = output<null | string>();
  eventDropped = output<{ eventId: string; x: number; y: number }>();

  // input parameters to be passed using the component's selector
  public readonly events = input.required<CalendarEvent[]>();

  // static calendar options
  protected readonly calendarOptions: CalendarOptions = {
    // the calendar view to be used
    plugins: [timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    initialDate: new Date(),

    // some customizations
    allDaySlot: false,
    slotLabelFormat: {
      hour: 'numeric',
      minute: '2-digit',
      hour12: false
    },
    eventTimeFormat: {
      hour: 'numeric',
      minute: '2-digit',
      hour12: false
    },

    navLinks: true,

    editable: true,
    eventStartEditable: true,
    eventDurationEditable: true,
    eventResizableFromStart: true,
    droppable: true,

    eventChange: (info) => {
      this.calendarService.handleEventChange(info);
    },

    eventDragStart: (info) => {
      this.isDragging.emit(info.event.id);
    },

    eventDragStop: (info) => {
      this.isDragging.emit(null);
      this.eventDropped.emit({
        eventId: info.event.id,
        x: info.jsEvent.clientX,
        y: info.jsEvent.clientY
      });
    },

    customButtons: {
      weekBtn: {
        text: 'Week',
        click: () => {
          this._fullCalendar()?.getApi().changeView('timeGridWeek');
          this.viewChange.emit('week');
          this.updateButtonClasses('timeGridWeek');
        }
      },
      dayBtn: {
        text: 'Day',
        click: () => {
          this._fullCalendar()?.getApi().changeView('timeGridDay');
          this.viewChange.emit('day');
          this.updateButtonClasses('timeGridDay');
        }
      },
      todayBtn: {
        text: 'Today',
        click: () => {
          this._fullCalendar()?.getApi().today();
          this.dateService.setDate(new Date().toLocaleDateString('en-CA'));
        }
      }
    },

    headerToolbar: {
      left: 'todayBtn',
      center: 'title',
      right: 'dayBtn,weekBtn'
    },

    slotLaneClassNames: 'slot-lane',
    dayHeaderClassNames: 'day-header',

    height: 'auto',

    slotMinTime: '07:00:00',
    slotMaxTime: '18:00:00',

    // monday is the first day of the week
    firstDay: 1,

    // hide saturday and sunday
    hiddenDays: [0, 6],

    // what timezone to display the calendar in, for example 'local' or 'UTC'
    timeZone: 'local',

    navLinkDayClick: (date) => {
      const formattedDate = date.toLocaleDateString('en-CA');
      this.dateService.setDate(formattedDate);
      this._fullCalendar()?.getApi().changeView('timeGridDay');
      this.viewChange.emit('day');
      this.updateButtonClasses('timeGridDay');
    },

    viewDidMount: (info) => {
      this.updateButtonClasses(info.view.type);
    }
  };

  constructor(
    private dateService: DateService,
    private calendarService: CalendarService
  ) {
    // Set initial date from stored date
    this.calendarOptions.initialDate = new Date(this.dateService.selectedDay());

    // Keep calendar in sync with date changes
    effect(() => {
      const currentDate = this.dateService.selectedDay();
      if (!currentDate) return;
      this._fullCalendar()?.getApi()?.gotoDate(currentDate);
    });
  }

  private updateButtonClasses(activeView: string) {
    const weekBtn = document.querySelector('.fc-weekBtn-button');
    const dayBtn = document.querySelector('.fc-dayBtn-button');

    if (weekBtn) {
      weekBtn.classList.toggle('fc-button-active', activeView === 'timeGridWeek');
    }
    if (dayBtn) {
      dayBtn.classList.toggle('fc-button-active', activeView === 'timeGridDay');
    }
  }

  removeEvent(eventId: string) {
    const event = this._fullCalendar()?.getApi().getEventById(eventId);
    event?.remove();
  }
}
