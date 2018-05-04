import { Component, EventEmitter, Input, Output } from '@angular/core';
@Component({
  selector: 'dlgEditableList',
  templateUrl: System.composeUrl('systemjs/html/dialogs/dlgEditableList.html'),
})
export class dlgEditableList {
    @Input() name: string = 'dlgEditableList';
    @Input() columns: number = 1;
    @Input() columnDefinitions: string='[{"caption":"Name"}]';
    @Input() typeDescriptor: string = 'elements';
    @Input() openDialogCaption: string = '...';
    @Output() onFullFillRequest = new EventEmitter<[]>();
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
    isSomeOneObservingFullFillRequest(){
        var self=this;
        log("Observers retrieve:"+self.onFullFillRequest.observers.length);
        return (self.onFullFillRequest.observers.length>0);
    }
    
    getFullFillButton(){
        var self=this;
        return System.getAngularDomObject("dlg_"+self.name+"_fullfillButton");
    }

    ngOnInit() {
        var self=this;
        System.addPostProcess(function(){
            log("PostProcessing:"+self.name);
            System.bindObj(self);
            if(self.isSomeOneObservingFullFillRequest()){
                var actionBar=System.getAngularObject("dlg_"+self.name+"_actionBar",true);
                actionBar.prepend("<button>test</button>");
            }
        });
    }

    doShowDialog(){
        var self=this;
        log("it´s clicked show button");
        log("Showind the dialog");
        self.elements_backUp=self.getElements();
        var fillBtn=self.getFullFillButton();
        if (self.isSomeOneObservingFullFillRequest()){
            fillBtn.show();
        } else {
            fillBtn.hide();
        }
        self.getDialog().show();
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
    doRetrieveFullFill(){
        log("Retrieving fullfill...");
    }
}