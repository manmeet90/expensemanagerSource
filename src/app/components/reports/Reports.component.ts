import { Component } from '@angular/core';
import { ExpenseService } from '../../services/expense.service';
import { orderBy, sortBy, uniq, groupBy } from 'lodash';
import { Router, ActivatedRoute } from '@angular/router';
declare let Chart: any;
declare var $: any;
declare var M: any;
import {SortOrder, utils} from '../../utils/utils';
import { ExpenseType } from '../../components/expenses/expenseType';
enum ReportType {
  ByYearMonth = 1,
  ByExpenseType = 2,
  ByDuration = 3,
};

@Component({
  templateUrl: './Reports.html',
  styleUrls: ['./reports.css']
})
export class ReportsComponent {
  months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  startYear = 2018;
  yearsToGenerate = 20;
  
  years = ['2018', '2019', '2020', '2021', '2022'];
  durations = [2,3,5];
  currentSelectedPeriod = 5;
  reportData = {
    expensesByType: [],
    expensesByMonth: [],
    totalIncome: 0,
    totalExpenditure: 0
  };
  lineChartData = [];
  chart = null;
  year = null;
  month = null;

  earn_year = null;
  earn_month = null;
  earning = null;
  sub: any = null;
  queryParams = null;

  expenseTypes: any[] = [];
  public currentExpenseTypeForReport: string = '';
  public currentDurationForReport: string = `${new Date().getFullYear()}-${new Date().getFullYear()}`;
  validDurationRegex = /^\d{4}-\d{4}$/;

  public reportType: ReportType = ReportType.ByYearMonth;

  public currentAmountSortBy: SortOrder = SortOrder.ASC;

  constructor(private expenseService: ExpenseService,
    private router: Router,
    private route: ActivatedRoute,
    private expenseType: ExpenseType) {
      let year = this.startYear;
      this.years = [];
      while(year <= this.startYear+this.yearsToGenerate) {
        this.years.push(year.toString());
        year++;
      }
  }

  ngOnInit() {
    setTimeout(() => {
      // $('select').formSelect();
    }, 1000);
    this.getExpenseTypes();
    this.sub = this.route
      .queryParams
      .subscribe(params => {
        // Defaults to 0 if no query param provided.
        this.queryParams = params;

        if(this.queryParams && this.queryParams.year) {
            setTimeout(() => {
              $('#year').val(this.queryParams.year);
              this.year = this.queryParams.year;
              if (this.queryParams.month) {
                $('#month').val(this.queryParams.month);
                this.month = this.queryParams.month;
              }
              this.generateReportBtnClicked();
          }, 100);
        }
      });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  getExpenseTypes(){
    return this.expenseType.getExpenseTypes()
    .then((res: any) => {
      if(res.data.items){
        this.expenseTypes =  res.data.items;
        }else if(res.errors){
          M.toast({html: res.errors[0].message})
        }
      });
  }

  generateReportBtnClicked() {
    if (this.chart) {
      this.chart.destroy();
    }

    this.lineChartData = null;
    let filter: any = {
      year: this.year,
      month: this.month
    };
    if(this.reportType === ReportType.ByExpenseType) {
      filter = {
        year: this.currentDurationForReport,
        expenseType: this.currentExpenseTypeForReport
      };
    } else if(this.reportType === ReportType.ByDuration) {
      filter = {
        duration: this.currentSelectedPeriod
      }
    }
    this.expenseService.getExpenseReport(filter)
      .then(res => {
        if (res.errors) {
          console.log(res.errors);
        } else {
          if(this.reportType === ReportType.ByYearMonth) {
            this.reportData = res.data;
            this.reportData.expensesByType = orderBy(this.reportData.expensesByType, (d) => d.total, ['asc']);
            if (!this.month && this.reportData.expensesByMonth) {
              this.prepareLineChartData();
            }
            this.generateReport();
          }else if(this.reportType === ReportType.ByDuration) {
            this.reportData = res.data;
            this.reportData.expensesByType = orderBy(this.reportData.expensesByType, (d) => d.total, ['asc']);
            if (this.reportData.expensesByMonth) {
              this.prepareLineChartData();
            }
            this.generateReport();
          } else {
            this.reportData.expensesByType = res.data.items || [];
            this.reportData.expensesByType.forEach(d => {
              d.monthNumber = utils.getMonthFromMonthName(d.month);
            });
            const years = uniq(this.reportData.expensesByType.map(d => d.year));
            years.forEach(year => {
              const yearData = this.reportData.expensesByType.filter(d => d.year === year);
              const monthsDataPresent = yearData.map(d => d.month);
              this.months.forEach(month => {
                if(monthsDataPresent.indexOf(month.toUpperCase()) === -1) {
                  this.reportData.expensesByType.push({
                    year: yearData[0].year,
                    month: month.toUpperCase(),
                    amount: 0,
                    expenseType: yearData[0].expenseType,
                    monthNumber: utils.getMonthFromMonthName(month)
                  });
                }
              });
            });
            this.reportData.expensesByType = orderBy(this.reportData.expensesByType, (d => `${d.year}${d.monthNumber}`), ['asc']);
            this.prepareLineChartData();
            this.generateReport();
          }
        }
      });
  }

  generateReport() {
    this.generateChart();
  }

  prepareLineChartData() {
    this.lineChartData = [];
    if(this.reportType === ReportType.ByYearMonth) {
      this.reportData.expensesByMonth.forEach(item => {
        this.lineChartData.push({ month: item.month, earning: item.income, expenses: item.expenditure, savings: item.saving });
      });
    } else if(this.reportType === ReportType.ByExpenseType) {
      const dataGroupedByYear = groupBy(this.reportData.expensesByType, 'year');
      for(let year in dataGroupedByYear) {
        const yearData = dataGroupedByYear[year];
        this.lineChartData.push({ year: year, data: yearData.map(d => d.total || 0) });
      }
    } else if(this.reportType === ReportType.ByDuration) {
      const dataGroupedByYear = groupBy(this.reportData.expensesByMonth, 'year');
      for(let year in dataGroupedByYear) {
        const yearData = dataGroupedByYear[year];
        yearData.forEach(monthData => {
          this.lineChartData.push({ year: monthData.year, month: monthData.month, earning: monthData.income, expenses: monthData.expenditure, savings: monthData.saving });
        });
      }
    }
  }

  generateChart() {
    let ctx = document.getElementById('myChart')['getContext']('2d');
    let labels = [], data = [], expensedata = [], savingsdata = [], earningdata = [];
    Chart.defaults.global.elements.line.fill = false;
    var self = this;
    if (this.lineChartData) {
      if(this.reportType === ReportType.ByYearMonth || this.reportType === ReportType.ByDuration) {
        //sort by month
        this.lineChartData = sortBy(this.lineChartData, [function (data) {
          return self.MonthToNumber(data.month);
        }]);
        for (let idx in this.lineChartData) {
          if(this.reportType === ReportType.ByDuration) {
            labels.push(`${this.lineChartData[idx].month} ${this.lineChartData[idx].year}`);
          }else {
            labels.push(this.lineChartData[idx].month);
          }
          expensedata.push(this.lineChartData[idx].expenses);
          savingsdata.push(this.lineChartData[idx].savings);
          earningdata.push(this.lineChartData[idx].earning);
        }

        this.chart = new Chart(ctx, {
          // The type of chart we want to create
          type: 'line',

          // The data for our dataset
          data: {
            labels: labels,
            datasets: [
              {
                data: expensedata,
                label: "Expense",
                borderColor: "#ca1717",
              },
              {
                data: earningdata,
                label: "Earnings",
                borderColor: "#00acc1",
              },
              {
                data: savingsdata,
                label: "Savings",
                borderColor: "#3cba9f",
              }
            ],
          },

          // Configuration options go here
          options: {
          }
        });
      } else if(this.reportType === ReportType.ByExpenseType) {
        const backgroundColors = ['#d81b60', '#8e24aa', '#e53935', '#5e35b1', '#3949ab', '#1e88e5', '#039be5',
        '#00acc1', '#00897b',
        '#ffc107', '#7cb342', '#ff9800'];
        const datasets=[];
        this.lineChartData.forEach((data, idx) => {
          datasets.push({
            data: data.data,
            label: data.year,
            borderColor: backgroundColors[idx]
          });
        });
        this.chart = new Chart(ctx, {
          // The type of chart we want to create
          type: 'line',

          // The data for our dataset
          data: {
            labels: this.months,
            datasets: datasets,
          },

          // Configuration options go here
          options: {
            plugins: {
              title: {
                  display: true,
                  text: `Expense Distribution for ${this.currentExpenseTypeForReport}`
              }
            }
          }
        });
      }
      return;
    }

    labels = this.reportData.expensesByType.map(_d => _d.expenseType);
    let _data = this.reportData.expensesByType.map(_d => _d.total);
    let _total = this.reportData.totalExpenditure;
    data = _data.map(_d => _d / _total * 100);

    this.chart = new Chart(ctx, {
      // The type of chart we want to create
      type: 'doughnut',

      // The data for our dataset
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: ['#d81b60', '#8e24aa', '#e53935', '#5e35b1', '#3949ab', '#1e88e5', '#039be5',
            '#00acc1', '#00897b',
            '#ffc107', '#7cb342', '#ff9800']
        }],
      },

      // Configuration options go here
      options: {
      }
    });
  }

  isFormValid() {
    return this.reportType === ReportType.ByYearMonth ? (this.year || this.month): this.reportType === ReportType.ByDuration ? this.currentSelectedPeriod : (this.currentDurationForReport && this.currentExpenseTypeForReport && this.validDurationRegex.test(this.currentDurationForReport));
  }

  onYearChange(e: any) {
    this.year = e.currentTarget.value;
  }

  onMonthChange(e: any) {
    this.month = e.currentTarget.value;
  }

  onEarnYearChange(e: any) {
    this.earn_year = e.currentTarget.value;
  }

  onEarnMonthChange(e: any) {
    this.earn_month = e.currentTarget.value;
  }

  onEarningChange(e: any) {
    this.earning = e.currentTarget.value;
  }

  isEarningFormValid() {
    return (this.earn_year && this.earn_month && this.earning);
  }

  onExpenseCategoryRowClicked(e, expenseType) {
    e.preventDefault();
    if(this.reportType !== ReportType.ByDuration){
      this.router.navigate(['expenses'], { queryParams: { year: this.year, month: this.month, expenseType: expenseType } });
    }
  }

  onSaveEarningBtnClicked() {
    console.log(this.earn_month, this.earn_year, this.earning);
    this.expenseService.setEarning(this.earn_year, this.earn_month, this.earning)
      .then((res) => {
        if (res.errors) {
          console.log(res.errors);
        } else {
          M.toast({ html: 'Earnings updated successfuly' });
        }
      })
  }

  toLocale(data) {
    return parseInt(data).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
  }

  MonthToNumber(month) {
    let ret = 0;
    switch (month.toLowerCase()) {
      case 'jan': {
        ret = 1;
        break;
      }
      case 'feb': {
        ret = 2;
        break;
      }
      case 'mar': {
        ret = 3;
        break;
      }
      case 'apr': {
        ret = 4;
        break;
      }
      case 'may': {
        ret = 5;
        break;
      }
      case 'jun': {
        ret = 6;
        break;
      }
      case 'jul': {
        ret = 7;
        break;
      }
      case 'aug': {
        ret = 8;
        break;
      }
      case 'sep': {
        ret = 9;
        break;
      }
      case 'oct': {
        ret = 10;
        break;
      }
      case 'nov': {
        ret = 11;
        break;
      }
      case 'dec': {
        ret = 12;
        break;
      }
    }

    return ret;
  }

  sortByAmountClicked() {
    if(this.reportData.expensesByType.length > 0 && this.currentAmountSortBy) {
      this.currentAmountSortBy =  this.currentAmountSortBy === SortOrder.ASC ? SortOrder.DSC : SortOrder.ASC;
      switch(this.currentAmountSortBy) {
          case SortOrder.DSC: {
              this.reportData.expensesByType = orderBy(this.reportData.expensesByType, (d) => d.total, ['desc']);
              break;
          }
          default : {
            this.reportData.expensesByType = orderBy(this.reportData.expensesByType, (d) => d.total, ['asc']);
          }
      }
    }
  }

  onReportCategoryChange(reportType: ReportType) {
    this.reportType = reportType;
  }

  onDurationSelected(duration: string) {
    this.currentSelectedPeriod = parseInt(duration, 10);
  }
}
