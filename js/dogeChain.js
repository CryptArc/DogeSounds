Array.prototype.wrapAt = function(i){
  var out;
  out = this[parseInt(Math.floor(Math.abs(i)))%this.length]; 
  return out
}
Array.prototype.sum = function (){ var out =0; for (i=0; i<this.length; i++) {out = out + this[i]}; return out }
Array.prototype.rotate = (function() {
    var unshift = Array.prototype.unshift,
        splice = Array.prototype.splice;
    return function(count) {
        var len = this.length >>> 0,
            count = count >> 0;
        unshift.apply(this, splice.call(this, count % len, len));
        return this;
    };
})();


var dogeChain = new Object();
dogeChain.hashRateArray = [1,2,5,6,1,2,6];
dogeChain.lastNote = [0,1,2,3,4,5,6,7,8,9,10,11,12];
dogeChain.totalCoinsArray = [1,2,5,6];
dogeChain.blockCountArray = [1,2,5,6,3];
dogeChain.difficultyArray = [1,2,5,6];
dogeChain.hashHistory = [1,2,3];
dogeChain.oldHashRate = 1234;
dogeChain.hashRate = 12563;
dogeChain.totalCoins = 12356312563;
dogeChain.oldBlockCount = 1234;
dogeChain.blockCount= 1256;
dogeChain.difficulty = 1256;
dogeChain.oldHashTime = 100;
dogeChain.offset=0;
dogeChain.hashPos = 5;
dogeChain.interval =1;
dogeChain.coin = window.location.hash.length > 0 ? window.location.hash.replace("#","") : "doge"//"uno","doge", "zet","ptr"
dogeChain.startTime = new Date().getTime();
dogeChain.apiData = {};
dogeChain.scaleOffset =0;
dogeChain.dataCallback = function() {}
dogeChain.difficultySlope = function(){
  var nh = this.apiData.nethash_full
  var ds = (parseFloat(nh[0][4]) / parseFloat(nh[1][4])) 
  return ds
}

dogeChain.doTotalCoins = function(){
  if (typeof(this.totalCoins)=="number"){
    this.totalCoinsArray =$(this.totalCoins.toString().split("")).map(function(i,e){return parseInt(e)}).toArray();
  }
}

dogeChain.getData = function(){
  var url = "api.php?coin="+this.coin+"&request=refresh&interval="+this.interval;
  var _this = this;
  $.ajax({
    url:url,
    dataType: "json",
    success:function(data){
      if (data.nethash_full ==null) {
        data.nethash_full = _this.apiData.nethash_full
      } else {
        data.nethash_full = data.nethash_full.reverse()
      }
      dogeChain.apiData = data
    }
  });
}

dogeChain.getAverageBlockTime = function() {
  var times =[];
  var diffs = 0;
  if (this.apiData.nethash_full != undefined){
    var nh = this.apiData.nethash_full;
    for (x=0; x < nh.length-1; x++) {
      diffs = diffs + (parseInt(nh[x][1]) - parseInt(nh[x+1][1]));
    };
    debug.diffs= diffs
    return (diffs / (nh[0][0] - nh[nh.length-1][0]))
  } else {
    return 32 
  }
}

dogeChain.updateData = function(){
  this.hashRate = this.apiData.nethash_full[0].reverse()[0]
  this.oldHashRate = this.apiData.nethash_full[1].reverse()[0]
  this.hashRate = this.hashRate==Infinity ? 100000 : this.hashRate
  this.blockCount = this.apiData.blockcount
  this.difficulty = Math.ceil(parseFloat(this.apiData.difficulty))
  this.totalCoins  = Math.floor(parseFloat(this.apiData.totalbc))
  this.dataCallback()
  
}

dogeChain.doHashRate = function(){
  this.hashRateArray =$(this.hashRate.toString().split("")).map(function(i,e){return parseInt(e)}).toArray();
//  tempo = Math.log(3+this.difficulty)*(64 / Math.log(Math.log(3+this.difficulty)/Math.log(2))) ;/
//  tempo = (32 / (Math.log(this.difficulty)/Math.log(10))) * Math.pow(1.5,Math.log(this.difficulty));
  tempo = 40 + (40*Math.log(this.difficulty)/Math.log(10))

  if (tempo < 40){
    tempo = 40
  }
}
dogeChain.doHashHistory = function(){
    data = this.apiData.nethash_full
    this.oldHashTime = Math.abs(parseInt(data[data.length-2][6]));
    this.oldHashTime = this.oldHashTime < 1 ? 1 : this.oldHashTime
    this.hashHistory = [];
    var hashFirst = data[0][this.hashPos];
    debug.hashFirst = hashFirst
    var _this = this
    for (i=0; i< data.length; i++){
      h = parseFloat(data[i][this.hashPos]);
      h= Math.ceil(128*h/hashFirst);
      if (h==Infinity) {
        h= 128
      }
      this.hashHistory.push(h)
    }
}

dogeChain.doBlockCount = function(){
  this.blockCountArray = $(this.blockCount.toString().split("")).map(function(i,e){return parseInt(e)}).toArray();
}
dogeChain.doDifficulty = function(){
  this.difficultyArray = $(this.difficulty.toString().split("")).map(function(i,e){return parseInt(e)}).toArray();
}
dogeChain.doTransactions = function(){
 
}
