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
dogeChain.startTime = new Date().getTime();

dogeChain.doTotalCoins = function(){
  var url =   "api.php?request=totalbc";
  var _this = this;
  $.ajax({
    url:url,
    dataType: "json",
    success:function(data){
      _this.totalCoins =data;
    }
  })  
  this.totalCoins =Math.floor(_this.totalCoins);
  this.totalCoinsArray =$(this.totalCoins.toString().split("")).map(function(i,e){return parseInt(e)}).toArray();
  
}
dogeChain.doHashRate = function(){
  var url =   "api.php?request=nethash";
  var _this = this;
  $.ajax({
    url:url,
    dataType: "json",
    success:function(data){
      _this.hashRate = data[0][7];
    }
  });
  this.hashRate = _this.hashRate;
  this.hashRateArray =$(this.hashRate.toString().split("")).map(function(i,e){return parseInt(e)}).toArray();
  tempo = this.difficulty*0.125;
  if (tempo < 60){
    tempo = 60
  }
}
dogeChain.doHashHistory = function(){
  var url =   "api.php?request=nethash_full&current_block="+this.blockCount.toString();
  var _this = this;
  _this.hashHistory = [];
  
  $.ajax({
    url:url,
    dataType: "json",
    success:function(data){
      _this.oldHashTime = Math.abs(parseInt(data[data.length-2][6]));
      _this.oldHashTime = _this.oldHashTime < 1 ? 1 : _this.oldHashTime
      $(data).each(function(i,e){
        var h = parseFloat(e[7]);
       h=h / parseFloat(_this.hashRate);
       if (h > 10000) {
         h=1;
       }
       h=Math.ceil(h*128)%128;
        if ((h==NaN) || h<1|| h>256){
          h=1;
        }
        _this.hashHistory.push(h);
      })
    }
  });
  this.oldHashTime = _this.oldHashTime;
   this.moonDistance = Math.round((_this.hashRate / _this.hashHistory[_this.hashHistory.length-2])*12)%12;
   this.hashHistory = _this.hashHistory;
}

dogeChain.doBlockCount = function(){
  var url =   "api.php?request=getblockcount";
  var _this = this;
  this.oldBlockCount = _this.blockCount;

  $.ajax({
    url:url,
    dataType: "json",
    success: function(data){
      _this.blockCount = data;
    }
  })  
  this.blockCount = _this.blockCount;
  this.blockCountArray = $(this.blockCount.toString().split("")).map(function(i,e){return parseInt(e)}).toArray();
}
dogeChain.doDifficulty = function(){
  var url =   "api.php?request=getdifficulty";
  var _this = this;
  $.ajax({
    url:url,
    dataType: "json",
    success:function(data){
      _this.difficulty = Math.round(data);
    }
  })  
  this.difficulty = _this.difficulty;
  this.difficultyArray = $(this.difficulty.toString().split("")).map(function(i,e){return parseInt(e)}).toArray();
}
dogeChain.doTransactions = function(){
  var url =   "api.php?request=transactions";
  $.ajax({
    url:url,
    dataType: "json",
    success:function(data){
      this.transactions = data;
    }
  })
}
