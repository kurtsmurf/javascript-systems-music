console.log("It's gonna rain")
const loopStart = 4.0
const loopEnd = 4.8
const rate = 1.002
const audioContext = new AudioContext()
let audioBuffer;

const startLoop = (audioBuffer, pan = 0, rate = 1) => {
  const sourceNode = audioContext.createBufferSource()
  const pannerNode = audioContext.createStereoPanner()

  sourceNode.buffer = audioBuffer
  sourceNode.loop = true
  sourceNode.loopStart = loopStart
  sourceNode.loopEnd = loopEnd
  sourceNode.playbackRate.value = rate
  pannerNode.pan.value = pan

  sourceNode.connect(pannerNode)
  pannerNode.connect(audioContext.destination)
  sourceNode.start(0, loopStart)
}

const startAnimation = () => {
  const element = document.querySelector('.right')
  const loopLength = loopEnd - loopStart
  const factor = 1 / (rate - 1)
  const cycleLength = loopLength * factor

  element.style.animation = `spin ${cycleLength}s linear infinite`
}

const start = (audioBuffer) => {
  document.querySelector('.message').remove()
  startLoop(audioBuffer, -1)
  startLoop(audioBuffer, 1, rate)
  startAnimation()
}

fetch('0001.mp3')
  .then(response => response.arrayBuffer())
  .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
  .then(audioBuffer => {
    document.querySelector('.message').innerText = 'Touch anywhere to begin.'
    document.querySelector('body').onclick = () => start(audioBuffer)
  })
  .catch(e => console.log(e))