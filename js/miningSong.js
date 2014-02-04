var isPlaying = true;
var MOON = 100000000000;
var step=0;
var instep = 0;
var tempo = 108;
var ln2 = Math.log(2);
var ln1 = Math.log(1.5);

var masterVolume = 1;

var themes = {};
themes["minimal"] = function(i,t,c){
  var note,note2,vol,sm;
  if (!isPlaying){
    return false;
  }
  var now = new Date().getTime();
  var smm = dogeChain.blockCountArray[(1+(Math.floor(2*(now - dogeChain.startTime) / (dogeChain.oldHashTime*1000))))%dogeChain.blockCountArray.length];
  sm = (7*(step % smm))%12;
  note = 12+sm+(((i *7)%84)+ t)%104;
  note2 = 12+ sm+(((i *7)%84)+ t + dogeChain.harmonize)%104;
  vol = 32*Math.abs((128-i)/(note+12))* MIDI.channelVolumes[c] * masterVolume;
  vol = vol * (3+dogeChain.hashRateArray[step%dogeChain.hashRateArray.length])/6;
  if (vol > 256) { vol = 256 } 
  MIDI.noteOn(c,note, vol, 0/1000);
  dogeChain.runningNote = MIDI.noteOn(c,note, vol, 0/1000);
  if (c < 6){
    dogeChain.lastNote[c] = note;
  }
}
themes["minimal_choir"] = function(i,t,c){
  var octave = ((instep+c)%3)*12, note,note2,vol,sm;
  if (!isPlaying){
    return false;
  }
  var now = new Date().getTime();
  var smm = dogeChain.blockCountArray.wrapAt((1+(Math.floor(2*(now - dogeChain.startTime) / (dogeChain.oldHashTime*1000)))));
  sm = (7*(step % smm))%12;
  note = 12+octave+ sm +(((i *[7,5][i%2])%49)+ t);
  note2 = 12+octave+ sm+(((i *[7,5][i%2])%49)+ t + dogeChain.harmonize);
  vol = 16*Math.abs((128-i)/(note+24))* MIDI.channelVolumes[c] * masterVolume;
  if (vol > 256) { vol = 256 } 

  MIDI.noteOn(c,note, vol, 0);
  MIDI.noteOn(c,note2, vol, 0);
  if (c < 6){
    dogeChain.lastNote[c] = note;
  }
}


var noteTheme  = themes["minimal"];

var Step = function(){
  step++;
}

var CheckStats = function(){
  if (!allLoaded && instep > 0){
    loadAll();
  }
  dogeChain.startTime = new Date().getTime();
  dogeChain.doTotalCoins();
  dogeChain.doHashRate();
  dogeChain.doBlockCount();
  if (dogeChain.blockCount != dogeChain.oldBlockCount) {
    NewBlock();
  }
  dogeChain.doDifficulty();
  dogeChain.doHashHistory();
  dogeChain.moonDistance = Math.round((dogeChain.hashRate / dogeChain.oldHashRate) * 12)%12
 // dogeChain.dur = parseInt(dogeChain.hashRate.toString().split("")[0])
  var insts = (729+(dogeChain.blockCount%729)).toString(3).split("");
    MIDI.programChange(0, [0,46][parseInt(insts[4])%2]); 
    MIDI.programChange(1, [45,53,11][parseInt(insts[3])]);
    MIDI.programChange(2, [46,45][parseInt(insts[2])%2]);
    MIDI.programChange(3, [46,4,11][parseInt(insts[1])]);
    MIDI.programChange(4, [46,11,0][parseInt(insts[5])]);
    MIDI.programChange(8, [45,11][parseInt(insts[0])%2]);
    vols = (256+(dogeChain.blockCount%256)).toString(2).split("");
    $(vols.slice(-8)).each(function(i,e){
      var vs =  {0: 1.5, 1: 1, 2: 0.5, 3: 1, 4: 1, 5: 0.8, 6: 0.8, 7: 2, 8: 1, 9: 0.5, 10: 0.5};
      MIDI.channelVolumes[i+2] = parseInt(e) * vs[i+2];
    })
    MIDI.channelVolumes[0] = 1.5
  
  //dogeChain.dur = 0.75;
  if (dogeChain.hashRate  > dogeChain.oldHashRate) {
    dogeChain.harmonize = 7
  } else {
    dogeChain.harmonize = 5;
  }
  
  clearInterval(timer);
  timer = setInterval(Notes,tempo);
  var lh = Math.ceil(Math.log(dogeChain.hashRate) / ln2)
  setTimeout(CheckStats,tempo*lh*dogeChain.hashRateArray.length)
}

var TotalCoins = function(){
  var tc = dogeChain.totalCoinsArray;
  var tz = parseInt(tc[0]);
  var tl = tc.length;
  tc = tc.wrapAt(step);
  noteTheme(parseInt(tc),24+dogeChain.moonDistance,0);
  noteTheme((Math.ceil(step/tz)%(tl*tz)),24+dogeChain.moonDistance,1);
  NotesCallback("totalCoins",parseInt(tc));
  
}

var HashRate = function(){
  var tc = dogeChain.hashRateArray;
  var tz = parseInt(tc[0]);
  var tl = tc.length;
  tc = tc.wrapAt(step)
  noteTheme(parseInt(tc),24+dogeChain.moonDistance,2);
  noteTheme((Math.ceil(step/tz)%(tl*tz)),36+dogeChain.moonDistance,3);
  NotesCallback("hashRate",parseInt(tc));
}

var BlockCount = function(){
  var tcc = dogeChain.blockCountArray;
  var tz = parseInt(tcc[0]);
  var tc;
  var tl = tcc.length;
  var tx = tcc[Math.ceil(Math.log(this.difficulty))%tl]
  tc = tcc.wrapAt(step)
  noteTheme(parseInt(tc),24+dogeChain.moonDistance,4);
  NotesCallback("blockCount",parseInt(tc));
  
  if (((step%(tl*tl))||(step%((tl*tl)+tl)==0))){
    themes["minimal_choir"]((tcc[Math.ceil(step/(tl*tl))%tl]),12+dogeChain.moonDistance,5);
    themes["minimal_choir"]((tcc[Math.ceil(step/(tl*tl))%tl]),12+dogeChain.moonDistance,9);
    themes["minimal_choir"]((tcc[(instep+Math.ceil(step/(tl*tl)))%tl]),12+dogeChain.moonDistance,6);
    themes["minimal_choir"]((tcc[(instep+Math.ceil(step/(tl*tl)))%tl]),12+dogeChain.moonDistance,10);
    setTimeout(function(){themes["minimal_choir"]((tcc[Math.ceil(step/(tl*tl))%tl]),12+dogeChain.moonDistance,5)},tempo*Math.floor(tl*tl*0.5));
setTimeout(function(){themes["minimal_choir"]((tcc[Math.ceil(step/(tl*tl))%tl]),12+dogeChain.moonDistance,9)},tempo*Math.floor(tl*tl*0.5));
setTimeout(function(){    themes["minimal_choir"]((tcc[(instep+Math.ceil(step/(tl*tl)))%tl]),12+dogeChain.moonDistance,6)},tempo*Math.floor(tl*tl*0.5))
setTimeout(function(){    themes["minimal_choir"]((tcc[(instep+Math.ceil(step/(tl*tl)))%tl]),12+dogeChain.moonDistance,10)},tempo*Math.floor(tl*tl*0.5))

  }
}
var NewBlock = function(){
  dogeChain.oldBlockCount = dogeChain.blockCount
  AnimateBars();
  step = 0;
  instep++;
}
var NotesCallback = function(n,i){};
var Notes = function(){
  var sh = Math.floor(step / dogeChain.blockCount);
  var bl = dogeChain.blockCountArray;
  var bbl = bl.wrapAt(sh);
  var pct = dogeChain.totalCoins/ MOON;
  if (dogeChain.blockCount != dogeChain.oldBlockCount) {
    NewBlock();
  }

  base = Math.floor(pct * 4);
  if (base < 2) { base =2 }

  var ins = Number(step).toString(base).split("");
  if (ins.wrapAt(step)=="1"){
    TotalCoins();
  }
  var ins = Number(step%Math.pow(2,bl.length)).toString(base).split("");
  if (ins.wrapAt(step)=="1"){
    BlockCount();
  }

  base = Math.floor(pct * 5);
  if (base < 2) { base =2 }
  var ins = Number(step).toString(base).split("");
  if (ins.wrapAt(step)=="1"){
    HashRate();
  }

  base = Math.floor(pct * 6);
  if (base < 2) { base =2 }
  var ins = Number(step%Math.pow(2,12)).toString(base).split("");
  if (ins.wrapAt(step)=="1"){
    noteTheme(dogeChain.hashHistory[step%32],dogeChain.moonDistance,8)
  }

  var ins = Number(step).toString(base).split("");
  var inz = ins.length*4;
  if ((step%inz)==0){
    noteTheme(0,dogeChain.moonDistance+12,7)
  }
  
  if (step%(inz*parseInt(dogeChain.totalCoins.toString().split("")[instep%4]))==0){
    noteTheme(1,dogeChain.moonDistance+19,7)
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
      MIDI.programChange(5, 52);
      MIDI.programChange(6, 52);
      MIDI.programChange(9, 53);
      MIDI.programChange(10, 53);
      MIDI.programChange(7, 116);//[116]
      MIDI.programChange(8, 0);//[45,11]
      //first two always on, everything else * (dogeChain.blockCount%256).toString(2)
      MIDI.channelVolumes =  {0: 0.5, 1: 0.5, 2: 0.5, 3: 0.5, 4: 0.5, 5: 0.5, 6: 0.5, 7: 0.5, 8: 1, 9: 0.5, 10: 0.5}
      CheckStats();
    }
  });  
};

var loadAll = function(){
  allLoaded = true;
  MIDI.loadPlugin({
    instruments: [ "acoustic_grand_piano","vibraphone","orchestral_harp","voice_oohs", "taiko_drum","choir_aahs","pizzicato_strings","electric_piano_2"],
    callback: function() {
      MIDI.loader.stop(); 
    }
    })
};