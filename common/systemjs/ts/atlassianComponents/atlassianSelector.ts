import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
@Component({
  selector: 'atlassianSelector',
  templateUrl: System.composeUrl('systemjs/html/atlassianComponents/atlassianSelector.html'),
})
export class atlassianSelector {
    @Input() atlassianObjectProperty: string = undefined;
    @Input() atlassianObjectFunction: string = undefined;
    @Input() atlassianAplication: string = undefined;
    @Input() name: string = 'atlassSelection';
    @Input() typeDescriptor: string = 'elements';
    @Input() multiple: string = "false";
    @Input() maxCharsInSelect: integer = 17;
    @Input() openDialogCaption: string = '...';
    ngOnInit() {
        var self=this;
        System.addPostProcess(function(){
            log("PostProcessing:"+self.name);
            System.bindObj(self);
        });
    }
    getAllElements(){
        var self=this;
        var objSel=System.getAngularObject(self.name+"-atlSelector",true);
        return self.elements;
    }
    getSelectedValues(){
        var self=this;
        var objSel=System.getAngularObject(self.name+"-atlSelector",true);
        return objSel.getSelectedValues();
    }
    setSelectedValues(selectedElems: []) {
        var self=this;
        var objSel=System.getAngularObject(self.name+"-atlSelector",true);
        return objSel.setSelectedValues(selectedElems);
    }
    getPropertyValues(){
        var obj;
        if (this.atlassianAplication.toUpperCase()=="JIRA"){
            obj=System.webapp.getJira();
        } else if (this.atlassianAplication.toUpperCase()=="CONFLUENCE"){
            obj=System.webapp.getConfluence();
        } else if (this.atlassianAplication.toUpperCase()=="WEBAPP"){
            obj=System.webapp;
        }
        if (typeof this.atlassianObjectProperty!=="undefined"){
            return obj[this.atlassianObjectProperty];
        } else {
            return obj[this.atlassianObjectFunction]();
        }
    }
    isSomeOneObserving(){
        return true;
    }

    onGetOptions(event){
        var self=this;
        log("Retrieving table data on atlassianSelector");
        var arrOptions=[];
        if ((typeof self.atlassianObjectProperty!=="undefined") 
                || 
            (typeof self.atlassianObjectFunction!=="undefined")
            || 
            (typeof self.atlassianAplication!=="undefined")
            ){
            arrOptions=self.getPropertyValues();
        }
        System.webapp.continueTask([arrOptions]);
     }
    reloadItems(){
        var self=this;
        var objSel=System.getAngularObject(self.name+"-atlSelector",true);
        return objSel.onRetrieveTableData();
    }
}