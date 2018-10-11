System.webapp.addStep("Refreshing ...", function(){
    System.webapp.addStep("Refresh de Commit Id for update de report class", function(){
        var antCommitId=System.webapp.github.commitId;
        System.webapp.pushCallback(function(){
           log("commit updated");
           System.webapp.continueTask();
        });
        System.webapp.github.updateLastCommit();
    });
    System.webapp.addStep("Dynamic load test class", function(){
        var arrFiles=[                  
				    "js/rcglibs/RCGObjectStorageUtils.js",
				    "js/rcglibs/tests/RCGTest.js"
                     ]; //test
        System.webapp.loadRemoteFiles(arrFiles);
    });
    System.webapp.continueTask();
});
