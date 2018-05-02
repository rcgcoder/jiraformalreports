import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
@Component({
  selector: 'listEditor',
  templateUrl: System.composeUrl('systemjs/html/components/listEditor.html'),
})
export class listEditor {
    @Input() name: string = 'listEditor';
    @Input() typeDescriptor: string = 'elements';
    @Input() multiple: string = "false";
    @Input() maxCharsInSelect: integer = 17;
    @Input() openDialogCaption: string = '...';
    @Output() onRetrieveData = new EventEmitter<{}>();
    elements: [] = [];
    getElements(){
        return this.elements();
    }
    setElements(arrNewElements){
        this.elements=arrNewElements;
        self.refreshTable();
    }
    initialized: boolean = false;
    ngOnInit() {
        var self=this;
        System.addPostProcess(function(){
            log("PostProcessing:"+self.name);
            System.bindObj(self);
        });
    }
    getTextArea(){
        var self=this;
        var txtArea=System.getAngularDomObject(self.name+"-text");
        txtArea=$(txtArea);
        return txtArea;
    }
    getTextValue(){
        return this.getTextArea().val();
    }
    getTable(){
        var self=this;
        var domObj=System.getAngularDomObject(self.name+"-table");
        domObj=$(domObj);
        return domObj;
    }
    onDeleteElement(index){
        self.elements.splice(index, 1);
        self.refreshTable();
    }
    refreshTable(){
        log("Refreshing table");
        var tbl=self.getTable();
        tbl.find("tr:gt(0)").remove();
        for (var i=0;i<self.elements.length;i++){
            var item=self.elements[i];
            tbl.append(
                `<tr>
                    <td><button (click)="onDeleteElement(`+(self.elements.length-1)+`)">-</button></td>
                    <td>`+item+`</td>
                  </tr>`
                );
        }
    }
    onTableToTextArea(){
       var self=this;
       var sTxt="";
       for (var i=0;i<self.elements.length;i++){
           if (i>0){
              sTxt+="\n";
           }
           sTxt+=self.elements[i];
       }
       var tArea=getTextArea();
       tArea.val(sTxt);
    }
    onReplaceTableFromTextArea(){
        var self=this;
        this.elements=[];
        var tbl=self.getTable();
        tbl.find("tr:gt(0)").remove();
        self.onTableToTextArea();
    }
    onTableToTextArea(){
        var self=this;
        var txtInput=self.getTextValue();
        var arrInput=txtInput.split("\n");
        
        var self=this;
        for (var i=0;i<arrInput.length;i++){
            var item=arrInput[i];
            if (!isInArray(self.elements,item)){
                self.elements.push(item);
            }
        }
        self.refreshTable();
    }   
}