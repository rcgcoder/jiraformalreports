import { Component, Input, Output } from '@angular/core';
@Component({
  selector: 'tabStructure',
  templateUrl: System.composeUrl('systemjs/html/tab.structure.html'),
})
export class TabStructure {
    @Input() header: string = 'this is header';   
    @Input() footer: string = 'this is footer';
    @Input() name: string = 'tabStructure';
/*    ngOnInit() {
        var self=this;
        System.addPostProcess(function(){
            System.bindObj(self);
        });
    }
 */
    onGetBillingRelationships(event){
        log("GettingRelationships");
        var arrValues=[
                        "es implementado por"
                        ,"causa"
                        ,"está causada por"
                        ,"depende de"
                        ,"bloquea a"
                        ,"detecta"
                        ,"es detectado en"
                        ,"duplica"
                        ,"está duplicado por"
                        ,"especifica"
                        ,"es especificado en"
                        ,"FF-depends on"
                        ,"is FF-depended by"
                        ,"FS-depends on"
                        ,"is FS-depended by"
                        ,"implementa"
                        ,"tiene relación con"
                        ,"est&aacute; relacionado con"
                        ,"SF-depends on"
                        ,"is SF-depended by"
                        ,"SS-depends on"
                        ,"is SS-depended by"
                        ,"se divide en"
                        ,"es subrequisito de"
                        ,"valida"
                        ,"es validado por"
                        ];
        var arrResult={};
        for (var i=0;i<arrValues.length;i++){
            var vAux=arrValues[i];
            arrResult.push({key:vAux,name:vAux});
        }
        System.webapp.continueTask([arrResult]);
    }
    onGetBillingFields(event){
       log("structure fields event.... onGetBillingFields");
       System.webapp.continueTask([System.webapp.getListFields()]);
    }
}