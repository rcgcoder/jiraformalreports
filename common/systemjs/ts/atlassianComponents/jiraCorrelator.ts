import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
@Component({
  selector: 'jiraCorrelator',
  templateUrl: System.composeUrl('systemjs/html/atlassianComponents/jiraCorrelator.html'),
})
export class jiraCorrelator {
    @Input() name: string = 'jiraCorrelator';
    @Input() caption: string = 'Child Relations';
    ngOnInit() {
        var self=this;
        System.addPostProcess(function(){
            log("PostProcessing:"+self.name);
            System.bindObj(self);
            self.changeVisibilityAndOr();
        });
    }
    getChildFieldValuesSelected(){
        var selChild=System.getAngularObject(self.name+"-childField",true);
        var result=selChild.getValuesSelected();
        return result;
    }
    getParenFieldValuesSelected(){
        var selParent=System.getAngularObject(self.name+"-parentField",true);
        var result=selParent.getValuesSelected();
        return result;
    }
    
    addField(){
        var self=this;
        log("adding Field hierarchy");
        var txtArea=System.getAngularDomObject(self.name+"-text");
        txtArea=$(txtArea);
        var sAntVal=txtArea.val();
        if (sAntVal!=""){
            var andObj=System.getAngularDomObject(self.name+"-addOrField");
            sAntVal=andObj.val()+"\n"+sAntVal;
        }
        var childFlds=self.getChildFieldValuesSelected();
        var parentFlds=self.getParenFieldValuesSelected();
        txtArea.val(sAntVal);
        self.changeVisibilityAndOr();
    }
    addLink(){
        log("adding Link hierarchy");
    }
    changeVisibilityAndOr(){
        var self=this;
        var txtArea=System.getAngularDomObject(self.name+"-text");
        txtArea=$(txtArea);
        if (txtArea.val()!=""){
            $(System.getAngularDomObject(self.name+"-addOrField")).show();
            $(System.getAngularDomObject(self.name+"-addOrLink")).show();
        } else {
            $(System.getAngularDomObject(self.name+"-addOrField")).hide();
            $(System.getAngularDomObject(self.name+"-addOrLink")).hide();
        }
        
    }
    textAreaChanged(event){
        log("TextArea Changed")
        this.changeVisibilityAndOr();
    }
}