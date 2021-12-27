export let utils: any = {
  getMonthFromMonthName : (monthName) => {
    let result: string;
    switch(monthName.toLowerCase()) {
      case "jan" : {
        result = "01";
        break;
      }
      case "feb" : {
        result = "02";
        break;
      }
      case "mar" : {
        result = "03";
        break;
      }
      case "apr" : {
        result = "04";
        break;
      }
      case "may" : {
        result = "05";
        break;
      }
      case "jun" : {
        result = "06";
        break;
      }
      case "jul" : {
        result = "07";
        break;
      }
      case "aug" : {
        result = "08";
        break;
      }
      case "sep" : {
        result = "09";
        break;
      }
      case "oct" : {
        result = "10";
        break;
      }
      case "nov" : {
        result = "11";
        break;
      }
      case "dec" : {
        result = "12";
        break;
      }
    }

    return result;
  }
};

export enum SortOrder {
  ASC = 1 , DSC = 2
};
