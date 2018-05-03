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
    @Input() columnDefinitions: string={caption:"name"}
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
            var headers=self.getTableHeader().find("tr");
            for (var i=0;i<self.columns;i++){
                var column=self.columnDefinitions[i];
                headers.append(`    <th>
                                        `+column.caption+`
                                    </th>
                                `);
            }
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
            tbl.append(
                `<tr>
                    <td><button id="`+sBtnName+`" list_index="`+ i +`" class="aui-button">-</button>
                    `+item+`</td>
                  </tr>`
                );
            var jqElem=$("#"+sBtnName);
            fncAddClickEvent(jqElem);
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
       var tArea=self.getTextArea();
       tArea.val(sTxt);
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
        var txtInput=self.getTextValue();
        var arrInput=txtInput.split("\n");
        
        var self=this;
        for (var i=0;i<arrInput.length;i++){
            var item=arrInput[i];
            if ((!isInArray(self.elements,item))&&(item!="")){
                self.elements.push(item);
            }
        }
        self.refreshTable();
    }   
}