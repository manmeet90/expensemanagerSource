export let utils: any = {
  getMonthFromMonthName : (monthName) => {
    let result: string;
    switch(monthName) {
      case "Jan" : {
        result = "01";
        break;
      }
      case "Feb" : {
        result = "02";
        break;
      }
      case "Mar" : {
        result = "03";
        break;
      }
      case "Apr" : {
        result = "04";
        break;
      }
      case "May" : {
        result = "05";
        break;
      }
      case "Jun" : {
        result = "06";
        break;
      }
      case "Jul" : {
        result = "07";
        break;
      }
      case "Aug" : {
        result = "08";
        break;
      }
      case "Sep" : {
        result = "09";
        break;
      }
      case "Oct" : {
        result = "10";
        break;
      }
      case "Nov" : {
        result = "11";
        break;
      }
      case "Dec" : {
        result = "12";
        break;
      }
    }

    return result;
  }
};
