var RCGExcelProcessor=class RCGExcelProcessor{ //this kind of definition allows to hot-reload
	constructor(chararrayExcelContent){
		var self=this;
		self.charA="A".charCodeAt(0);
		self.workbook=XLSX.read(chararrayExcelContent);
		self.sheets=newHashMap();
	    self.workbook.SheetNames.forEach(function(sheetName) {
	        // Here is your object
	    	self.workbook.Sheets[sheetName].charA=self.charA;
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

		var auxChar=sCellRef[sCellRef.length-1];
		sCellRef= sCellRef.slice(0, -1);
		var iChar=parseInt(auxChar);
		var jAcum="";
		while ((iChar>=0)&&(iChar<10)){
			jAcum=iChar+jAcum;
			auxChar=sCellRef[sCellRef.length-1];
			sCellRef= sCellRef.slice(0, -1);
			iChar=parseInt(auxChar);
		}
		objResult.iCol=(parseInt(jAcum)-1);
		var iAcum="";
		sCellRef=sCellRef+auxChar;
		while (sCellRef.length>0){
			iAcum=iAcum*26;
			auxChar=sCellRef[0];
			sCellRef= sCellRef.slice(1,sCellRef.length);
			iChar=auxChar.charCodeAt(0)-self.charA;
			iAcum=iChar+iAcum;
		}
		objResult.iRow=iAcum;
		return objResult;
	}

}