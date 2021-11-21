export default function bindTouch(bar, container, cb) {
  if (!bar || !container) return

  let containerH = container.clientHeight
  let { transition } = container.style

  // eslint-disable-next-line no-unused-vars
  let startX = 0
  let startY = 0
  let startTime = 0

  let speed = 0

  bar.addEventListener('touchstart', (ev) => {
    ev.preventDefault()
    const { pageX, pageY } = ev.changedTouches[0] || ev

    startX = pageX
    startY = pageY
    startTime = ev.timeStamp

    transition = container.style.transition
    containerH = container.clientHeight
  })

  bar.addEventListener('touchmove', (ev) => {
    ev.preventDefault()
    const { pageY } = ev.changedTouches[0] || ev
    const moveDis = Math.max(0, pageY - startY)

    container.style.transition = ''
    container.style.transform = `translateY(${moveDis}px)`
  })

  bar.addEventListener('touchend', (ev) => {
    ev.preventDefault()
    const { pageY } = ev.changedTouches[0] || ev
    const moveDis = pageY - startY
    const duration = ev.timeStamp - startTime

    speed = moveDis / duration
    container.style.transition = transition

    if (moveDis > containerH / 2 || speed > 1) {
      cb && cb({ moveDis, speed })
    } else {
      container.style.transform = 'translateY(0%)'
    }
  })
}
