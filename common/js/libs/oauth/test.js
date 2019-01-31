

debugger;
var theMethod="GET";
var theUrl="https://paega2.atlassian.net/secure/attachment/41486/screenshot-1.png";
var theParameters={
    oauth_consumer_key: "OauthKey"
	,oauth_nonce: "8302830"
	,oauth_signature_method: "HMAC-SHA1"
	,oauth_timestamp: 1548825765
	,oauth_token: "asfFgx4OZZAqAQsLBL4bTnjOq91P1NDE"
	,oauth_version: "1.0"
};
var theConsumerSecret="";
var theTokenSecret="H21LT5mQiTDpZKQRdJhxC4mudAfkdPJx";

var signatureNew = oauthSignature.generate(theMethod, theUrl, theParameters,
        theConsumerSecret, theTokenSecret);
var theBaseString=new oauthSignature.SignatureBaseString(theMethod, theUrl, theParameters).generate();

document.write("Hello:  "+signatureNew );