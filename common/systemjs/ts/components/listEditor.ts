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
}