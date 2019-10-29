const $ = document.querySelector.bind(document)

const makeSynth = () => {
  const envelope = {
    attack: 0.1,
    release: 4,
    releaseCurve: 'linear'
  }
  const filterEnvelope = {
    baseFrequency: 200,
    octaves: 3,
    release: 9999
  }
  return new Tone.DuoSynth({
    volume: -20,
    harmonicity: 1,
    vibratoRate: 0.1,
    vibratoAmount: 0.1,
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
  
const leftPanner = new Tone.Panner(-0.5)
const rightPanner = new Tone.Panner(0.5)

const EQUALIZER_CENTER_FREQUENCIES = [
  100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250,
  1600, 2000, 2500, 3150, 4000, 5000, 6300, 8000, 10000
]

const equalizer = EQUALIZER_CENTER_FREQUENCIES.map(frequency => {
  const filter = Tone.context.createBiquadFilter()
  filter.type = 'peaking'
  filter.frequency.value = frequency
  filter.Q.value = 4.31
  filter.gain.value = 0
  return filter
})

const echo = new Tone.FeedbackDelay('4n', 0.4)
const delay = Tone.context.createDelay(6.0)
const delayFade = Tone.context.createGain()
delay.delayTime.value = 6.0
delayFade.gain.value = 0.75

leftSynth.connect(leftPanner)
rightSynth.connect(rightPanner)

leftPanner.connect(equalizer[0])
rightPanner.connect(equalizer[0])

equalizer.forEach((eqBand, index) => {
  if (index < equalizer.length - 1) {
    eqBand.connect(equalizer[index + 1])
  } else {
    eqBand.connect(echo)
  }
})

echo.toMaster()
echo.connect(delay)
delay.connect(Tone.context.destination)
delay.connect(delayFade)
delayFade.connect(delay)

const startItUp = () => {
  Tone.context.resume()

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
  console.log(leftSynth)
  console.log(rightSynth)
  startButton.disabled = true
}

const initEqualizerUI = (container, equalizer) => {
  console.log(container)
  equalizer.forEach(equalizerBand => {
    const frequency = equalizerBand.frequency.value

    const wrapper = document.createElement('div')
    const slider = document.createElement('input')
    slider.type = 'range'
    slider.min = -12
    slider.max = 12
    slider.value = 0
    slider.step = 0.1
    slider.onchange = event => {
      let gain = +event.target.value
      console.log(gain)
      equalizerBand.gain.value = gain
    }
    const label = document.createElement('label')
    label.innerText = frequency >= 1000 ? `${frequency / 1000}K` : frequency

    wrapper.classList.add('slider-wrapper')
    slider.classList.add('slider')

    wrapper.appendChild(slider)
    wrapper.appendChild(label)
    container.appendChild(wrapper)
  })
}

initEqualizerUI($('.eq'), equalizer)