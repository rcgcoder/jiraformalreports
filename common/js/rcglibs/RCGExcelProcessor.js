var RCGExcelProcessor=class RCGExcelProcessor{ //this kind of definition allows to hot-reload
	constructor(chararrayExcelContent){
		var self=this;
		self.charA="A".charCodeAt(0);
		self.workbook=XLSX.read(chararrayExcelContent);
		self.sheets=newHashMap();
	    self.workbook.SheetNames.forEach(function(sheetName) {
	        // Here is your object
	    	self.workbook.Sheets[sheetName].excelA1ToColRow=self.internal_excelA1ToColRow;
	    	self.workbook.Sheets[sheetName].excelColRowToA1=self.internal_excelColRowToA1;
	    	self.workbook.Sheets[sheetName].getCell=self.internal_getCell;
	        self.sheets.add(sheetName,self.workbook.Sheets[sheetName]);
	    });
	}
	internal_excelColRowToA1(c,r){
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
		var sCelda=this.excelColRowToA1(col,row);
		var desired_cell = this[sCelda];
		if (desired_cell){
			return desired_cell.v;
		}
		return "";
	}
	internal_excelA1ToColRow(cellRef){
		var self=this;
		var sCellRef=cellRef;
		var objResult={iRow:0,iCol:0};
		var auxChar=sCellRef.pop();
		var iChar=parseInt(auxChar);
		var jAcum=0;
		while ((iChar>=0)&&(iChar<10)){
			jAcum=jAcum*10+iChar;
			auxChar=sCellRef.pop();
			iChar=parseInt(auxChar);
		}
		objResult.iCol=(jAcum-1);
		var iAcum=0;
		while (sCellRef.length+1>0){
			iAcum=iAcum*26;
			iChar=auxChar.charCodeAt(0)-self.charA;
			iAcum+=iChar;
			if (sCellRef.length>0){
				auxChar=sCellRef.pop();
			}
		}
		objResult.iRow=iAcum;
		return objResult;
	}

}