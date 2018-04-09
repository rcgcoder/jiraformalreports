import { Component, Input, Output, OnInit } from '@angular/core';
@Component({
  selector: 'jqlExtendedParser',
  templateUrl: System.composeUrl('systemjs/html/components/jqlExtendedParser.html'),
})
export class jqlExtendedParser {
    @Input() name: string = 'jqlExtendedParser';
    getText(){
        return AJS.$('[name="'+this.name+'-input"]');
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
        var p = new nearley.Parser(arithmetic.ParserRules, arithmetic.ParserStart);
        try {
            var objFormula=this.getText()[0];
            var sFormula=objFormula.value.trim(); 
            p.feed(sFormula);
            if (!p.results[0]) {
                throw new Error();
            }
            if (isNaN(p.results[0]) || p.results[0] === Infinity) {
                throw new Error();
            }
            log("Parsing: "+sFormula+" Result:<"+p.results[0].toString()+">"):
        } catch(e) {
            log("Parsing: "+sFormula+" Result:<ERROR>:<"+e.toString());
        }
    }    
}