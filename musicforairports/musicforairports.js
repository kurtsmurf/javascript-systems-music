console.log('blerp m\'gerp!')

const SAMPLE_LIBRARY = {
  'Cello': [
    { note: 'B',  octave: 3, file: 'Samples/Cello/CelloEns_susvib_B3_v1_1.wav' },
    { note: 'B',  octave: 1, file: 'Samples/Cello/CelloEns_susvib_B1_v1_1.wav' },
    { note: 'C',  octave: 1, file: 'Samples/Cello/CelloEns_susvib_C1_v1_1.wav' },
    { note: 'C',  octave: 3, file: 'Samples/Cello/CelloEns_susvib_C3_v1_1.wav' },
    { note: 'D',  octave: 2, file: 'Samples/Cello/CelloEns_susvib_D2_v1_1.wav' },
    { note: 'E',  octave: 1, file: 'Samples/Cello/CelloEns_susvib_E1_v1_1.wav' },
    { note: 'F',  octave: 2, file: 'Samples/Cello/CelloEns_susvib_F2_v1_1.wav' },
    { note: 'G',  octave: 1, file: 'Samples/Cello/CelloEns_susvib_G1_v1_1.wav' },
  ]
};

const flatToSharp = (note) => {
  switch (note) {
    case 'Bb': return 'A#';
    case 'Db': return 'C#';
    case 'Eb': return 'D#';
    case 'Gb': return 'F#';
    case 'Ab': return 'G#';
    default:   return note;
  }
}

const OCTAVE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const noteValue = (note, octave) => {
  return octave * 12 + OCTAVE.indexOf(note)
}

const getNoteDistance = (note1, octave1, note2, ocatve2) => {
  return noteValue(note1, octave1) - noteValue(note2, ocatve2)
}

const getNearestSample = (sampleBank, note, octave) => {
  let sortedBank = sampleBank.slice().sort((sampleA, sampleB) => {
    let distanceToA =
      Math.abs(getNoteDistance(note, octave, sampleA.note, sampleA.octave))
    let distanceToB =
      Math.abs(getNoteDistance(note, octave, sampleB.note, sampleB.octave))
    return distanceToA - distanceToB
  })
  return sortedBank[0]
}

let audioContext = new AudioContext();

const fetchSample = (path) => {
  return fetch(encodeURIComponent(path))
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
}

const cachedBuffers = {}

const getSample = (instrument, noteAndOctave) => {
  let [, requestedNote, requestedOctave] = /^(\w[b#]?)(\d)$/.exec(noteAndOctave)
  requestedOctave = parseInt(requestedOctave, 10)
  requestedNote = flatToSharp(requestedNote)
  let sampleBank = SAMPLE_LIBRARY[instrument]
  let sample = getNearestSample(sampleBank, requestedNote, requestedOctave)
  let distance = 
    getNoteDistance(requestedNote, requestedOctave, sample.note, sample.octave)

  if (cachedBuffers[sample.file]) {
    return Promise.resolve({
      audioBuffer: cachedBuffers[sample.file],
      distance: distance
    })
  }

  return fetchSample(sample.file).then(audioBuffer => {
    cachedBuffers[sample.file] = audioBuffer
    return {
      audioBuffer: audioBuffer,
      distance: distance
    }
  })
}

const playSample = (instrument, note, destination) => {
  getSample(instrument, note).then(({audioBuffer, distance}) => {
    let playbackRate = Math.pow(2, distance / 12)
    let bufferSource = audioContext.createBufferSource()
    let stereoPannerNode = audioContext.createStereoPanner()

    bufferSource.buffer = audioBuffer
    bufferSource.playbackRate.value = playbackRate
    stereoPannerNode.pan.value = Math.random() * 2 - 1

    bufferSource.connect(stereoPannerNode)
    stereoPannerNode.connect(destination)
    destination.connect(audioContext.destination)
    bufferSource.start()
  })
}

const randomLength = () => {
  return Math.random() * 30 + 5
}

const startLoop = (instrument, note, destination, loopLengthSeconds = randomLength()) => {
  // playSample(instrument, note)
  setInterval(() => playSample(instrument, note, destination), loopLengthSeconds * 1000)
}

const start = (convolverBuffer) => {
  console.log('blerp')
  document.querySelector('.message').remove()
  let convolver = audioContext.createConvolver()
  convolver.buffer = convolverBuffer
  convolver.connect(audioContext.destination)

  startLoop('Cello', 'F2', convolver)
  startLoop('Cello', 'F2', convolver)
  startLoop('Cello', 'Ab2', convolver)
  startLoop('Cello', 'C3', convolver)
  startLoop('Cello', 'Db3', convolver)
  startLoop('Cello', 'Eb3', convolver)
  startLoop('Cello', 'F3', convolver)
  startLoop('Cello', 'Ab3', convolver)
}

fetchSample('Samples/Impulses/AirportTerminal.wav').then(convolverBuffer => {
  document.querySelector('.message').innerText = 'Touch anywhere to begin. Loop may take up to 30 seconds to start after touch.'
  document.querySelector('body').onclick = () => start(convolverBuffer)
}).catch(e => console.log(e))