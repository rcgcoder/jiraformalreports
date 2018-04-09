import { Component, Input, Output, OnInit } from '@angular/core';
@Component({
  selector: 'jqlExtendedParser',
  templateUrl: System.composeUrl('systemjs/html/components/jqlExtendedParser.html'),
})
export class jqlExtendedParser {
    @Input() name: string = 'jqlExtendedParser';
    getText(){
        return AJS.$('[name="'+this.name+'-input"]')[0];
    }
    getResult(){
        return AJS.$('[name="'+this.name+'-result"]')[0];
    }
    doTestNearley(){
        this.testNearley();
    }    
    ngOnInit() {
        var self=this;
        System.addPostProcess(function(){
            System.bindObj(self);
        });
    }
    
    testNearley(){
        
        var row = 1;
        var col = 1;

        var lexer = new Lexer(function (char) {
            throw new Error("Unexpected character at row " + row + ", col " + col + ": " + char);
        });

        lexer.addRule(/\n/, function () {
            row++;
            col = 1;
        }, []);

        lexer.addRule(/./, function () {
            this.reject = true;
            col++;
        }, []);

        lexer.input = "Hello World!";

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