const $ = document.querySelector.bind(document)

const startItUp = () => {
  const makeSynth = () => {
    const envelope = {
      attack: 0.1,
      release: 2,
      releaseCurve: 'linear'
    }
    const filterEnvelope = {
      baseFrequency: 200,
      octaves: 3,
      attack: 0,
      decay: 0,
      release: 9999
    }
    return new Tone.DuoSynth({
      volume: -20,
      harmonicity: 1,
      vibratoRate: 0.1,
      vibratoAmount: 0.2,
      voice0: {
        oscillator: {type: 'sawtooth'},
        envelope,
        filterEnvelope
      },
      voice1: {
        oscillator: {type: 'sine'},
        envelope,
        filterEnvelope
      }
    })
  }
  
  const leftSynth = makeSynth()
  const rightSynth = makeSynth()
  
  leftSynth.vibratoRate.value = 20
  
  const leftPanner = new Tone.Panner(-0.5)
  const rightPanner = new Tone.Panner(0.5)
  
  const echo = new Tone.FeedbackDelay('4n', 0.4)
  const delay = Tone.context.createDelay(6.0)
  const delayFade = Tone.context.createGain()
  
  delay.delayTime.value = 6.0
  delayFade.gain.value = 0.75
  
  leftSynth.connect(leftPanner)
  rightSynth.connect(rightPanner)
  leftPanner.connect(echo)
  rightPanner.connect(echo)
  echo.toMaster()
  echo.connect(delay)
  delay.connect(Tone.context.destination)
  delay.connect(delayFade)
  delayFade.connect(delay)
  
  new Tone.Loop(time => {
    leftSynth.triggerAttackRelease('C5', '1:2', time)
    leftSynth.setNote('D5', '+0:2')
    leftSynth.triggerAttackRelease('E4', '0:2', '+6:0')
    leftSynth.triggerAttackRelease('G4','0:2', '+11:2')
    leftSynth.triggerAttackRelease('E5', '2:0', '+19:0')
    leftSynth.setNote('G5', '+19:1:2')
    leftSynth.setNote('A5', '+19:3:0')
    leftSynth.setNote('G5', '+19:4:2')
  }, '34m').start()
  
  new Tone.Loop(() => {
      rightSynth.triggerAttackRelease('D4', '1:2', '+5:0');
      rightSynth.setNote('E4', '+6:0');
      rightSynth.triggerAttackRelease('B3', '1m', '+11:2:2');
      rightSynth.setNote('G3', '+12:0:2');
      rightSynth.triggerAttackRelease('G4', '0:2', '+23:2');
    }, '37m').start()
  
   Tone.Transport.start()
}



const startButton = $('#start-button')
startButton.onclick = () => {
  console.log('Starting')
  startItUp()
  startButton.disabled = true
}