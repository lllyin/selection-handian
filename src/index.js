import {
  EVENT_NAMES,
  DEFAULT_OPTIONS,
  CLOSE_ICON,
  MOBILE,
  TABLET,
} from './constants'
import bingTouch from './bingTouch'
import styles from './styles'
import { getPlatform, isMobile, tapStyles } from './utils'

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
      iframe.frameBorder = '0'
      iframe.sandbox = 'allow-same-origin allow-forms'
      iframe.seamless = 'seamless'

      tapStyles(iframe, {
        width: '0px',
        height: '0px',
        overflow: 'hidden',
        opacity: 0,
      })

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

      button.innerText = '典'
      button.title = '查汉典'

      tapStyles(button, {
        position: 'absolute',
        left: 0,
        top: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '32px',
        height: '32px',
        borderRadius: '3px',
        backgroundColor: '#f5f5f5',
        fontFamily: 'STSong, STFangSong',
        fontWeight: 500,
        color: '#9d6a51',
        cursor: 'pointer',
        zIndex: '1200',
        fontSize: '18px',
        userSelect: 'none',
      })

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

    tapStyles(div, {
      position: 'fixed',
      visibility: 'hidden',
      left: 0,
      top: 0,
      width: '100%',
      height: '100%',
      zIndex: -1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      '-webkit-tap-highlight-color': 'transparent',
      opacity: 0,
      transition: 'opacity 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
    })

    this.options.container.appendChild(div)
    this.mask = div
  }

  // 创建浮窗
  _createPopup() {
    const div = document.createElement('div')
    div.setAttribute('class', `ly-popup-cotainer ${this.platform}`)

    tapStyles(div, {
      position: this.isMobile ? 'fixed' : 'absolute',
      display: 'none',
      zIndex: '1201',
      left: 0,
      top: this.isMobile ? '' : '0',
      minWidth: this.isMobile ? '100vw' : '375px',
      minHeight: this.isMobile ? '60vh' : '375px',
      backgroundColor: '#fff',
      boxShadow: 'rgb(0 0 0 / 8%) 1px 2px 13px 0px',
      overflow: 'hidden',
    })

    // 创建bar
    const bar = document.createElement('div')
    bar.setAttribute('class', 'ly-popup-bar')
    // 创建关闭按钮
    const closeBtn = document.createElement('div')
    closeBtn.setAttribute('class', 'ly-popup-close')
    closeBtn.innerHTML = CLOSE_ICON

    const loading = document.createElement('p')
    loading.innerHTML = '加載結果中，請稍候……'
    loading.id = 'handian-loading'
    loading.setAttribute('class', 'handian-loading hide')

    tapStyles(loading, {
      position: 'absolute',
      left: 0,
      top: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: this.isMobile ? '100%' : '20px',
      zIndex: '99',
      textAlign: 'center',
      fontSize: '12px',
      backgroundColor: 'rgba(248, 249, 251, 0.8)',
      color: '#555',
      margin: '0',
      overflow: 'hidden',
    })

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

    this.isMobile &&
      tapStyles(content, {
        width: '100%',
        height: '60vh',
      })

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
      tapStyles([document.documentElement, this.options.container], {
        overflow: 'hidden',
        height: this.isMobile ? '100vh' : '',
        position: this.isMobile ? 'relative' : '',
      })
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
      tapStyles([document.documentElement, this.options.container], {
        overflow: '',
        height: '',
        position: '',
      })
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
