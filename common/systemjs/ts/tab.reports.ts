import { Component, Input, Output, OnInit } from '@angular/core';


@Component({
  selector: 'tabReports',
  templateUrl: System.composeUrl('systemjs/html/tab.reports.html')
})

export class TabReports {
    tabOpened:{}='';
    ngOnInit() {
        var self=this;
        System.addPostProcess(function(){
            log("TabReports constructor called");
            var theList=$("#ulDwarfers");
            console.log("List items:"+theList.length);
            console.log("Updating List");
            theList.append('<li><a href="#">Menu item Dyn</a></li>');
            
            //AJS.$("#select2-example").append('<option value="test">Dyn Created</option>');
            //System.bindObj(self);
        });
    }

    doOpenJQL(){
        var win = window.open("https://paega2.atlassian.net/issues/?jql=", '_blank');
        win.focus();
    }   
    doProcessModel(){
        var model=System.webapp.model;
        var jqResult=$("#ReportResult");
        jqResult.html(model);
    }
    innerMemoryLeakTest(callback){
        var bigArray=[];
        var bigString="";
        var iSize=0;
        while (bigString.length<(1024*1024*1024)){
            bigString=bigString+Math.round(Math.random()*1000);
        }
        var sAux;
        for (var i=0;i<100;i++){
            sAux=i+" - "+bigString;
            iSize+=sAux.length;
            bigArray.push(i+" - "+bigString);
            log("Testing:"+Math.round(iSize/(1024*1024))+" Mbytes");
        }
        for (var i=0;i<bigArray.length;i++){
            if ((math.random()*100)<5){
                var str=bigArray[i];
                str=str.substring(0,50) +  " [" +str.length+"]";
                log(str);
            }
        }
        log("Big Array was build");
    }
    doMemoryLeaksTest(){
        var theTab=this;
        var self=System.webapp;
        self.addStep("Starting Memory Leak Test",function(){
            theTab.innerMemoryLeakTest();
            self.continueTask();
        });
        self.addStep("Endind Memory Leak Test",function(){
            log("Ended");
            self.continueTask();
        });
        self.continueTask();
    }
}