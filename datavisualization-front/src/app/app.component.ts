import { Component, ViewEncapsulation } from '@angular/core';
import { LanguagesService } from './languages.service';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDatepicker } from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import * as _moment from 'moment';
import { Moment} from 'moment';
import { WorldEvent } from './models/WorldEvent';

const moment = _moment;

export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})

export class AppComponent {

  // code variables
  colors = ['#ff5722', '#ff9800', '#9c27b0', '#3f51b5', '#03a9f4', '#009688', '#8bc34a', '#ffeb3b', '#673ab7', '#f44336'];
  months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  labels = [];
  data = [];
  dates = [];
  events: WorldEvent[] = [];
  temp_date = new FormControl(moment(), Validators.required);

  // new event
  name = new FormControl('');
  date = new FormControl(moment());
  eventForm: FormGroup;
  eventTypes = [
    'Product',
    'Framework',
    'Technology'
  ];
  chosenType: string = this.eventTypes[0];

  // chart
  id = 'chart1';
  width = '100%';
  height = '700';
  dataFormat = 'json';
  // msspline zoomline msline
  type = 'msline';
  dataSource;

  // set graph min and max dates via binding
  minDate;
  maxDate;

  constructor(private languages: LanguagesService, private fb: FormBuilder, ) {
    this.dataSource = {
      chart: {
          xAxisName: 'Date',
          yAxisName: 'Popularity (%)',
          xAxisNameFontSize: '14',
          yAxisNameFontSize: '14',
          theme: 'fint'
      },
      dataset: []
    };
  }

  ngOnInit() {
    this.eventForm = this.fb.group({
      name: this.name,
      date: this.date
    });
    this.eventForm.reset();

    // getting events
    this.languages.getEvents().subscribe(
      events => {
        console.log('events: ', events);

        // getting language data
        this.languages.languagesData()
        .subscribe(res => {
          res[0].data.map(x => x.date).forEach((label) => {
            this.labels.push({
              label: label.substr(0, label.length - 3)
            });
          });

          const mindate = this.labels[0].label.split('-');
          const maxdate = this.labels[this.labels.length - 1].label.split('-');
          this.minDate = new Date(mindate[0], mindate[1], 1);
          this.maxDate = new Date(maxdate[0], maxdate[1] - 1, 1);

          this.labels.forEach(element => {
            element.label = this.getDate(element.label);
          });

          this.dates = this.labels.slice();
          res.forEach((language, l_index) => {
            const lang_data = [];
            res[l_index].data.map(x => x.popularity).forEach((popularity, p_index) => {
              lang_data.push({
                value: popularity,
                tooltext: 'Language ' + language.language +
                      '{br}Popularity: ' + popularity +
                      '{br}Date: ' + this.labels[p_index].label
              });
            });
            this.data.push({
              seriesname: language.language,
              data: lang_data,
              color: this.colors[l_index]
            });
          });

          // adding events to the chart
          events.forEach(event => {
            this.addLineChart(event.year, event.month, event.name, event.event_type);
          });

          this.updateChart();
        });
      },
      error => {
        console.log('error', error);
      });
    }

    addEvent() {
      this.addLineChart();
    }

    addLineChart(year: any = null, month: any = null, name: any = null, event_type: any = null) {
      let position = 0;
      if ( year != null && month != null && name != null) {
        for (let i = 0; i < this.labels.length; i++) {
          const date = this.labels[i].label.split(' ');
          if (year == date[0]) {
            if (month == this.getMonthPosition(date[1])) {
              position = i;
              break;
            } else if (month < this.getMonthPosition(date[1])) {
              position = i;
              break;
            }
          }
        }
      }

      let lbl_position;
      let color;
      if (event_type != null) {
        this.chosenType = event_type;
      }
      this.events.push(new WorldEvent(name, year, month, this.chosenType));

      if (this.chosenType == this.eventTypes[0]) {
        lbl_position = '0.965';
        color = '#DD2C00';
      } else if (this.chosenType == this.eventTypes[1]) {
        lbl_position = '1';
        color = '#1A237E';
      } else if (this.chosenType == this.eventTypes[2]) {
        lbl_position = '0';
        color = '#DD2C00';
      }

      this.labels.splice(position, 0, {
        vline: 'true',
        lineposition: '1',
        color: color,
        labelFont: 'Arial',
        thickness: '2',
        labelHAlign: 'center',
        labelPosition: lbl_position,
        label: name == null ? 'label' : name
      });
      this.updateChart();
    }

    updateChart() {
      this.dataSource = {
        chart: {
          caption: 'TIOBE Programming Community Index',
          xAxisName: 'Date',
          legendIconScale: '1.5',
          plotHighlightEffect: 'fadeout',
          legendPosition: 'right',
          yAxisName: 'Popularity (%)',
          theme: 'fint',
          showBorder: '0',
          showValues: '0',
          anchorRadius: '0',
          anchorBorderHoverThickness: '4',
          anchorHoverRadius: '5',
          labelDisplay: 'rotate',
          slantLabel: '1',
          labelStep: '12',
          baseFontSize: '14',
          legendItemFontSize: '14',
          baseFont: 'Arial',
          labelPadding: '23',

        },
        categories: [
          {
            category: this.labels
          }
        ],
        dataset: [ this.data ],
      };
    }

    clearLines() {
      this.labels = this.dates.slice();
      this.updateChart();
    }

    saveEvents() {
      this.languages.saveEvents(this.events).subscribe(
        result => {
          console.log('result: ', result);
        },
        error => {
          console.log('error: ', error);
        });
    }

    submitEvent() {
      this.addLineChart(this.eventForm.value.date.year(), this.eventForm.value.date.month(), this.eventForm.value.name);
      this.eventForm.reset();
    }

    getDate(label: string) {
      return label.split('-')[0] + ' ' + this.months[Number(label.split('-')[1]) - 1];
    }

    getMonthPosition(month: string): number {
      for (let index = 0; index < this.months.length; index++) {
        if (month == this.months[index]) {
          return index;
        }
      }
    }

    getMonth(month: string) {
      return this.months[Number(month) - 1];
    }

    chosenYearHandler(normalizedYear: Moment) {
      const ctrlValue = this.temp_date.value;
      ctrlValue.year(normalizedYear.year());
      this.date.setValue(ctrlValue);
    }

    chosenMonthHandler(normlizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
      const ctrlValue = this.temp_date.value;
      ctrlValue.month(normlizedMonth.month());
      this.date.setValue(ctrlValue);
      datepicker.close();
    }
  }
