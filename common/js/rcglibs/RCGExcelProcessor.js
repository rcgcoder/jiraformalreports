var RCGExcelProcessor=class RCGExcelProcessor{ //this kind of definition allows to hot-reload
	constructor(chararrayExcelContent){
		var self=this;
		self.workbook=XLSX.read(content);
		self.sheets=newHashMap();
	    self.workbook.sheetNames.forEach(function(sheetName) {
	        // Here is your object
    		workbook.Sheets[sheetName].getCell=self.internal_getCell;
	        self.sheets.add(sheetName,workbook.Sheets[sheetName]);
	    });
	}
	excelColRowToA1(c,r){
		var sCell="";
		var iMultiChar=0;
		while (c>26){
		  iMultiChar++;
		  c=c-26;
		}
		if (iMultiChar>0){
		  iMultiChar--;
		  var res = String.fromCharCode("A".charCodeAt(0)+iMultiChar);
		  sCell+=res;
		}
		var res = String.fromCharCode("A".charCodeAt(0)+c);
		sCell+=res;
		sCell+=(""+(r+1));
		return sCell;
	}
	internal_getCell(row,col){
		var sCelda=excelColRowToA1(col,row);
		var desired_cell = this[sCelda];
		if (desired_cell){
			return desired_cell.v;
		}
		return "";
	}

}