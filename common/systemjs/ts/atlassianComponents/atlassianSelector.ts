import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
@Component({
  selector: 'atlassianSelector',
  templateUrl: System.composeUrl('systemjs/html/atlassianComponents/atlassianSelector.html'),
})
export class atlassianSelector {
    @Input() atlassianObjectProperty: string = undefined;
    @Input() atlassianObjectFunction: string = undefined;
    @Input() atlassianAplication: string = undefined;

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
}