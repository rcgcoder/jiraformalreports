import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
@Component({
  selector: 'jiraCorrelator',
  templateUrl: System.composeUrl('systemjs/html/atlassianComponents/jiraCorrelator.html'),
})
export class jiraCorrelator {
    @Input() name: string = 'jiraCorrelator';
    @Input() caption: string = 'Child Relations';
    @Input() withToggle: boolean = false;
    @Input() toggleLabel: string = "Enable function";
    @Input() withCaption: boolean = true;
    ngOnInit() {
        var self=this;
        System.addPostProcess(function(){
            log("PostProcessing:"+self.name);
            System.bindObj(self);
            self.changeVisibilityAndOr();
            if (!self.withCaption){
                var auxObj=System.getAngularDomObject(self.name+"-caption");
                $(auxObj).hide();
            }
            if (!self.withToggle){
                var auxObj=System.getAngularDomObject(self.name+"-toggleVisible");
                $(auxObj).hide();
            }
        });
    }
    fillLinks(arrLinks){
        var self=this;
        // key ---> the issue key
        // name ---> the name of the issue
        // description --> for the table
        var selLinks=System.getAngularObject(self.name+"-childLink",true);
        selLinks.fillOptions(arrLinks);
    }
    fillFields(arrFields){
        var self=this;
        // key ---> the issue key
        // name ---> the name of the issue
        // description --> for the table
        var selChild=System.getAngularObject(self.name+"-childField",true);
        var selParent=System.getAngularObject(self.name+"-parentField",true);
        selChild.fillOptions(arrFields);
        selParent.fillOptions(arrFields);
    }
    getChildLinkSelectedValues(){
        var self=this;
        var selChild=System.getAngularObject(self.name+"-childLink",true);
        var result=selChild.getSelectedValues();
        return result;
    }
    getChildFieldSelectedValues(){
        var self=this;
        var selChild=System.getAngularObject(self.name+"-childField",true);
        var result=selChild.getSelectedValues();
        return result;
    }
    getParentFieldSelectedValues(){
        var self=this;
        var selParent=System.getAngularObject(self.name+"-parentField",true);
        var result=selParent.getSelectedValues();
        return result;
    }
    getTextArea(){
        var self=this;
        var txtArea=System.getAngularDomObject(self.name+"-text");
        txtArea=$(txtArea);
        return txtArea;
    }
    getValue(){
        return this.getTextArea().val();
    }
    setValue(sVal){
        this.getTextArea().val(sVal);
    }
    addField(){
        var self=this;
        log("adding Field hierarchy");
        var sAntVal=self.getValue();
        if (sAntVal!=""){
            var andObj=System.getAngularDomObject(self.name+"-addOrField");
            sAntVal="\n"+(andObj.val()=="and"?"&&":"||")+"\n"+sAntVal;
        }
        var childFlds=self.getChildFieldSelectedValues();
        var parentFlds=self.getParentFieldSelectedValues();
        var chldFld=childFlds[0];
        var prntFld=parentFlds[0];
        self.setValue("(child.fieldValue('"+chldFld.key+"') /*"+chldFld.name+"*/==parent.fieldValue('"+prntFld.key+"') /*"+prntFld.name+"*/"+")" +sAntVal);
        self.changeVisibilityAndOr();
    }
    addLink(){
        log("adding Link hierarchy");
        var self=this;
        log("adding Field hierarchy");
        var sAntVal=self.getValue();
        if (sAntVal!=""){
            var andObj=System.getAngularDomObject(self.name+"-addOrLink");
            sAntVal="\n"+(andObj.val()=="and"?"&&":"||")+"\n"+sAntVal;
        }
        var childLinks=self.getChildLinkSelectedValues();
        var chldLnk=childLinks[0];
        self.setValue("(child.isLinkedTo(parent,'"+chldLnk.key+"'))" +sAntVal);
        self.changeVisibilityAndOr();
    }
    changeVisibilityAndOr(){
        var self=this;
        var sAntVal=self.getValue();
        if (sAntVal!=""){
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
    updateIssueLinkTypes(){
        var self=this;
        var selIssueLinkTypes=System.getAngularObject(self.name+"-childLink",true);
        selIssueLinkTypes.reloadItems();
    }
}