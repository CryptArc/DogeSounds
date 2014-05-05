<?php
//cheap php API proxy to do curl requests for this stuff

/*
//dogechain.info api 
total coins vs moon  = space elevator height
each transaction is a rocket
chord or arpeggio - size of transaction, age of block (age of coins)
difficulty of current block
http://dogechain.info/chain/Dogecoin/q/totalbc
http://dogechain.info/chain/Dogecoin/q/getblockcount
http://dogechain.info/chain/Dogecoin/q/getdifficulty

http://dogechain.info/chain/Dogecoin/q/transactions

addressbalance - amount ever received minus amount ever sent by a given address.
addresstohash - shows the public key hash encoded in an address.
checkaddress - checks an address for validity.
decode_address - shows the version prefix and hash encoded in an address.
getblockcount - shows the current block number.
getdifficulty - shows the last solved block's difficulty.
getreceivedbyaddress - shows the amount ever received by a given address.
getsentbyaddress - shows the amount ever sent from a given address.
hashtoaddress - shows the address with the given version prefix and hash.
nethash - shows statistics about difficulty and network power.
totalbc - shows the amount of currency ever mined.
transactions - shows the amount transactions of the last blocks.

*/

function get_data($url,$filename = null) {
  //check cache
  $chain = isset($_GET["coin"]) ? $_GET["coin"] : "doge";
  
  if ($filename==null){
    $filename = array_pop(explode("/",$url));
  }
  $filename = $chain."/".$filename;
  if (!file_exists("cache/".$filename)){
    file_put_contents("cache/".$filename,"{'time':1}");
  }
  $cache = file_get_contents("cache/".$filename);
  $cache = json_decode($cache,true);
  if (isset($cache["time"])&& ((time() - $cache["time"]) < 10)){
    //cache is fresh - use the data
    $data = $cache["data"];
  } else {
    //cache is old
  	$ch = curl_init();
  	$timeout = 5;
  	curl_setopt($ch, CURLOPT_URL, $url);
  	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  	curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);
  	$data = curl_exec($ch);
  	curl_close($ch);
    //write cache
    $timestamp = time();
    $cache = array("time"=>$timestamp,"data"=>$data);
    file_put_contents("cache/".$filename,json_encode($cache));
  }
	return $data;
}
$data = null;
if (isset($_GET["request"])){
  $chain = isset($_GET["coin"]) ? $_GET["coin"] : "doge";
  $apis= array(
    "bc"=>"http://blocks.blackcoin.pw/chain/BlackCoin/q/",
    "doge"=>"http://dogechain.info/chain/Dogecoin/q/",
    "drk"=>"http://explorer.darkcoin.io/chain/DarkCoin/q/",
    "mzc"=>"http://explorer.mazacoin.org/chain/MazaCoin/q/",
    "ptr"=>"http://petroexplorer.info/chain/petrodollar/q/",
    "uno"=>"http://cryptexplorer.com/chain/Unobtanium/q/",
    "pig"=>"http://piggycha.in/chain/Piggycoin/q/",
    "zet"=>"http://petroexplorer.info/chain/zetacoin/q/");
  $api_url = $apis[$chain];
  $req = $_GET["request"];
  switch ($req){
    case "refresh":
    $data_array = array();
    $data_array["totalbc"] = json_decode(get_data($api_url."totalbc"),true);
    $data_array["blockcount"] = json_decode(get_data($api_url."getblockcount"),true);
    $data_array["difficulty"] = json_decode(get_data($api_url."getdifficulty"),true);
    $data = get_data($api_url."nethash/1/-1/?format=json","nethash");
    $data = str_replace('"','',$data);
    $data = str_replace('[[','[["',$data);
    $data = str_replace(',','","',$data);
    $data = str_replace(']]','"]]',$data);
    $data = str_replace('" ','"',$data);
    $data = json_decode($data,true);
    $data_array["nethash"] = $data;
    $data = get_data($api_url."nethash/1/-32?format=json","nethash_full");
    $data = str_replace('"','',$data);
    $data = str_replace(',','","',$data);
    $data = str_replace('[','["',$data);
    $data = str_replace(']','"]',$data);
    $data = str_replace('["[','[[',$data);
    $data = str_replace(']"]',']]',$data);
    $data = str_replace('" ','"',$data);
    $data = str_replace(']","[','],[',$data);
    $data = json_decode($data,true);
    $data_array["nethash_full"]  = $data;

    $data = json_encode($data_array);
    break;
    case "totalbc":
      $data = get_data($api_url."totalbc");
    break;
    
    case "getblockcount":
      $data = get_data($api_url."getblockcount");
    break;
    
    case "getdifficulty": 
      $data = get_data($api_url."getdifficulty");
    break;
   
    case "nethash":
    //only the most recent, for nethashrate
      $data = get_data($api_url."nethash/1/-1/?format=json","nethash");
      $data = str_replace('"','',$data);
      $data = str_replace('[[','[["',$data);
      $data = str_replace(',','","',$data);
      $data = str_replace(']]','"]]',$data);
      $data = json_decode($data,true);
      $data = json_encode($data);
    break; 
    
    /*
      blockNumber:          height of last block in interval + 1
      time:                 block time in seconds since 0h00 1 Jan 1970 UTC
      target:               decimal target at blockNumber
      avgTargetSinceLast:   harmonic mean of target over interval
      difficulty:           difficulty at blockNumber
      hashesToWin:          expected number of hashes needed to solve a block at this difficulty
      avgIntervalSinceLast: interval seconds divided by blocks
      netHashPerSecond:     estimated network hash rate over interval

      Statistical values are approximate and differ slightly from http://blockexplorer.com/q/nethash.

      /chain/CHAIN/q/nethash[/INTERVAL[/START[/STOP]]]
      Default INTERVAL=144, START=0, STOP=infinity.
      Negative values back from the last block.
      Append ?format=json to URL for headerless, JSON output.

      blockNumber,time,target,avgTargetSinceLast,difficulty,hashesToWin,avgIntervalSinceLast,netHashPerSecond

    */
    
    case "nethash_full":
    //only the most recent, for nethashrate
  //    $current_block = (int)$_GET["current_block"]-32;
      $data = get_data($api_url."nethash/1/-32?format=json","nethash_full");
      $data = str_replace('"','',$data);
      $data = str_replace(',','","',$data);
      $data = str_replace('[','["',$data);
      $data = str_replace(']','"]',$data);
      $data = str_replace('["[','[[',$data);
      $data = str_replace(']"]',']]',$data);
      $data = str_replace('" ','"',$data);
      $data = str_replace(']","[','],[',$data);
      $data = json_decode($data,true);
      $data = json_encode($data);
    break; 
    case "transactions":
      $data = get_data($api_url."transactions");
    break;
    default:
      $data = "bad request";
    break;
  }
}
if (strlen($data)<1){
  $data = "no data returned";
}
header('Content-Type: application/json');
echo $data;

  exit();
  
  ?>