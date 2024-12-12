import { Component, effect, input, output, viewChild } from '@angular/core';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import { DateService } from '../../services/date.service';

export type CalendarEvent = {
  title: string;
  start: string;
  end: string;
  color?: string;
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

  // input parameters to be passed using the component's selector
  public readonly events = input.required<CalendarEvent[]>();

  // static calendar options
  protected readonly calendarOptions: CalendarOptions = {
    // the calendar view to be used
    plugins: [timeGridPlugin],
    initialView: 'timeGridWeek',

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
      }
    },

    headerToolbar: {
      // left: 'prev,next',
      left: 'today',
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
      const formattedDate = date.toISOString().split('T')[0];
      this.dateService.setDate(formattedDate);
    },

    viewDidMount: (info) => {
      this.updateButtonClasses(info.view.type);
    }
  };

  constructor(private dateService: DateService) {
    // update the calendar's chosen week
    effect(() => {
      const initialDate = this.dateService.selectedDay();
      if (!initialDate) return;
      this._fullCalendar()?.getApi().gotoDate(initialDate);
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
}
