// Original C-major lullaby, 16 bars of 4/4 at 76 BPM. Nulls let bells ring.
// The second eight bars answer the first phrase; the final G leads back to C.
const bgmMelody=[
  [72,76,79,null],[81,79,76,null],[77,76,74,72],[74,79,71,null],
  [72,76,79,76],[77,81,79,null],[76,74,72,74],[71,74,79,null],
  [76,79,84,null],[83,79,76,null],[81,77,76,72],[74,77,79,null],
  [79,76,72,76],[77,74,72,null],[76,72,74,71],[72,null,67,null]
];
const bgmChords=[
  [48,55,64],[45,52,60],[53,60,65],[43,55,62],
  [48,55,64],[53,60,65],[48,55,64],[43,55,62],
  [48,55,64],[45,52,60],[53,60,65],[43,55,62],
  [48,55,64],[53,60,65],[43,55,62],[48,55,64]
];
let bgmEnabled=store.get('music',true)!==false;
let bgmUnlocked=false,bgmWanted=true,bgmRunning=false,bgmDucked=false;
let bgmTimer=null,bgmMaster,bgmFilter,bgmContext,bgmNextTime=0,bgmStep=0;
const bgmVoices=new Set(),bgmBeat=60/76,bgmVolume=.065;

function bgmDuck(on){
  bgmDucked=!!on;
  if(bgmMaster){
    const t=bgmContext.currentTime;
    bgmMaster.gain.cancelScheduledValues(t);
    bgmMaster.gain.setTargetAtTime(bgmVolume*(bgmDucked?.4:1),t,.04);
  }
}

function bgmBell(midi,time,volume){
  const ctx=bgmContext,envelope=ctx.createGain();
  envelope.gain.setValueAtTime(.0001,time);
  envelope.gain.exponentialRampToValueAtTime(volume,time+.012);
  envelope.gain.exponentialRampToValueAtTime(.0001,time+1.2);
  envelope.connect(bgmFilter);
  const oscillators=[];
  // Mono mix: fundamental with soft second and third harmonics, no panning.
  [1,.16,.055].forEach((level,i)=>{
    const oscillator=ctx.createOscillator(),harmonic=ctx.createGain();
    oscillator.type='sine';
    oscillator.frequency.value=440*Math.pow(2,(midi-69)/12)*(i+1);
    harmonic.gain.value=level;
    oscillator.connect(harmonic).connect(envelope);
    oscillator.onended=()=>{
      oscillator.disconnect();harmonic.disconnect();
      oscillators.splice(oscillators.indexOf(oscillator),1);
      if(!oscillators.length){envelope.disconnect();bgmVoices.delete(voice)}
    };
    oscillators.push(oscillator);
    oscillator.start(time);oscillator.stop(time+1.25);
  });
  const voice={envelope,oscillators};
  bgmVoices.add(voice);
}

function bgmSchedule(){
  if(!bgmRunning)return;
  const now=bgmContext.currentTime;
  // A delayed timer skips missed beats instead of playing a burst of notes.
  if(bgmNextTime<now){
    const missed=Math.ceil((now-bgmNextTime)/bgmBeat);
    bgmStep=(bgmStep+missed)%64;bgmNextTime+=missed*bgmBeat;
  }
  while(bgmNextTime<now+.2){
    const bar=Math.floor(bgmStep/4),beat=bgmStep%4;
    const note=bgmMelody[bar][beat];
    if(note!==null)bgmBell(note,bgmNextTime,.65);
    if(beat%2===0){
      const chord=bgmChords[bar];
      bgmBell(chord[beat===0?0:1],bgmNextTime,.22);
      bgmBell(chord[2],bgmNextTime,.14);
    }
    bgmStep=(bgmStep+1)%64;bgmNextTime+=bgmBeat;
  }
  // Deadlines follow AudioContext time; the timeout only wakes the scheduler.
  bgmTimer=setTimeout(bgmSchedule,25);
}

function bgmPause(){
  bgmRunning=false;clearTimeout(bgmTimer);bgmTimer=null;
  if(!bgmContext)return;
  const t=bgmContext.currentTime;
  // Revisit any beat scheduled ahead but not yet heard when resuming.
  if(bgmNextTime-t>bgmBeat)bgmStep=(bgmStep+63)%64;
  bgmNextTime=0;
  for(const voice of bgmVoices){
    voice.envelope.gain.cancelScheduledValues(t);
    voice.envelope.gain.setTargetAtTime(.0001,t,.005);
    for(const oscillator of voice.oscillators)oscillator.stop(t+.03);
  }
}

function bgmStart(){
  bgmWanted=true;
  if(!bgmUnlocked||!bgmEnabled||!soundOn||document.hidden||bgmRunning)return;
  try{
    bgmContext=getAudioContext();
    if(bgmContext.state==='suspended'){
      bgmContext.resume().then(()=>{
        if(bgmWanted&&bgmContext.state==='running')bgmStart();
      }).catch(()=>{});
      return;
    }
    if(bgmContext.state!=='running')return;
    if(!bgmMaster){
      bgmMaster=bgmContext.createGain();bgmFilter=bgmContext.createBiquadFilter();
      bgmFilter.type='lowpass';bgmFilter.frequency.value=3200;bgmFilter.Q.value=.5;
      bgmFilter.connect(bgmMaster).connect(bgmContext.destination);
      bgmMaster.gain.value=bgmVolume*(bgmDucked?.4:1);
    }
    bgmRunning=true;bgmNextTime=bgmContext.currentTime+.04;bgmSchedule();
  }catch(e){} // Audio unavailable: the game remains playable.
}

function bgmStop(){bgmWanted=false;bgmPause();bgmStep=0}
function bgmSetEnabled(enabled){
  bgmEnabled=!!enabled;store.set('music',bgmEnabled);
  if(bgmEnabled)bgmStart();else bgmStop();
}

// Keep retrying on gestures if a browser suspends audio or rejects resume().
function bgmGesture(event){
  if(event.isTrusted===false)return;
  bgmUnlocked=true;
  if(bgmWanted)bgmStart();
}
document.addEventListener('pointerdown',bgmGesture,{passive:true});
document.addEventListener('click',bgmGesture,{passive:true});
document.addEventListener('keydown',bgmGesture);
document.addEventListener('visibilitychange',()=>{
  if(document.hidden)bgmPause();else if(bgmWanted)bgmStart();
});
