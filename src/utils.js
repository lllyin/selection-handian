export function hasMobileUA() {
  var nav = window.navigator
  var ua = nav.userAgent
  var pa =
    /iPad|iPhone|Android|Opera Mini|BlackBerry|webOS|UCWEB|Blazer|PSP|IEMobile|Symbian/g
  return pa.test(ua)
}

export function isTablet() {
  return window.screen.width > 767 && hasMobileUA()
}

export function isMobile() {
  return window.screen.width < 767 && hasMobileUA()
}

export function getPlatform() {
  let platform = 'pc'
  if (isMobile()) {
    platform = 'mobile'
  } else if (isTablet()) {
    platform = 'tablet'
  }

  return platform
}

export function tapStyles(el, styles) {
  if (!el || !styles) return
  const els = Array.isArray(el) ? el : [el]

  els.forEach((node) => {
    Object.keys(styles).forEach((key) => {
      node.style[key] = styles[key]
    })
  })

  return el
}
