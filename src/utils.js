export function hasMobileUA() {
  const nav = window.navigator
  const ua = nav.userAgent
  const pa =
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
  if (!el || !styles) return void 0
  const els = Array.isArray(el) ? el : [el]

  els.forEach((node) => {
    Object.keys(styles).forEach((key) => {
      node.style[key] = styles[key]
    })
  })

  return el
}

// 修剪文字
export function trim(text) {
  const text2 = String(text)
    .trim()
    .replace(/([。，！～【】()（）])|(\d)|(\s*)/gi, '')
    .replace(/[a-zA-Z]/g, '')
  const cnReg = /[^\u0000-\u00FF]/

  return cnReg.test(text2) ? text2 : ''
}
