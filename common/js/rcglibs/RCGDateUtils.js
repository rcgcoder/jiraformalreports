'use strict';
class RCGDateUtils {
	toDateNormalDDMMYYYYHHMMSS(sDate){ //dd/mm/yyyy hh:mm:ss
		var arrDate=sDate.split(" ");
		var arrDate=arrDate[0].split("/");
		
	    var curr_date= parseInt(arrDate[0]);
	    var curr_month = parseInt(arrDate[1])-1;
	    var curr_year = parseInt(arrDate[2]);
	    var curr_hr= 0;
	    var curr_min = 0;
	    var curr_sc= 0;
		if (sDate.length>12){
			curr_hr= parseInt(sDate.substring(11,13));
		}
		if (sDate.length>15){
			curr_min = parseInt(sDate.substring(14,16));
		}
		if (sDate.length>18){
			curr_sc= parseInt(sDate.substring(17,19));
		}
		
		var dResult= new Date();
		dResult.setFullYear(curr_year, curr_month, curr_date);
		dResult.setHours(curr_hr);
		dResult.setMinutes(curr_min);
		dResult.setSeconds(curr_sc);
		dResult.setMilliseconds(0);
		return dResult;
	}

	onlyDate(Date){
		var curr_year=Date.getFullYear();
		var curr_month=Date.getMonth();
		var curr_date=Date.getDate();
	    var curr_hr= 0;
	    var curr_min = 0;
	    var curr_sc= 0;
		
		var dResult= new Date();
		dResult.setFullYear(curr_year, curr_month, curr_date);
		dResult.setHours(curr_hr);
		dResult.setMinutes(curr_min);
		dResult.setSeconds(curr_sc);
		return dResult;
	}
	
	
	isSameDay(date1,date2){
		if (date1.getFullYear()!=date2.getFullYear()) return false;
		if (date1.getMonth()!=date2.getMonth()) return false;
		if (date1.getDate()!=date2.getDate()) return false;
		return true;
	}
	
	dateAdd(date, interval, units) {
	  var ret = new Date(date); //don't change original date
	  switch(interval.toLowerCase()) {
	    case 'year'   :  ret.setFullYear(ret.getFullYear() + units);  break;
	    case 'quarter':  ret.setMonth(ret.getMonth() + 3*units);  break;
	    case 'month'  :  ret.setMonth(ret.getMonth() + units);  break;
	    case 'week'   :  ret.setDate(ret.getDate() + 7*units);  break;
	    case 'day'    :  ret.setDate(ret.getDate() + units);  break;
	    case 'hour'   :  ret.setTime(ret.getTime() + units*3600000);  break;
	    case 'minute' :  ret.setTime(ret.getTime() + units*60000);  break;
	    case 'second' :  ret.setTime(ret.getTime() + units*1000);  break;
	    default       :  ret = undefined;  break;
	  }
	  return ret;
	}
	
	formatDate(dateObj,format) {
		if (typeof dateObj==="undefined") return "";
		if (dateObj==NaN) return "";
		if (isNaN(dateObj)) return "";
		if (dateObj=="") return "";
		if (typeof dateObj.getDate==="undefined") return "";
	    var monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
	    var curr_date = dateObj.getDate();
	    var curr_month = dateObj.getMonth();
	    curr_month = curr_month + 1;
	    var curr_year = dateObj.getFullYear();
	    var curr_min = dateObj.getMinutes();
	    var curr_hr= dateObj.getHours();
	    var curr_sc= dateObj.getSeconds();
	    if(curr_month.toString().length == 1)
	    curr_month = '0' + curr_month;      
	    if(curr_date.toString().length == 1)
	    curr_date = '0' + curr_date;
	    if(curr_hr.toString().length == 1)
	    curr_hr = '0' + curr_hr;
	    if(curr_min.toString().length == 1)
	    curr_min = '0' + curr_min;
	    if(curr_sc.toString().length == 1)
	    curr_sc = '0' + curr_sc;
	
	    if(format ==1)//dd-mm-yyyy
	    {
	        return curr_date + "-"+curr_month+ "-"+curr_year;       
	    }
	    else if(format ==2)//yyyy-mm-dd-hhmmss
	    {
	        return curr_year + "-"+curr_month+ "-"+curr_date+"-"+curr_hr+curr_min+curr_sc;       
	    }
	    else if(format ==3)//dd/mm/yyyy
	    {
	        return curr_date + "/"+curr_month+ "/"+curr_year;       
	    }
	    else if(format ==4)// dd/MM/yyyy HH:mm:ss
	    {
	        return curr_date +"/"+curr_month+"/"+curr_year+ " "+curr_hr+":"+curr_min+":"+curr_sc;       
	    }
	    else if(format ==5)// yyyyMMddHHmmss
	    {
	        return curr_year+""+curr_month+""+curr_date+""+curr_hr+""+curr_min+""+curr_sc;       
	    }
	    else if(format ==6)//yyyy-mm-dd
	    {
	        return curr_year + "-"+curr_month+ "-"+curr_date;
	    }
	}
	
	toDateNormalYYYYMMDD(sDate){ //YYYY-MM-DD
	    var curr_year = parseInt(sDate.substring(0,4));
	    var curr_month = parseInt(sDate.substring(5,7))-1;
	    var curr_date= parseInt(sDate.substring(8,10));
	    var curr_hr= 0;
	    var curr_min = 0;
	    var curr_sc= 0;
		
		var dResult= new Date();
		dResult.setFullYear(curr_year, curr_month, curr_date);
		dResult.setHours(curr_hr);
		dResult.setMinutes(curr_min);
		dResult.setSeconds(curr_sc);
		return dResult;
	}
}
registerClass(RCGDateUtils);
