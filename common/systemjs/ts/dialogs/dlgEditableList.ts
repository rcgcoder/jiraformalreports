import { Component, EventEmitter, Input, Output } from '@angular/core';
@Component({
  selector: 'dlgEditableList',
  templateUrl: System.composeUrl('systemjs/html/dialogs/dlgEditableList.html'),
})
export class dlgEditableList {
    @Input() name: string = 'dlgEditableList';
    @Input() columns: number = 1;
    @Input() columnDefinitions: string="[{caption:'key'}]";
    @Input() typeDescriptor: string = 'elements';
    @Input() openDialogCaption: string = '...';
    @Output() onApply = new EventEmitter<[]>();
    elements_backUp:[]=[];
    hideButton(){
        var btn=$('#show_'+this.name);
        btn.hide();
    }
    getDialog(){
        var dlgObj=AJS.dialog2('#dlg_'+this.name);
        return dlgObj;
    }
    getListEditor(){
        var self=this;
        var angObj=System.getAngularObject("lstEditor_"+self.name,true);
        return angObj;
    }
    getElements(){
        return this.getListEditor().getElements();
    }
    setElements(arrElements){
        this.getListEditor().setElements(arrElements);
    }
    ngOnInit() {
        var self=this;
        System.addPostProcess(function(){
            log("PostProcessing:"+self.name);
            System.bindObj(self);
        });
    }

    doShowDialog(){
        var self=this;
        log("it´s clicked show button");
        log("Showind the dialog");
        self.elements_backUp=self.getElements();
        this.getDialog().show();
    }
    doAction(){
        var self=this;
        log("It´s Clicked do action");
        this.getDialog().hide();
        this.onApply.emit(self.getElements());
        log("Emmited event");
    }
    doCancel(){
        var self=this;
        log("It´s Clicked do cancel");
        self.setElements(self.elements_backUp);
        this.getDialog().hide();
    }
}