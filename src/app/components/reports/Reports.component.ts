import { Component } from '@angular/core';
import { ExpenseService } from '../../services/expense.service';
import { groupBy, flatten, sortBy } from 'lodash';
import { Router, ActivatedRoute } from '@angular/router';
declare let Chart: any;
declare var $: any;
declare var M: any;

@Component({
  templateUrl: './Reports.html'
})
export class ReportsComponent {
  months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  years = ['2018', '2019', '2020', '2021', '2022'];
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

  constructor(private expenseService: ExpenseService, private router: Router, private route: ActivatedRoute) {

  }

  ngOnInit() {
    setTimeout(() => {
      // $('select').formSelect();
    }, 1000);
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

  generateReportBtnClicked() {
    if (this.chart) {
      this.chart.destroy();
    }

    this.lineChartData = null;
    this.expenseService.getExpenseReport(this.year, this.month)
      .then(res => {
        if (res.errors) {
          console.log(res.errors);
        } else {
          this.reportData = res.data;
          if (!this.month && this.reportData.expensesByMonth) {
            this.prepareLineChartData();
          }
          this.generateReport();
        }
      });
  }

  generateReport() {
    this.generateChart();
  }

  prepareLineChartData() {
    this.lineChartData = [];
    this.reportData.expensesByMonth.forEach(item => {
      this.lineChartData.push({ month: item.month, earning: item.income, expenses: item.expenditure, savings: item.saving });
    });
  }

  generateChart() {
    let ctx = document.getElementById('myChart')['getContext']('2d');
    let labels = [], data = [], expensedata = [], savingsdata = [], earningdata = [];
    Chart.defaults.global.elements.line.fill = false;
    var self = this;
    if (this.lineChartData) {
      //sprt by month
      this.lineChartData = sortBy(this.lineChartData, [function (data) {
        return self.MonthToNumber(data.month);
      }]);
      for (let idx in this.lineChartData) {
        labels.push(this.lineChartData[idx].month);
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
              borderColor: "#8e5ea2",
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
    return (this.year || this.month);
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

  onExepenseCategoryRowClicked(e, expenseType) {
    e.preventDefault();
    this.router.navigate(['expenses'], { queryParams: { year: this.year, month: this.month, expenseType: expenseType } });
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
}
