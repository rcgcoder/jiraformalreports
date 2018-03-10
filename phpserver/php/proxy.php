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
function getUrlParameter($paramName){
    global $_GET;
    if (isset($_GET[$paramName])){
        return $_GET[$paramName];
    }
    return "";
}
function redirect($url) {
    ob_start();
    header('Location: '.$url);
    ob_end_flush();
    die();
}

$baseUrl=getUrlParameter("url");
$refreshCommitId=getUrlParameter('refreshCommitId');
$onlyCommitId=getUrlParameter('getCommitId');
$oauth=getUrlParameter('oauth');
$urlParams="";
$postParams="";
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
foreach($_POST as $key => $value){
    if($postParams!=""){
        $postParams= $postParams . "&";
    }
    $postParams=$postParams . $key . "=" . $value;
    //   echo "<br>". $key . " : " . $value . "<br />\r\n";
}


if ($oauth=="1"){
    //	echo "<br>Oauth";
    //	echo "<br>".$baseUrl;
    session_start();
    $useragent = $_SERVER['HTTP_USER_AGENT'];
    //	$strCookie = 'PHPSESSID=' . $_COOKIE['PHPSESSID'] . '; path=/';
    //	echo "<br> Cookie:". $strCookie;
    //	$nodeCookies = $_SESSION['NODEJS_COOKIES'];
    //	echo "<br> NODEJS_COOKIES:". $nodeCookies ;
    //	var_dump($nodeCookies);
    //	echo "<br> Calling......";
    if ($baseUrl=="sessionToken"){ // the caller wants the session stored oauth token
        if (isSet($_SESSION['OAUTH_TOKEN'])){
            echo $_SESSION['OAUTH_TOKEN'];
        } else {
            echo '{"isToken"="false"}';
        }
        exit();
    }
    $url="http://192.168.100.3:18080/".$baseUrl.$urlParams;
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $_SERVER['REQUEST_METHOD']);
    curl_setopt($ch, CURLOPT_USERAGENT, $useragent);
    //	foreach ($nodeCookies as $cookie){
    //		curl_setopt($ch, CURLOPT_COOKIE, $cookie );
    //	}
    //	curl_setopt($ch, CURLOPT_HEADER, 1);
    if ($postParams!=""){
        curl_setopt($ch, CURLOPT_POSTFIELDS,$postParams);
    }
    /*	curl_setopt($ch, CURLOPT_HTTPHEADER, array(
     'Content-Type: application/json'
     )
     );
     */	$result = curl_exec($ch);
    //	preg_match_all('/^Set-Cookie:\s*([^;]*)/mi', $result, $matches);
    //	$cookies = array();
    //	foreach($matches[1] as $item) {
    //		parse_str($item, $cookie);
    //		$cookies = array_merge($cookies, $cookie);
    //	}
    //	var_dump($cookies);
    //	$arrCookies=array();
    //	foreach($cookies as $key=>$value){
    //		array_push($arrCookies,$key."=".$value);
    //	}
    //	echo "<br><br>";
    $objOauth = json_decode($result);
    //	var_dump($objOauth);
    if (isSet($objOauth->isToken)){
        //		echo "token is set";
        $_SESSION['OAUTH_TOKEN']=$result;
        session_write_close();
        //		echo "Session Token Set:".$result;
        $url="https://d696dc44.ngrok.io/jfreports/common/html/autoclose.html";
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');
        curl_setopt($ch, CURLOPT_USERAGENT, $useragent);
        $result=curl_exec($ch);
        echo $result;
        exit();
    } else {
        echo $result;
    }
    /*
     //	$_SESSION['NODEJS_COOKIES']=$arrCookies;
     //	session_write_close();
     $objOauth = json_decode($result);
     //	var_dump($objAuth);
     if ($objAuth->redirect==true){
     //echo "Redireccionar a:" . $objAuth->url;
     //		redirect($objAuth->url);
     } else {
     //echo "Sin Redireccionar";
     //echo "[".$result."]";
     //		echo $result[0];
     }
     */
    exit();
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
    if ((!isset($_SESSION['GITHUBCOMMITID']))
        ||
        (!isset($_SESSION['GITHUBCOMMITOBJECT']))
        ||
        ($refreshCommitId=='1')) {
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
            $_SESSION['GITHUBCOMMITOBJECT']  = $result;
            session_write_close();
        } else {
            //		echo "there were a session Commit id";
            $commitID=$_SESSION['GITHUBCOMMITID'];
        }
        
        return $commitID;
}
$commitID=getSessionCommitID();
if ($onlyCommitId=="1"){ // if this param is set the php returns the last commit id
    echo $_SESSION['GITHUBCOMMITOBJECT'];
    return;
}
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