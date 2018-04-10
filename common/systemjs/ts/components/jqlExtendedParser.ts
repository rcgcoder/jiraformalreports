import { Component, Input, Output, OnInit } from '@angular/core';
@Component({
  selector: 'jqlExtendedParser',
  templateUrl: System.composeUrl('systemjs/html/components/jqlExtendedParser.html'),
})
export class jqlExtendedParser {
    sJQL:string ="";
    arrSelects:[] ="";
    fields:[]="";
    suggestions:[]=[];
    jqInput:{}="";
    jqSelect:{}="";
    @Input() name: string = 'jqlExtendedParser';
    getInput(){
        return AJS.$('[name="'+this.name+'-input"]');
    }
    getSelect(){
        return AJS.$('[name="'+this.name+'-select"]');
    }
    onKeyUp(event){
        var self=this;
        self.sJQL=self.objTextJQL.val();
        var selStart=self.objTextJQL.prop("selectionStart");
        var selStop=self.objTextJQL.prop("selectionEnd");
        log("["+selStart+","+selStop+"]:{"+self.sJQL+"}");
    }
    initialice(fieldList){
        var self=this;
        self.suggestions=[];
        var initSuggestions=[];
        var grammar={
            "Previous":{key:"previous",name:"Previous.",next:["Field","Not",OpenBlock]}
            "Not":{key:"NOT",name:"NOT",next:["Previous","Field","Not","("]},
            "(":{key:"(",name:"(",next:["Previous","Field","Not","("]},
            "Operators":{key:[],}
            
            Not:{key:"previous",name:"Previous.",next:["Field","Not","("]}
        };
        var arrOptions=[
                        {key:"previous",name:"Previous.",type:"Previous",next:["Field","Not","("]},
                        {key:"NOT",name:"NOT",type:"Not",next:["Previous","Field","Not","("]},
                        {key:"(",name:"(",type:"(",next:["Previous","Field","Not","("]}
                        ];
        for (var i=0;i<fieldList.length;i++){
            var fld=fieldList[i];
            arrOptions.push({key:fld.key,name:fld.name,type:"Field",next:["Operator"]});
        }
        
        
    }
    ngOnInit() {
        var self=this;
        System.addPostProcess(function(){
            self.objTextJQL=self.getInput();
            self.getSelect().auiSelect2();
            System.bindObj(self);
           
            
            var objSelector=self.getSelect();
            var arrOptions=[
                           {key:"previous",name:"Previous.",type:"previous"},
                           {key:"AND",name:"AND",type:"Operator"},
                           {key:"OR",name:"OR",type:"Operator"},
                           {key:"NOT",name:"NOT",type:"Operator"},
                           {key:"(",name:"(",type:"Operator"},
                           {key:")",name:")",type:"Operator"},
                           {key:",",name:",",type:"Operator"}
                           ];
            for (var i=0;i<arrOptions.length;i++){
                var opt=arrOptions[i];
                var sKey=opt.key;
                var sName=opt.name;
                var sOperator=opt.type;
                objSelector.append('<option value="'+sKey+'->0" optType="'+sOperator+'">'+sName+'</option>');
            }
        });
    }
    fillFields(arrOptions){
        var self=this;
        var objSelector=self.getSelect();
        for (var i=0;i<arrOptions.length;i++){
            var opt=arrOptions[i];
            var sKey=opt.key;
            var sName=opt.name;
            var sOperator="Field";
            objSelector.append('<option value="'+sKey+'->0" optType="'+sOperator+'">'+sName+'</option>');
        }
    }
    getText(){
        return AJS.$('[name="'+this.name+'-input"]')[0];
    }
    getResult(){
        return AJS.$('[name="'+this.name+'-result"]')[0];
    }
    doTestNearley(){
        this.testNearley();
    }        
    testNearley(){
        
        var lexer = new Lexer;

        lexer.addRule(/^ */gm, function (lexeme) {
            console.log(lexeme.length);
        });

        lexer.addRule(/[0-9]+/, function (lexeme) {
            console.log(lexeme);
        });

        lexer.setInput("37");

        lexer.lex();        
        
        
        var p = new nearley.Parser(arithmetic.ParserRules, arithmetic.ParserStart);
        try {
            var objFormula=this.getText();
            var sFormula=objFormula.value.trim(); 
            p.feed(sFormula);
            if (!p.results[0]) {
                throw new Error();
            }
            if (isNaN(p.results[0]) || p.results[0] === Infinity) {
                throw new Error();
            }
            log("Parsing: "+sFormula+" Result:<"+p.results[0].toString()+">"):
            this.getResult().value=p.results[0].toString();
        } catch(e) {
            this.getResult().value="Error:" + e.toString():
            log("Parsing: "+sFormula+" Result:<ERROR>:<"+e.toString());
        }
    }    
}