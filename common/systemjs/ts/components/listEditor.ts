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

    
    textAreaChanged(event){
        var self=this;
        var txtInput=self.getTextValue();
        var arrInput=txtInput.split("\n");
        
        var self=this;
        log("Populating table");
        var tbl=self.getTable();
//        tbl.find("tr:gt(0)").remove();
        for (var i=0;i<arrInput.length;i++){
            var item=arrInput[i];
            tbl.append(
                `<tr>
                    <td><button>-</button></td>
                    <td>`+item+`</td>
                  </tr>`
                );
        }
    }
}