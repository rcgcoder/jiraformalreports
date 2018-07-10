import { Component, Input, Output } from '@angular/core';
import { dlgPrjSelector } from './dialogs/dlgPrjSelector';
@Component({
  selector: 'tabResult',
  templateUrl: System.composeUrl('systemjs/html/tab.result.html'),
})
export class TabResult {
    @Input() header: string = 'this is header';   
    @Input() footer: string = 'this is footer';
    doInNewWindow(){
        var fork=self.addStep("Testing Load Issues:"+self.name, function(){
            var report=System.webapp.theReport;
            report.openResultInNewTab();
            System.webapp.continueTask();
        },0,1,undefined,undefined,undefined,"GLOBAL_RUN",undefined);

    }
}