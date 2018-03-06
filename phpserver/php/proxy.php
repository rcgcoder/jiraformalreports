<?PHP
header('access-control-allow-origin:*');
/*
0.- process url params
1.- check for the session github commit id
2.- if no session github commit id.... get the commit id
3.- get the content from rawgit
4.- return the content from rawgit.
*/

// 0. - PROCESS URL PARAMS
// to get the url...
$baseUrl=$_GET['url'];
$refreshCommitId=$_GET['refreshCommitId'];
$urlParams="";
foreach($_GET as $key => $value){
	if (($key!="url")&&($key!="refreshCommitId")){
		if($urlParams!=""){
			$urlParams= $urlParams . "&";
		}
		$urlParams=$urlParams . $key . "=" . $value;
	}
 //   echo "<br>". $key . " : " . $value . "<br />\r\n";
}
if ($urlParams!=""){
	$urlParams="?".$urlParams;
}


// 1.- CHECK FOR THE SESSION GITHUB COMMIT ID AND
// 2.- IF NO SESSION GITHUB COMMIT ID GET THE LAST.
session_start();
$sGitHubUser='rcgcoder';
$sGitHubRepository='jiraformalreports';
function getSessionCommitID() {
	global $_SESSION;
	global $sGitHubRepository;
	global $sGitHubUser;
	global $refreshCommitId;
	$commitID='';
	if ((!isset($_SESSION['GITHUBCOMMITID']))||($refreshCommitId=='1')) {
//		echo "No Session Commit ID";
		session_unset();
		$github='https://api.github.com/repos/'.$sGitHubUser.'/'.$sGitHubRepository.'/commits/master';
		$ch = curl_init($github);                                                                      
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET");                                                                     
		//curl_setopt($ch, CURLOPT_POSTFIELDS, $data_string);                                                                  
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);                                                                      
		curl_setopt($ch, CURLOPT_HTTPHEADER, array(                                                                          
			'Content-Type: application/json'
			)                                                                       
		);  
		curl_setopt ($ch , CURLOPT_USERAGENT , $sGitHubUser) ;        
		$result = curl_exec($ch);
		$objCommit = json_decode($result);
		$sha=$objCommit->sha;
		$commitID=substr($sha,0,8);
		session_start();
		$_SESSION['GITHUBCOMMITID']  = $commitID;
		session_write_close();
	} else {
//		echo "there were a session Commit id";
		$commitID=$_SESSION['GITHUBCOMMITID'];
	}
	return $commitID;
}
$commitID=getSessionCommitID();
//echo $commitID;
//return;
// 3. - GET RAWGIT CONTENT
// to get the headers
function HandleHeaderLine( $curl, $header_line ) {
//    echo "<br>YEAH: ".$header_line; // or do whatever
	$arrValues=explode(":",$header_line,2);
	if (sizeOf($arrValues)>1){
		header($arrValues[0]. ":" .  $arrValues[1]);
	}
    return strlen($header_line);
}
$url="https://cdn.rawgit.com/".  $sGitHubUser . "/". $sGitHubRepository. "/". $commitID."/". $baseUrl . $urlParams;
header('urlInRawGit:'.$url);
$ch = curl_init($url);                                                                      
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET");                                                                     
//curl_setopt($ch, CURLOPT_POSTFIELDS, $data_string);                                                                  
//curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);                                                                      
/*curl_setopt($ch, CURLOPT_HTTPHEADER, array(                                                                          
    'Content-Type: application/json'
//	,                                                                                
//    'Content-Length: ' . strlen($data_string)
	)                                                                       
);  
curl_setopt ($ch , CURLOPT_USERAGENT , 'rcgcoder' ) ;        
*/
//curl_setopt($ch, CURLOPT_HEADERFUNCTION, "HandleHeaderLine");                                                                                                                     
curl_exec($ch);
?>