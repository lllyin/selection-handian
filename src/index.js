import {
  EVENT_NAMES,
  DEFAULT_OPTIONS,
  CLOSE_ICON,
  MOBILE,
  TABLET,
} from './constants'
import bingTouch from './bingTouch'
import styles from './styles'
import { getPlatform, isMobile } from './utils'

class SelectionHanDian {
  constructor(options = {}) {
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    }
    this.stopPropagationNodes = []
    this._init()
  }

  getRelativePos = (event) => {
    if ([MOBILE, TABLET].includes(this.platform)) {
      return {
        x: event.changedTouches[0].clientX || 0,
        y: event.changedTouches[0].clientY || 0,
      }
    }
    return {
      x: event.clientX || 0,
      y: event.clientY || 0,
    }
  }

  //  初始化
  _init() {
    this.isMobile = isMobile()
    this.platform = getPlatform()

    this.isMobile && this._createMask()
    this._createPopup()
    this.injectStyles()
    this._bindEvents()
    this._prefetchHanDian()
  }

  // 绑定pc端事件
  _bindEvents() {
    const { container, el, onEnd } = this.options

    window.removeEventListener(EVENT_NAMES[this.platform].START, this.hideAll)
    el.addEventListener('contextmenu', (e) => e.preventDefault())
    el.addEventListener(EVENT_NAMES[this.platform].END, (e) => {
      const selection = window.getSelection()

      if (selection.type === 'Range') {
        const text = selection.toString()
        const trimText = this.trimText(text)

        if (!trimText) return

        this._createButton(event, trimText)

        onEnd(e, trimText, this)

        window.addEventListener(EVENT_NAMES[this.platform].START, this.hideAll)
      }
    })
    this.stopPropagationNodes.forEach((node) => {
      node.addEventListener(EVENT_NAMES[this.platform].START, (e) =>
        e.stopPropagation(),
      )
      node.addEventListener(EVENT_NAMES[this.platform].END, (e) =>
        e.stopPropagation(),
      )
    })
    this.closeBtn?.addEventListener(EVENT_NAMES[this.platform].END, () => {
      this.hidePopup()
    })

    bingTouch(this.bar, this.popup, this.hidePopup)
  }

  // 汉典加速
  _prefetchHanDian() {
    setTimeout(() => {
      const iframe = document.createElement('iframe')
      iframe.src = '//www.zdic.net'

      iframe.width = 0
      iframe.height = 0
      iframe.style.width = '0px'
      iframe.style.height = '0px'
      iframe.style.overflow = 'hidden'
      iframe.style.opacity = '0'
      iframe.frameBorder = '0'
      iframe.sandbox = 'allow-same-origin allow-forms'
      iframe.seamless = 'seamless'

      document.body.appendChild(iframe)
    }, 1000)
  }

  // 创建按钮
  _createButton(event, trimText) {
    let button = document.querySelector('.ly-popup-button')
    const sh =
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0
    const pos = this.getRelativePos(event)
    const left = pos.x
    const top = pos.y + sh

    if (!button) {
      button = document.createElement('div')
      button.setAttribute('class', 'ly-popup-button')

      button.style.position = 'absolute'
      button.style.display = 'block'
      button.style.left = 0
      button.style.top = 0
      button.style.width = '32px'
      button.style.minHeight = '32px'
      button.style.borderRadius = '3px'
      button.style.backgroundColor = '#f5f5f5'
      button.style.fontFamily = 'STSong, STFangSong'
      button.style.fontWeight = 500
      button.style.color = '#9d6a51'
      button.style.cursor = 'pointer'
      button.style.zIndex = '1200'
      button.style.textAlign = 'center'
      button.style.lineHeight = '32px'
      button.style.fontSize = '18px'
      button.style.userSelect = 'none'
      button.innerText = '典'
      button.title = '查汉典'

      button.addEventListener(EVENT_NAMES[this.platform].START, (e) =>
        e.stopPropagation(),
      )
      button.addEventListener(EVENT_NAMES[this.platform].END, (e) =>
        e.stopPropagation(),
      )

      document.body.appendChild(button)
      this.button = button
    }

    this.showButton()

    button.onclick = (e) => {
      e.stopPropagation()
      this.hideButton()
      // 汉典
      const zdic = this._createHanDian(trimText)
      this.popup.appendChild(zdic)

      // 定位容器位置
      this.popup.style.left = `${this.isMobile ? 0 : left}px`
      if (this.isMobile) {
        this.popup.style.left = '0px'
        this.popup.style.bottom = `0px`
        this.popup.style.transform = 'translateY(100%)'
      } else {
        this.popup.style.top = `${top}px`
      }
      this.showPopup()

      const newPosition = this.calcPosition(
        { x: left + this.options.offsetX, y: top + this.options.offsetY },
        this.popup,
      )
      this.callPosition(this.popup, newPosition)
    }

    button.style.transform = `translate(${left}px, ${
      top + this.options.offsetY
    }px)`

    return button
  }

  // 创建mask
  _createMask() {
    const div = document.createElement('div')
    div.setAttribute('class', `ly-popup-mask ${this.platform}`)

    div.style.position = 'fixed'
    div.style.visibility = 'hidden'
    div.style.left = 0
    div.style.top = 0
    div.style.width = '100%'
    div.style.height = '100%'
    div.style.zIndex = 999
    div.style.backgroundColor = 'rgba(0,0,0,0.5)'
    div.style['-webkit-tap-highlight-color'] = 'transparent'
    div.style.opacity = 0
    div.style.transition = 'opacity 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms'

    this.options.container.appendChild(div)
    this.mask = div
  }

  // 创建浮窗
  _createPopup() {
    const div = document.createElement('div')
    div.setAttribute('class', `ly-popup-cotainer ${this.platform}`)

    div.style.position = this.isMobile ? 'fixed' : 'absolute'
    div.style.display = 'none'
    div.style.zIndex = '1201'
    div.style.left = 0
    div.style.top = this.isMobile ? '' : '0'
    div.style.minWidth = this.isMobile ? '100vw' : '375px'
    div.style.minHeight = this.isMobile ? '60vh' : '375px'
    div.style.backgroundColor = '#fff'
    div.style.boxShadow = 'rgb(0 0 0 / 8%) 1px 2px 13px 0px'
    div.style.overflow = this.isMobile ? 'auto' : 'hidden'

    // 创建bar
    const bar = document.createElement('div')
    bar.setAttribute('class', 'ly-popup-bar')
    // 创建关闭按钮
    const closeBtn = document.createElement('div')
    closeBtn.setAttribute('class', 'ly-popup-close')
    closeBtn.innerHTML = CLOSE_ICON

    const loading = document.createElement('p')
    loading.style.position = 'absolute'
    loading.style.left = '0'
    loading.style.top = '0'
    loading.style.display = 'flex'
    loading.style.justifyContent = 'center'
    loading.style.alignItems = 'center'
    loading.style.width = '100%'
    loading.style.height = this.isMobile ? '100%' : '20px'
    loading.style.zIndex = '99'
    loading.style.textAlign = 'center'
    loading.style.fontSize = '12px'
    loading.style.backgroundColor = 'rgba(248, 249, 251, 0.8)'
    loading.style.color = '#555'
    loading.style.margin = '0'
    loading.style.overflow = 'hidden'
    loading.setAttribute('class', 'handian-loading hide')

    loading.innerHTML = '加載結果中，請稍候……'
    loading.id = 'handian-loading'
    div.appendChild(loading)
    this.isMobile && div.appendChild(bar)
    div.appendChild(closeBtn)

    document.body.appendChild(div)
    this.popup = div
    this.loading = loading
    this.bar = bar
    this.closeBtn = closeBtn

    this.stopPropagationNodes.push(bar, closeBtn)
    return div
  }

  _createHanDian(word = '') {
    const previousContent = document.getElementById('handian_content')
    if (previousContent) {
      this.popup.removeChild(previousContent)
    }
    clearTimeout(this._timer)

    // add new content
    const content = document.createElement('iframe')
    content.frameBorder = '0'
    content.src = `https://www.zdic.net/hans/${word}`
    content.sandbox = 'allow-same-origin allow-forms'
    content.seamless = 'seamless'
    content.id = 'handian_content'
    // content.style['display'] = 'none';
    content.width = this.isMobile ? window.innerWidth : '375'
    content.height = this.isMobile ? window.innerHeight * 0.6 : '400'

    console.log('加载汉典', Date.now())
    this.showLoading()
    content.addEventListener('load', () => {
      console.log('汉典加载好了', Date.now())
      this.hideLoading()
    })
    content.addEventListener('error', () => {
      console.log('加载汉典报错', Date.now())
      this.hideLoading()
    })
    if (this.options.MAX_TIME_OUT) {
      this._timer = setTimeout(() => {
        if (this.getLoadingVisible()) {
          console.warn(`汉典加载超过${this.options.MAX_TIME_OUT}ms`)
          this.hideLoading()
        }
      }, this.options.MAX_TIME_OUT)
    }

    return content
  }

  // 修剪文字
  trimText = (text) => {
    const text2 = String(text)
      .trim()
      .replace(/([。，！～【】\(\)（）])|(\d)|(\s*)/gi, '')
      .replace(/[a-zA-Z]/g, '')
    const cnReg = /[^\u0000-\u00FF]/

    return cnReg.test(text2) ? text2 : ''
  }

  // 插入样式
  injectStyles = () => {
    const style = document.createElement('style')

    style.type = 'text/css'
    style.innerHTML = styles

    document.head.appendChild(style)
    return style
  }

  // 计算元素位置
  calcPosition(position, el) {
    if (!position || !el) return
    const { x, y } = position
    const winWidth = Math.max(window.innerWidth, document.body.scrollWidth)
    const winHeight = Math.max(window.innerHeight, document.body.scrollHeight)
    const rect = el.getBoundingClientRect()

    return {
      left: Math.min(x, winWidth - rect.width),
      top: Math.min(y, winHeight - rect.height),
    }
  }

  // 重新适应位置
  callPosition(el, position) {
    if (!position || !el) return

    el.style.transition = 'all 0.35s cubic-bezier(0, 0, 0.2, 1) 0s'

    if (this.isMobile) {
      el.style.transform = `translateY(0px)`
      return
    }

    el.style.left = `${position.left}px`
    el.style.top = `${position.top}px`

    // 修复一下弹窗的完整可见性
    const elBottom = position.top + el.clientHeight
    const scrollTop = this.options.scroller
      ? this.options.scroller.scrollTop
      : Math.max(document.documentElement.scrollTop, document.body.scrollTop)
    const viewBottom = window.innerHeight + scrollTop
    const diffDistance = Math.max(0, elBottom - viewBottom)
    if (diffDistance > 0) {
      const scrollOpts = {
        top: scrollTop + diffDistance,
        behavior: 'smooth',
      }
      if (this.options.scroller) {
        this.options.scroller.scrollTo(scrollOpts)
      } else {
        document.documentElement.scrollTo(scrollOpts)
        document.body.scrollTo(scrollOpts)
      }
    }
  }

  // 获取popup node
  getPopup = () => {
    return this.popup
  }

  // popup是否可见
  getPopupVisible = () => {
    const style = window.getComputedStyle(this.popup)
    return style.display !== 'none'
  }

  // loading是否可见
  getLoadingVisible = () => {
    const loading = document.querySelector('#handian-loading')
    return loading && loading.clientHeight > 0
  }

  // 展示Button
  showButton = () => {
    if (this.button) {
      this.button.style.opacity = 1
      this.button.style.pointerEvents = 'auto'
    }
  }

  // 隐藏button
  hideButton = () => {
    if (this.button) {
      this.button.style.opacity = 0
      this.button.style.pointerEvents = 'none'
    }
  }

  // 展示popup
  showPopup = () => {
    if (this.popup) {
      this.options.container.style.overflow = 'hidden'
      this.popup.style.display = 'block'
      if (this.isMobile) {
        this.mask.style.opacity = 1
        this.mask.style.visibility = 'visible'
        this.mask.style.zIndex = 1200
      }
      clearTimeout(this.popTimer)
    }
  }

  // 隐藏popup
  hidePopup = () => {
    if (this.popup) {
      this.options.container.style.overflow = 'auto'
      if (this.isMobile) {
        this.popup.style.transform = `translateY(100%)`
        this.popTimer = setTimeout(() => {
          this.popup.style.display = 'none'
          this.mask.style.zIndex = -1
        }, 350)
      } else {
        this.popup.style.display = 'none'
      }
    }
    // mask
    if (this.isMobile) {
      this.mask.style.opacity = 0
      this.mask.style.visibility = 'hidden'
    }
  }

  // 展示loading
  showLoading() {
    const loading = document.getElementById('handian-loading')
    if (loading) {
      loading.classList.remove('hide')
    }
  }
  // 隐藏loading
  hideLoading() {
    const loading = document.getElementById('handian-loading')
    if (loading) {
      loading.classList.add('handian-loading', 'hide')
    }
  }

  hideAll = () => {
    this.hideButton()
    this.hidePopup()
  }
}

new SelectionHanDian({
  onEnd: function (event, text, instance) {
    Array.isArray(window.dataLayer) &&
      window.dataLayer.push(
        Object.assign({
          event: 'dianClick',
          selection_text: text,
          platform: instance.platform,
        }),
      )
  },
})

export default SelectionHanDian
