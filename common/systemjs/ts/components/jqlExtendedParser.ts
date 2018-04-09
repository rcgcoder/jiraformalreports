import { Component, Input, Output, OnInit } from '@angular/core';
@Component({
  selector: 'jqlExtendedParser',
  templateUrl: System.composeUrl('systemjs/html/components/jqlExtendedParser.html'),
})
export class jqlExtendedParser {
    @Input() name: string = 'jqlExtendedParser';
    getSelect(){
        return AJS.$('[name="'+this.name+'-select"]');
    }
    ngOnInit() {
        var self=this;
        System.addPostProcess(function(){
            self.getSelect().auiSelect2();
            System.bindObj(self);
            var objSelector=this.getSelect();
            var arrOptions=[
                           {key:"AND",name:"AND"},
                           {key:"OR",name:"OR"},
                           {key:"NOT",name:"NOT"},
                           {key:"(",name:"("},
                           {key:")",name:")"},
                           {key:",",name:","}
                           ];
            for (var i=0;i<arrOptions.length;i++){
                var opt=arrOptions[i];
                var sKey=opt.key;
                var sName=opt.name;
                objSelector.append('<option value="'+sKey+'">'+sName+'</option>');
            }
        });
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