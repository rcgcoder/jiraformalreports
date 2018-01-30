class RCGGitHub{
	constructor(){
		this.acount="";
		this.project="";
	}
	getCommits(callback){
		var self=this;
		var xhr = new XMLHttpRequest();
		xhr.open('GET', "https://api.github.com/repos/"+self.acount+"/"+self.project+"/commits/master", true);
		xhr.responseType = 'json';
		xhr.onload = function(e) {
		  if (this.status == 200) {
		    var objJSON = this.response;
		    
		    
		    callback(self);
		  }
		};
		xhr.send();	
	}
}