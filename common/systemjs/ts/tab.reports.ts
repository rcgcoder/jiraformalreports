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
        var self=this;
        var bigArray=[];
        var bigString="";
        var iSize=0;
        while (bigString.length<(64*1024*1024)){
            bigString=bigString+Math.round(Math.random()*1000);
        }
        var sAux;
        var iTotalBlocks=5;
        for (var i=0;i<iTotalBlocks;i++){
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
        var dynObj=newDynamicObjectFactory(
            [{name:"Child",description:"SubIssues for Billing",type:"object"},
             {name:"AdvanceChild",description:"SubIssues for advance calculation",type:"object"},
             {name:"LinkType",description:"Relation Types",type:"object"}
            ]
            ,
            ["TestObject"]
            ,
            []
            ,
            undefined);
        for (var i=0;i<(64*1024);i++){
            var oIssue=dynObj.new("Test Dynobj"+i,""+i);
            oIssue.setTestObject(bigArray); 
        }
        
        
        
        
        System.webapp.continueTask([bigArray,dynObj]);
    }
    doMemoryLeaksTest(){
        var theTab=this;
        var self=System.webapp;
        self.addStep("Starting Memory Leak Test",function(){
            theTab.innerMemoryLeakTest();
        });
        var theBigOne;
        var theDynObj;
        self.addStep("Endind Memory Leak Test",function(bigArray,dynObj){
            theBigOne=bigArray;
            theDynObj=dynObj;
            log("Ended:"+ bigArray.length + " dynObj:"+dynObj.list.length());
            self.addStep("Processing things with big array",function(){
                for (var i=0;i<bigArray.length;i++){
                    if ((math.random()*100)<5){
                        var str=bigArray[i];
                        str=str.substring(0,50) +  " [" +str.length+"]";
                        log(str);
                    }
                }
                self.continueTask();
            });
            self.addStep("another Step",function(){
                var innerBig=theBigOne;
                for (var i=0;i<innerBig.length;i++){
                    if ((Math.random()*100)<5){
                        var str=innerBig[i];
                        str="BigOne:"+str.substring(0,50) +  " [" +str.length+"]";
                        log(str);
                    }
                }
                for (var i=0;i<theDynObj.list.length();i++){
                    if ((Math.random()*100)<5){
                        var objAux=theDynObj.getById(""+i);
                        var strArr=objAux.getTestObject();
                        var rndInd=Math.round(Math.random()*strArr.length);
                        if (rndInd>=strArr.length) rndInd=Math.round(Math.random()*(strArr.length-1));
                        str=strArr[rndInd];
                        str="dynObj:"+str.substring(0,50) +  " [" +str.length+"]";
                        log(str);
                    }
                }          
                self.continueTask();
            });
            self.continueTask();
        });
        self.continueTask();
    }
    doUpdateIssuePropertyTest(){
        var self=this;
        var jira=System.webapp.getJira();
        self.addStep("Calling set property",function(){
            jira.setProperty("PDP-37","RCGTest","A simple value");
        });
        self.addStep("End of Calling set property",function(){
            log("property setted");
        });
        
    }
}