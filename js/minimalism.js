var isPlaying = true;
var MOON = 100000000000;
var step=0;
var instep = 0;
var tempo = 108;
var ln2 = Math.log(2);
var ln1 = Math.log(1.5);
var ia = [0];
var debug ={}
var masterVolume = 1;
var scales = [[0,2,4,7,9,11],[2,5,7,9,12],[4,7,9,11,12,14],[4,0,-5,-1,2],[-3,-1,0,2,4,7],[-1,0,4,5,7]]
var scale = scales[0];
var themes = {};
themes["minimal"] = function(i,t,c){
  var note,note2,vol,sm;
  if (!isPlaying){
    return false;
  };
  var now = new Date().getTime();
  var sstep;
  var dc = Math.floor(Math.log(dogeChain.difficulty)/Math.log(500));
  var dur = dogeChain.hashRateArray.wrapAt(t+i) + 3;
  var octave = 12;
  var sb = step / dogeChain.blockCountArray.sum();
  var nh = dogeChain.apiData.nethash_full;
  var dh = nh[0].wrapAt(c) / nh.wrapAt((step%nh[0].wrapAt(c).length)+sb).wrapAt(c);
  sstep = 12 * parseFloat(dogeChain.hashRate/nh.wrapAt(sb)[dogeChain.hashPos])   
  sstep = Math.floor(sstep / parseFloat($(nh.wrapAt(Math.floor(step/Math.log(dogeChain.hashRate)))).last()[0]))
  sm = (7*(sstep)%12);
  sm = sm + ((7*Math.ceil(Math.log(dogeChain.apiData.nethash_full.wrapAt(i+c)[1])%3))%12)
  debug.sstep =sstep;
//  octave =(c==7) ? 12 :  12 *(1+((dogeChain.blockCount +c)%3));
 // octave =(c==7) ? 12 :  12*(Math.floor(4*(dogeChain.difficulty / dogeChain.apiData.nethash_full.wrapAt((step%dogeChain.hashRateArray.length)+c+sb)[4]))%4);
  //octave =(c==7) ? 12 :  12+(12*(Math.floor(Math.pow(4,dogeChain.difficulty / dogeChain.apiData.nethash_full.wrapAt(c+sb+(step%dogeChain.hashRateArray.length))[4]))%4));

  octave =(c==7) ? 12 :  12+(12*(Math.floor(Math.pow(4,dh))%4))

  note = octave+dogeChain.offset+(sm+(scale.wrapAt(i)+t)%104);
  note2 = octave+dogeChain.offset+(sm+(scale.wrapAt(i)+t+dogeChain.harmonize)%104);
  vol = 32*Math.abs((128-(i%127))/(note+12));
  vol = vol* MIDI.channelVolumes[c] * masterVolume;

  vol = vol * (3+dogeChain.hashRateArray[step%dogeChain.hashRateArray.length])/6;


  if (vol > 256) { vol = 256 } 
  var out = MIDI.noteOn(c,note, vol, 0);
  dogeChain.runningNote = MIDI.noteOn(c,note2, vol, 0);
  MIDI.noteOff(c,note,dur*tempo/1000);
  MIDI.noteOff(c,note2,dur*tempo/1000);

  if (c < 6){
    dogeChain.lastNote[c] = note;
  }
  return out
}
themes["minimal_choir"] = function(i,t,c){
  var octave = ((instep+c)%3)*12, note,note2,vol,sm;
  if (!isPlaying){
    return false;
  }
  var now = new Date().getTime();
  var sstep;
  var dc = Math.floor(Math.log(dogeChain.difficulty)/Math.log(500));
  var sb = step / dogeChain.blockCountArray.sum()
  sstep = 12 * parseFloat(dogeChain.hashRate/dogeChain.apiData.nethash_full.wrapAt(sb)[dogeChain.hashPos])   
  sstep = Math.floor(sstep / parseFloat($(dogeChain.apiData.nethash_full.wrapAt(Math.floor(step/Math.log(dogeChain.hashRate)))).last()[0]))
  
  sm = ([7,4,5,2].wrapAt(i)*(sstep))%12;
  sm = sm + ((7*Math.ceil(Math.log(dogeChain.apiData.nethash_full.wrapAt(i+c)[1])%3))%12)
  
  octave = 12 *(((dogeChain.blockCount +c)%3));
  note = octave + dogeChain.offset+octave+ sm +scale.wrapAt(i)+ t;
  note2 = octave + dogeChain.offset+octave+ sm+scale.wrapAt(i)+ t + dogeChain.harmonize;
  vol = 16*Math.abs((128-i)/(note+24))* MIDI.channelVolumes[c] * masterVolume;
  if (vol > 256) { vol = 256 } 

  MIDI.noteOn(c,note, vol, 0);
  MIDI.noteOn(c,note2, vol, 0);
  MIDI.noteOff(c,note,((10-dogeChain.hashRateArray.wrapAt(c+sb)))*tempo/1000)
  MIDI.noteOff(c,note2,((10-dogeChain.hashRateArray.wrapAt(c+sb)))*tempo/1000)

  if (c < 6){
    dogeChain.lastNote[c] = note;
  }
}

var noteTheme  = themes["minimal"];

var Step = function(){
  step++;
  dogeChain.interval = Math.pow(2,Math.floor(step / (dogeChain.blockCountArray.sum() *( Math.log(dogeChain.hashRate)/Math.log(10)))));
  dogeChain.updateData();
  dogeChain.doTotalCoins();
  dogeChain.doHashRate();
  dogeChain.doBlockCount();
  dogeChain.doDifficulty();
  dogeChain.doHashHistory();

}
var ShuffleInstruments = function(insts){
  var iar = ia.rotate(dogeChain.blockCount)

  MIDI.programChange(0, [iar.wrapAt(0),iar.wrapAt(1)][parseInt(insts[4])%2]); 
  MIDI.programChange(1, [iar.wrapAt(2),iar.wrapAt(0),iar.wrapAt(3)][parseInt(insts[3])]);
  MIDI.programChange(2, [iar.wrapAt(1),iar.wrapAt(2)][parseInt(insts[2])%2]);
  MIDI.programChange(3, [iar.wrapAt(1),iar.wrapAt(4),iar.wrapAt(3)][parseInt(insts[1])]);
  MIDI.programChange(4, [iar.wrapAt(1),iar.wrapAt(3),iar.wrapAt(0)][parseInt(insts[5])]);
  MIDI.programChange(8, [iar.wrapAt(2),iar.wrapAt(3)][parseInt(insts[0])%2]);
  
}
var CheckStats = function(){
  if (!allLoaded && instep > 0){
    loadAll();
  }
  
  dogeChain.startTime = new Date().getTime();
  dogeChain.getData();

  scale = scales.wrapAt(Math.floor(Math.log(dogeChain.totalCoins / dogeChain.difficulty)/Math.log(10))); 
  
  if (dogeChain.blockCount != dogeChain.oldBlockCount) {
    NewBlock();
  }

  dogeChain.moonDistance = Math.round((dogeChain.hashRate / dogeChain.oldHashRate) * 12)%12
 // dogeChain.dur = parseInt(dogeChain.hashRate.toString().split("")[0])
  var insts = (729+(dogeChain.blockCount%729)).toString(3).split("");
  ShuffleInstruments(insts);
    vols = (256+(dogeChain.blockCount%256)).toString(2).split("");
    $(vols.slice(-8)).each(function(i,e){
      var vs =  {0: 1.5, 1: 1, 2: 0.5, 3: 1, 4: 1, 5: 0.6, 6: 0.7, 7: 2, 8: 1, 9: 0.45, 10: 0.45};
      MIDI.channelVolumes[i+2] = parseInt(e) * vs[i+2];
    })
    MIDI.channelVolumes[0] = 1
  
  //dogeChain.dur = 0.75;
  if (dogeChain.hashRate  > dogeChain.oldHashRate) {
    dogeChain.harmonize = 7
  } else {
    dogeChain.harmonize = 5;
  }
  dogeChain.harmonize = 0;
  
  clearInterval(timer);
  timer = setInterval(Notes,tempo);
  var lh = Math.ceil(Math.log(dogeChain.hashRate) / ln2)
  setTimeout(CheckStats,tempo*lh*dogeChain.hashRateArray.length)
}

var TotalCoins = function(){
  var tc = dogeChain.totalCoinsArray.length+ dogeChain.hashRateArray[0];
  var n1; var n2;
  //block transactions
  n1 =(Math.pow(12 , dogeChain.apiData.nethash_full.wrapAt(step%tc)[4]/dogeChain.difficulty))%12
  n2 =(Math.pow(12 , dogeChain.difficulty/dogeChain.apiData.nethash_full.wrapAt(step%dogeChain.totalCoinsArray.sum())[4]))%12

  noteTheme(parseInt(n1),24+dogeChain.moonDistance,0);
  noteTheme(parseInt(n2),24+dogeChain.moonDistance,1);
  NotesCallback("totalCoins",parseInt(n1));
  
  
}

var HashRate = function(){
  var tc = dogeChain.hashRateArray.length + dogeChain.hashRateArray[0];
  var n1; var n2;
  n1 = Math.ceil(12* dogeChain.apiData.nethash_full.wrapAt(step%tc)[1]/dogeChain.hashRate)%12
  n2 = Math.ceil(12* dogeChain.hashRate/dogeChain.apiData.nethash_full.wrapAt(step%tc)[1])%12
  noteTheme(parseInt(n1),24+dogeChain.moonDistance,2);
  noteTheme(parseInt(n2),36+dogeChain.moonDistance,3);
  NotesCallback("hashRate",parseInt(tc));
}

var BlockCount = function(){
  var tcc = dogeChain.blockCountArray;
  var bc = dogeChain.blockCountArray;
  var tl = tcc.length;
  var tll = tl + dogeChain.difficultyArray[0]
  tc = Math.ceil(12 *dogeChain.apiData.nethash_full.wrapAt(step%tll)[6]  / dogeChain.apiData.nethash_full.wrapAt(0)[6])%12;
  debug.tc = tc
  noteTheme(parseInt(Math.abs(tc)),24+dogeChain.moonDistance,4);
  NotesCallback("blockCount",parseInt(tc));
  var sb = Math.floor(step / bc.sum());
  if ((step%(3+bc.wrapAt(instep)))==0||(step%(3+bc.wrapAt(instep)))==dogeChain.blockCountArray.wrapAt(instep)){
    themes["minimal_choir"]((tcc[Math.ceil(step/(tl*tl))%tl]),12+dogeChain.moonDistance,5);
    themes["minimal_choir"]((tcc[Math.ceil(step/(tl*tl))%tl]),12+dogeChain.moonDistance,9);
    themes["minimal_choir"]((tcc[(instep+Math.ceil(step/(tl*tl)))%tl]),12+dogeChain.moonDistance,6);
    themes["minimal_choir"]((tcc[(instep+Math.ceil(step/(tl*tl)))%tl]),12+dogeChain.moonDistance,10);
    setTimeout(function(){themes["minimal_choir"]((tcc[Math.ceil(step/(tl*tl))%tl]),12+dogeChain.moonDistance,5)},tempo*Math.floor(tl*tl*0.5));
    setTimeout(function(){themes["minimal_choir"]((tcc[Math.ceil(step/(tl*tl))%tl]),12+dogeChain.moonDistance,9)},tempo*Math.floor(tl*tl*0.5));
    setTimeout(function(){themes["minimal_choir"]((tcc[(instep+Math.ceil(step/(tl*tl)))%tl]),12+dogeChain.moonDistance,6)},tempo*Math.floor(tl*tl*0.5))
    setTimeout(function(){themes["minimal_choir"]((tcc[(instep+Math.ceil(step/(tl*tl)))%tl]),12+dogeChain.moonDistance,10)},tempo*Math.floor(tl*tl*0.5))
  }
}
var NewBlock = function(){
  dogeChain.oldBlockCount = dogeChain.blockCount
  AnimateBars();
  step = 0;
  instep++;
}
var NotesCallback = function(n,i){
  
};
var Notes = function(){
  
  if (dogeChain.blockCount != dogeChain.oldBlockCount) {
    NewBlock();
  }
  if (dogeChain.apiData.nethash_full==undefined) {
    //no data yet;
    return false
  }
  var sh = Math.floor(step / dogeChain.blockCount);
  var bl = dogeChain.blockCountArray;
  var bbl = bl.wrapAt(sh);
  var bls = bl.sum();
  var nh = dogeChain.apiData.nethash_full;
  //if hashrate is trending up, this stays fast
  var overUnder = (nh.wrapAt(0)[1] - nh.wrapAt(Math.floor(step/bls))[1]) >= 0;
    debug.overUnder = overUnder;
    debug.sh=sh;
    var pct = dogeChain.totalCoins/ Math.pow(10,Math.ceil(Math.log(dogeChain.totalCoins)/Math.log(10)));
    pct = dogeChain.hashRate/ dogeChain.apiData.nethash_full.wrapAt(Math.floor(step/bls))[dogeChain.hashPos];
    base = Math.floor(pct * 4);
  if (overUnder) {
    if (parseFloat(nh.wrapAt(step%dogeChain.totalCoinsArray.length)[4]) < parseFloat(nh.wrapAt((step+1)%dogeChain.totalCoinsArray.length)[4])){
      TotalCoins();
    }
    if (parseFloat(nh.wrapAt(step%dogeChain.blockCountArray.length)[6]) < parseFloat(nh.wrapAt((step+1)%dogeChain.blockCountArray.length)[6])){
      BlockCount();
    }
    if (parseFloat(nh.wrapAt(step%dogeChain.hashRateArray.length)[1]) < parseFloat(nh.wrapAt((step+1)%dogeChain.hashRateArray.length)[1])){
      HashRate();
    }
    
  } else {  
    if (parseFloat(nh.wrapAt(step%dogeChain.totalCoinsArray.length)[4]) > parseFloat(nh.wrapAt((step+1)%dogeChain.totalCoinsArray.length)[4])){
      TotalCoins();
    }
    if (parseFloat(nh.wrapAt(step%dogeChain.blockCountArray.length)[6]) > parseFloat(nh.wrapAt((step+1)%dogeChain.blockCountArray.length)[6])){
      BlockCount();
    }
    if (parseFloat(nh.wrapAt(step%dogeChain.hashRateArray.length)[1]) > parseFloat(nh.wrapAt((step+1)%dogeChain.hashRateArray.length)[1])){
      HashRate();
    }
  }
  

  base = Math.floor(pct * 6);
  if (base < 2) { base =2 }
  if (base > 12) { base =12 }

  var ins = Number(step%Math.pow(2,12)).toString(base).split("");
  if (ins.wrapAt(step)==1){
    noteTheme(dogeChain.hashHistory.wrapAt(step),dogeChain.moonDistance,8)
  }

  var ins = Number(step).toString(base).split("");
  var inz = ins.length*bls;
  debug.inz = inz
  if ((step%inz)==0){
    var bassy1 = noteTheme(0,dogeChain.moonDistance+12,7);
  }
  
  if (step%(inz*parseInt(dogeChain.totalCoins.toString().split("")[instep%4]))==0){
    var bassy2 = noteTheme(1,dogeChain.moonDistance+19,7)
  }
  Step();
}
var timer = setInterval(function(){},1);
var stepTimer;
var allLoaded = false;
window.onload = function () {
  MIDI.loader = new widgets.Loader;
  MIDI.loadPlugin({
    instruments: [ "acoustic_grand_piano"],
    callback: function() {
      MIDI.loader.stop(); 
      MIDI.programChange(0, 0); //[0,46]
      MIDI.programChange(1, 0);//[52,46]
      MIDI.programChange(2, 0);//[46,45]
      MIDI.programChange(3, 0);//[46,52,11]
      MIDI.programChange(4, 0);//[46,11,0]
      MIDI.programChange(5, 0);
      MIDI.programChange(6, 0);
      MIDI.programChange(9, 0);
      MIDI.programChange(10, 0);
      MIDI.programChange(7, 116);//[116]
      MIDI.programChange(8, 0);//[45,11]
      //first two always on, everything else * (dogeChain.blockCount%256).toString(2)
      MIDI.channelVolumes =  {0: 0.5, 1: 0.5, 2: 0.5, 3: 0.5, 4: 0.5, 5: 0.5, 6: 0.5, 7: 0.5, 8: 1, 9: 0.5, 10: 0.5}
      CheckStats();
    }
  });  
};
var SwitchCoin = function(coin){
  var coinProfiles={
    "doge":function(){
      ia = [0,46,45,11,5];
      MIDI.loadPlugin({
        instruments: [ "acoustic_grand_piano","violin","vibraphone","orchestral_harp","voice_oohs", "taiko_drum","choir_aahs","pizzicato_strings","electric_piano_2"],
        callback: function() {
          MIDI.loader.stop(); 
          MIDI.loader.stop(); 
          MIDI.programChange(0, 1); //[0,46]
          MIDI.programChange(1, 5);//[52,46]
          MIDI.programChange(2, 11);//[46,45]
          MIDI.programChange(3, 14);//[46,52,11]
          MIDI.programChange(4, 5);//[46,11,0]
          MIDI.programChange(5, 40);
          MIDI.programChange(6, 52);
          MIDI.programChange(9, 40);
          MIDI.programChange(10, 52);
          MIDI.programChange(7, 116);//[116]
          MIDI.programChange(8, 45);//[45,
          dogeChain.coin = coin;
          CheckStats();
          dogeChain.startTime = new Date().getTime();
          dogeChain.getData();

          var insts = (729+(dogeChain.blockCount%729)).toString(3).split("");
          ShuffleInstruments(insts);
        }
      });
    },
    "uno":function(){
      ia = [24,11,4,114,117];
      MIDI.loadPlugin({
        instruments: [ "acoustic_guitar_nylon","blown_bottle","timpani","vibraphone","electric_piano_1","steel_drums","melodic_tom"],
        callback: function() {
          MIDI.loader.stop(); 
          MIDI.programChange(0, 24); //[0,46]
          MIDI.programChange(1, 117);//[52,46]
          MIDI.programChange(2, 11);//[46,45]
          MIDI.programChange(3, 114);//[46,52,11]
          MIDI.programChange(4, 4);//[46,11,0]
          MIDI.programChange(5, 76);
          MIDI.programChange(6, 76);
          MIDI.programChange(9, 76);
          MIDI.programChange(10, 76);
          MIDI.programChange(7, 47);//[116]
          MIDI.programChange(8, 117);//[45,
          dogeChain.coin = coin;
          CheckStats();
          dogeChain.startTime = new Date().getTime();
          dogeChain.getData();

          var insts = (729+(dogeChain.blockCount%729)).toString(3).split("");
          ShuffleInstruments(insts);
        }
      });
    }
  }
  coinProfiles[coin]()
}

var loadAll = function(){
  allLoaded = true;
  ia = [0,46,45,11,5];
  
  MIDI.loadPlugin({
    instruments: [ "acoustic_grand_piano","violin","vibraphone","orchestral_harp","voice_oohs", "taiko_drum","choir_aahs","pizzicato_strings","electric_piano_2"],
    callback: function() {
      MIDI.loader.stop(); 
      MIDI.programChange(0, 0); //[0,46]
      MIDI.programChange(1, 45);//[52,46]
      MIDI.programChange(2, 11);//[46,45]
      MIDI.programChange(3, 14);//[46,52,11]
      MIDI.programChange(4, 4);//[46,11,0]
      MIDI.programChange(5, 40);
      MIDI.programChange(6, 52);
      MIDI.programChange(9, 40);
      MIDI.programChange(10, 52);
      MIDI.programChange(7, 116);//[116]
      MIDI.programChange(8, 45);//[45,
      CheckStats();
    }
    })
};