const Wave = require('loading-wave')
const $ = require('jquery')

function loadingWave () {
  const wave = Wave({
    width : 162,
    height: 62,
    n     : 7,
    color : '#959',
  })
  $(wave.el).center()
  document.body.appendChild(wave.el)
  wave.start()
  return wave
}

function killLoadingWave (wave) {
  wave.stop()
  return $(wave.el).hide()
}

module.exports = {
  loadingWave,
  killLoadingWave
}
