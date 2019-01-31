

debugger;
var theMethod="GET";
var theUrl="https://paega2.atlassian.net/secure/attachment/41486/screenshot-1.png";
var theParameters={
    oauth_consumer_key: "OauthKey"
	,oauth_nonce: "8302830"
	,oauth_signature_method: "RSA-SHA1"
	,oauth_timestamp: 1548825765
	,oauth_token: "asfFgx4OZZAqAQsLBL4bTnjOq91P1NDE"
	,oauth_version: "1.0"
};
var theConsumerSecret="";
var theTokenSecret="H21LT5mQiTDpZKQRdJhxC4mudAfkdPJx";

var signatureNew = oauthSignature.generate(theMethod, theUrl, theParameters,
        theConsumerSecret, theTokenSecret);
var theBaseString=new oauthSignature.SignatureBaseString(theMethod, theUrl, theParameters).generate();

var queryArguments, orderedFields;
queryArguments = theParameters;
orderedFields = _.keys(queryArguments).sort();
var queryString= _.map(orderedFields, function(fieldName) {
    return fieldName + "=" + encodeURIComponent(queryArguments[fieldName]).replace(/\*/g, "%2A");
}).join("&");



document.write("Hello:  "+signatureNew + "    "+ queryString);