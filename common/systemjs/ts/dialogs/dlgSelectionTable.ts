import { Component, EventEmitter, Input, Output } from '@angular/core';
@Component({
  selector: 'dlgSelectionTable',
  templateUrl: System.composeUrl('systemjs/html/dialogs/dlgSelectionTable.html'),
})
export class dlgSelectionTable {
    @Input() name: string = 'dlgSelectionTable';
    @Input() typeDescriptor: string = 'elements';
    @Input() openDialogCaption: string = '...';
    @Input() multiple: string = 'false';
    @Output() onSelected = new EventEmitter<[]>();
    @Output() onRetrieveTableData = new EventEmitter<{}>();
    @Output() onRetrievePreviousSelectedKeys = new EventEmitter<{}>();
    waitForLoadTable=false;
    setWaiting(bWaiting){
        this.waitForLoadTable=bWaiting;
        if (!this.waitForLoadTable){
            this.getTable().show();
            this.getWaiter().hide();
        } else {
            this.getTable().hide();
            this.getWaiter().show();
        }
    }
    hideButton(){
        var btn=$('#show_'+this.name);
        btn.hide();
    }
    getDialog(){
        var dlgObj=AJS.dialog2('#dlg_'+this.name);
        return dlgObj;
    }
    getTable(){
        return $("#tbl_"+this.name);
    }
    getWaiter(){
        return $("#wait_"+this.name);
    }
    ngOnInit() {
        var self=this;
        if (self.multiple.toUpperCase()!="TRUE"){
            self.hideButton();
        }
        System.addPostProcess(function(){
            System.bindObj(self);
        });
    }

    populateTable(tableData){
        log("Populating table");
        var tbl=this.getTable();
        tbl.find("tr:gt(0)").remove();
        for (var i=0;i<tableData.length;i++){
            var item=tableData[i];
            tbl.append(
                `<tr>
                    <td>
                        <aui-toggle id="toggle_`+item.key+`" 
                        itemKey="`+item.key+`"
                        tooltip-on="Selected"
                        tooltip-off="Unselected"
                        label="Select `+item.key+`"
                        `+ (item.selected?"checked":"")+`
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
        self.setWaiting(false);
        var arrValues=[];
        self.onRetrieveTableData.emit(self);
        self.onRetrievePreviousSelectedKeys.emit(self);
        log("Showind the dialog");
        this.getDialog().show();
    }
    doAction(){
        log("It´s Clicked do action");
        var arrSelected=AJS.$("aui-toggle");
        var arrResult=[];
        for (var i=0;i<arrSelected.length;i++){
            var tglAux=arrSelected[i];
            var isChecked=tglAux.checked;
            if (isChecked){
                var jqTgl=$(tglAux);
                var auxKey=jqTgl.attr("itemKey");
                arrResult.push(auxKey);
            }
        }
        this.getDialog().hide();
        this.onSelected.emit(arrResult);
        log("Emmited event");
    }
    doCancel(){
        log("It´s Clicked do cancel");
    }
    doSelectAll(){
        var self=this;
        var tblAux=self.getTable();
        $(tblAux).find("aui-toggle").each(function(){
            this.checked=true;
        });
    }
    doUnselectAll(){
        var self=this;
        var tblAux=self.getTable();
        $(tblAux).find("aui-toggle").each(function(){
            this.checked=false;
        });
    }
}