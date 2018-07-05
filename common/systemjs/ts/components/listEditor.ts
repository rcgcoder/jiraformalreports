import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
@Component({
  selector: 'listEditor',
  templateUrl: System.composeUrl('systemjs/html/components/listEditor.html'),
})
export class listEditor {
    @Input() name: string = 'listEditor';
    @Input() typeDescriptor: string = 'elements';
    @Input() multiple: string = "false";
    @Input() columns: number = 1;
    @Input() columnDefinitions: string='[{"caption":"Name"}]'
    @Input() maxCharsInSelect: integer = 17;
    @Input() openDialogCaption: string = '...';
    @Output() onRetrieveData = new EventEmitter<{}>();
    elements: [] = [];
    getElements(){
        return this.elements;
    }
    setElements(arrNewElements){
        var self=this;
        this.elements=arrNewElements;
        self.refreshTable();
    }
    initialized: boolean = false;
    ngOnInit() {
        var self=this;
        System.addPostProcess(function(){
            log("PostProcessing:"+self.name);
            System.bindObj(self);
            self.columnDefinitions=JSON.parse(self.columnDefinitions);
            var headers=self.getTableHeader().find("tr");
            var itemAddBox=System.getAngularDomObject(self.name+"-itemAddBox");
            for (var i=0;i<self.columns;i++){
                var column=self.columnDefinitions[i];
                headers.append(`    <th>
                                        `+column.caption+`
                                    </th>
                                `);
                if (i>0){
                    var sPostIndex="_"+i;
                    if (isUndefined(column.type)||(column.type=="textarea")){
                        itemAddBox.append('<textarea name="'+self.name+"-text"+sPostIndex+'" id="'+self.name+"-text"+sPostIndex+'" rows=6 ></textarea>');
                    } else if (column.type=="toggle"){
                        itemAddBox.append(`<aui-toggle id="`+self.name+"-text"+sPostIndex+`" 
                                            label="`+column.caption+`Ensure Dependet Issues"
                                            ></aui-toggle>`+column.caption);
                    } else if (column.type=="date"){
                       itemAddBox.append(`<input class=flatpickr id="`+self.name+"-text"+sPostIndex+`" 
                                            type="text" placeholder="Select Date..">`);
                       flatpickr("#"+self.name+"-text"+sPostIndex, {
                            enableTime: true,
                            dateFormat: "d/m/Y H:i",
                        });

                    }
                }   
                var taAux=self.getTextArea(i);
                taAux.width((Math.round(100/self.columns)-10)+"%");

            }
        }); 
    }
    getTextArea(index){
        var self=this;
        var indexAux;
        if ((index==0)||(typeof index==="undefined")){
            indexAux="_0";
        } else {
            indexAux="_"+index;
        }
        var txtArea=System.getAngularDomObject(self.name+"-text"+indexAux);
        txtArea=$(txtArea);
        return txtArea;
    }
    getTextValue(indexColumn){
        var self=this;
        var auxTextArea=self.getTextArea(indexColumn);
        return auxTextArea.val();
    }
    getTextValues(){
        var self=this;
        var arrResult=[];
        for (var i=0;i<self.columns;i++){
            var auxTextArea=self.getTextArea(i);
            arrResult.push(auxTextArea.val());
        }
        return arrResult;
    }
    getTableHeader(){
        var self=this;
        var domObj=System.getAngularDomObject(self.name+"-tableHead");
        domObj=$(domObj);
        return domObj;
    }
    getTable(){
        var self=this;
        var domObj=System.getAngularDomObject(self.name+"-table");
        domObj=$(domObj);
        return domObj;
    }
    onDeleteElement(index){
        var self=this;
        self.elements.splice(index, 1);
        self.refreshTable();
    }
    refreshTable(){
        var self=this;
        log("Refreshing table");
        var tbl=self.getTable();
        tbl.find("tr").remove();
        var fncAddClickEvent=function(jqlElement){
            jqlElement.click(function(){
                var indAux=jqlElement.attr("list_index");
                self.onDeleteElement(indAux);
            });
        }
        for (var i=0;i<self.elements.length;i++){
            var item=self.elements[i];
            var sBtnName=self.name+"_btnDel_"+i;
            var sHtml='<button id="'+sBtnName+'" list_index="'+ i +'" class="aui-button">-</button>';
            for (var j=0;j<self.columns;j++){
               var itemCol=(self.columns==1)?item:item[j];
               if (j==0){
                   sHtml="<td>"+sHtml+itemCol+"</td>";
               } else {
                   sHtml+="<td>"+itemCol+"</td>";
               }
            }
                  
            tbl.append("<tr>"+sHtml+"</tr>");
            var jqElem=$("#"+sBtnName);
            fncAddClickEvent(jqElem);
        }
    }
    onTableToTextArea(){
       var self=this;
       var sTxt;
       var sTexts=[];
       while(sTexts.length<self.columns){
           sTexts.push("");
       }
       var elem;
       for (var i=0;i<self.elements.length;i++){
           elem=self.elements[i];
           for (var j=0;j<self.columns;j++){
               sTxt=sTexts[j];
               if (i>0){
                  sTxt+="\n";
               }
               if (self.columns==1){
                  sTxt+=elem;
               } else {
                  sTxt+=elem[j];
               }
               sTexts[j]=sTxt;
           }
       }
       for (var j=0;j<self.columns;j++){
           var tArea=self.getTextArea(j);
           tArea.val(sTexts[j]);
       }
    }
    onReplaceTableFromTextArea(){
        var self=this;
        this.elements=[];
        var tbl=self.getTable();
        tbl.find("tr").remove();
        self.onTextAreaToTable();
    }
    onTextAreaToTable(){
        var self=this;
        var auxElements=[];
        var elem;
        var colVal;
        
        for (var j=0;j<self.columns;j++){
            var txtInput=self.getTextValue(j);
            var arrInput=txtInput.split("\n");
            while(auxElements.length<arrInput.length){
               auxElements.push([]);
            }
            for (var i=0;i<arrInput.length;i++){
                elem=auxElements[i];
                while(elem.length<self.columns){
                   elem.push("");
                }
                colVal=arrInput[i];
                elem[j]=colVal;
            }
        }
        var bInsertFirst=false;
        if (self.elements.length>0){
           bInsertFirst=true;
        }
       
        for (var i=0;i<auxElements.length;i++){
            var firstCol=auxElements[i][0];
            var elemToAdd;
            if (self.columns==1){
                elemToAdd=firstCol;
            } else {
                elemToAdd=auxElements[i];
             }
        
            if ((self.multiple.trim().toLowerCase()=="true")||((!isInArray(self.elements,firstCol,(self.columns==1?undefined:0)))&&(firstCol!=""))){
                if (bInsertFirst) {
                    self.elements.unshift(elemToAdd);
                } else {
                    self.elements.push(elemToAdd);
                }
  //          }
        }
        self.refreshTable();
    }   
}