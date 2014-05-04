Array.prototype.wrapAt = function(i){var out = this[i%this.length]; return out}

var dogeChain = new Object();
dogeChain.hashRateArray = [1,2,3,4,5,6,7];
dogeChain.lastNote = [0,1,2,3,4,5,6,7,8,9,10,11,12];
dogeChain.totalCoinsArray = [1,2,3];
dogeChain.blockCountArray = [1,2,3];
dogeChain.difficultyArray = [1,2,3];
dogeChain.hashHistory = [1,2,3];
dogeChain.oldHashRate = 1234;
dogeChain.hashRate = 123456;
dogeChain.totalCoins = 123456789;
dogeChain.oldBlockCount = 1234;
dogeChain.blockCount= 1234;
dogeChain.difficulty = 1234;
dogeChain.oldHashTime = 100;
dogeChain.coin = "doge"; //"uno","doge", "zet","ptr"
dogeChain.startTime = new Date().getTime();
dogeChain.apiData = {};
dogeChain.doTotalCoins = function(){
  this.totalCoinsArray =$(this.totalCoins.toString().split("")).map(function(i,e){return parseInt(e)}).toArray();
}

dogeChain.getData = function(){
  var url = "api.php?coin="+this.coin+"&request=refresh";
  var _this = this;
  $.ajax({
    url:url,
    dataType: "json",
    success:function(data){
      if (data.nethash_full ==null) {
        data.nethash_full = [data.nethash]
      }
      dogeChain.apiData = data
    }
  });
}

dogeChain.updateData = function(){
  if (typeof(this.apiData.nethash)=="object" &&  this.apiData.nethash.length >0){
    if (this.apiData.nethash[0][7] != undefined)
    this.hashRate = this.apiData.nethash[0][7]
  } else {
    this.hashRate = this.apiData.nethash[0].wrapAt(6)
  }
  this.hashRate = this.hashRate==Infinity ? 100000 : this.hashRate
  this.blockCount = this.apiData.blockcount
  this.difficulty = Math.ceil(parseFloat(this.apiData.difficulty))
  this.totalCoins  = Math.floor(parseFloat(this.apiData.totalbc))
}

dogeChain.doHashRate = function(){
  this.hashRateArray =$(this.hashRate.toString().split("")).map(function(i,e){return parseInt(e)}).toArray();
  tempo = Math.log(2+this.difficulty)*16;
  if (tempo < 60){
    tempo = 60
  }
  
}
dogeChain.doHashHistory = function(){
    data = this.apiData.nethash_full
      this.oldHashTime = Math.abs(parseInt(data[data.length-2][6]));
      this.oldHashTime = this.oldHashTime < 1 ? 1 : this.oldHashTime
      this.hashHistory = [];
      var _this = this
      $(data).each(function(i,e){
        var h = parseFloat(e[6]);
       if (h > 10000) {
         h=1;
       }
        if ((h==NaN) || h<1|| h>256){
          h=1;
        }
        _this.hashHistory.push(h);
      })
      this.hashHistory = _this.hashHistory
}

dogeChain.doBlockCount = function(){
  this.blockCountArray = $(this.blockCount.toString().split("")).map(function(i,e){return parseInt(e)}).toArray();
}
dogeChain.doDifficulty = function(){
  this.difficultyArray = $(this.difficulty.toString().split("")).map(function(i,e){return parseInt(e)}).toArray();
}
dogeChain.doTransactions = function(){
 
}
