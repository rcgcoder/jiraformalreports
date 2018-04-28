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
            log("PostProcessing:"+self.name);
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
                        change="function(tgl){alert('togled');}"
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
    doShowDialog(){
        var self=this;
        log("it´s clicked show button");
        self.setWaiting(true);
        self.onRetrieveTableData.emit(self);
        log("Showind the dialog");
        this.getDialog().show();
    }
    endPopulating(){
        var self=this;
        self.setWaiting(false);
    }
    doAction(){
        var self=this;
        log("It´s Clicked do action");
        var arrSelected=this.getDialog().$el.find("aui-toggle");
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