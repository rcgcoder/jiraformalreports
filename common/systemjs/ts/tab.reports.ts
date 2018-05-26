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
        System.webapp.addStep("Doing property engine test",function(){
            System.webapp.addStep("render content to confirm auth is correct",function(){
                jira.renderContent("test to render **aaa***");
            });
            System.webapp.addStep("Adding a Comment",function(){
                jira.addComment("PDP-37","A simple comment");
            });
            System.webapp.addStep("Calling set property",function(){
                jira.setProperty("PDP-37","RCGTest","A simple value");
            });
            System.webapp.addStep("Calling set attachment",function(){
                var  saveAttachment=function (issueId,theDataToSave) {
                    // theDataToSave is a large block of base-64 encoded binary data
                    var theFileName = "testattachment.xml";
                    var formData = new FormData();
/*                    // Make a blob from the SDR data    
                    var theBlob = new Blob([theDataToSave], {
                      type: 'text/plain; charset="UTF-8"'
                    });
                    formData.append("file", theBlob, theFileName);
*/
                    var content = '<a id="a"><b id="b">hey!</b></a>'; // the body of the new file...
                    var blob = new Blob([content], { type: "text/xml"});

                    formData.append("file", blob, theFileName);
                    var theRequestURL;
                    // gContentId is the JIRA issue ID, previously obtained in the code
                    theRequestURL = '/rest/api/2/issue/' + issueId + '/attachments';
                    AP.request({
                      url: theRequestURL,
                      type: 'POST',
                      data: formData,
//                      dataType: 'multipart/form-data',
//                      dataType: 'json',
                      async: true,
                      processData: false,
                      contentType: 'multipart/form-data',
                      //contentType: false,
                      headers: {
//                        "Content-Type": 'multipart/form-data',
                        "X-Atlassian-Token": "no-check"  // Tried nocheck as well as nocache, same issue
                      },
                      success: function(theResponse) {
                         log("Correcto");
                        // Kick off the next step after the save...
                      },
                      error: function(xhr, textStatus, errorThrown) {
                      // We hit this every time with an XSRF issue
                        alert("Problem saving data: "+xhr.responseText);
                      }
                    });
                  };     
                  
              var iValues=[];
              for (var j=0;j<1000;j++){
                  for (var i=0;i<256;i++){
                      iValues.push(i);
                  }
              }
              var uint8Values= new Uint8Array(iValues);
              var sB64=fromByteArray(uint8Values);
              saveAttachment("PDP-37",sB64);
              System.webapp.continueTask();
               // jira.addAttachmentObject("PDP-37",{text:"attachmentTest",value:"a value"},"jrfConfig.json");
            });
            System.webapp.addStep("End of Calling set property",function(){
                log("property setted... commment added and text rendered ... everything is OK");
                System.webapp.continueTask();
            });
            System.webapp.continueTask();
        },0,1,undefined,undefined,undefined,"GLOBAL_RUN",undefined);
//      self.continueTask();
    }
    doLoadReport(){
        log("Open");
    }
}