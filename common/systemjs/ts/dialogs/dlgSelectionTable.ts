import { Component, EventEmitter, Input, Output } from '@angular/core';
@Component({
  selector: 'dlgSelectionTable',
  templateUrl: System.composeUrl('systemjs/html/dialogs/dlgSelectionTable.html'),
})
export class dlgSelectionTable {
    constructor(){
        System.addPostProcess(function(){
             // Shows the dialog when the "Show dialog" button is clicked
/*             AJS.$("#dlgProjectSelector-show").click(function(e) {
                 e.preventDefault();
                 AJS.dialog2("#dlgProjectSelector").show();
             });
 */            // Hides the dialog
/*             AJS.$("#dlgProjectSelector-action").click(function (e) {
                 e.preventDefault();
                 AJS.dialog2("#dlgProjectSelector").hide();
             });
 */       });
    }
    @Output() onSelected = new EventEmitter<[]>();
    @Output() onRetrieveTableData = new EventEmitter<{}>();
    @Output() onRetrievePreviousSelectedKeys = new EventEmitter<{}>();
    getDialog(){
        return AJS.dialog2("#"+"dlg_"+this.name);
    }
    getTable(){
        return $("#"+"tbl_"+this.name);
    }

    populateTable(tableData){
        log("Populating table");
        var tbl=this.getTable();
        tbl.find("tr").remove();
        for (var i=0;i<tableData.length;i++){
            var item=tableData[i];
            tbl.append(
                `<tr>
                    <td>
                        <aui-toggle id="selected`+item.key+`" 
                        tooltip-on="Selected"
                        tooltip-off="Unselected"
                        ></aui-toggle>
                    </td>
                        <td>`+item.key+`</td>
                        <td>`+item.name+`</td></tr>`
                );
        }
    }
    selectItems(arrKeys){
        log("Selecting previous items");
    }
    doShowDialog(){
        var self=this;
        log("it´s clicked show button");
        var arrValues=[];
        self.onRetrieveTableData.emit(self);
        self.onRetrievePreviousSelectedKeys.emit(self);
        log("Showind the dialog");
        self.getDialog().show();
    }
    doAction(){
        log("It´s Clicked do action");
        this.getDialog().hide();
        this.onSelected.emit(["A","B","C"]);
        log("Emmited event");
    }
    doCancel(){
        log("It´s Clicked do cancel");
    }
    
    get selected():[]{return ["a","b","c"];
        
    }
    @Input() name: string = 'dlgSelectionTable';
    @Input() typeDescriptor: string = 'elements';
}