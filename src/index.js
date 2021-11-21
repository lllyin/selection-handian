import {
  EVENT_NAMES,
  DEFAULT_OPTIONS,
  CLOSE_ICON,
  MOBILE,
  TABLET,
} from './constants'
import bingTouch from './bingTouch'
import styles from './styles'
import { trim, getPlatform, isMobile, tapStyles } from './utils'

class SelectionHanDian {
  constructor(options = {}) {
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    }
    this.stopPropagationNodes = []
    this.state = {}
    this.nodes = {}
    this.init()
  }

  //  初始化
  init() {
    this.state.isMobile = isMobile()
    this.state.platform = getPlatform()

    this.state.isMobile && this.createMask()
    this.createPopup()
    this.injectStyles()
    this.bindEvents()
    this.prefetchHanDian()
  }

  // 绑定pc端事件
  bindEvents() {
    const { el } = this.options

    el.addEventListener('contextmenu', () => {
      this.togglePopup(false)
    })
    el.addEventListener(EVENT_NAMES[this.state.platform].END, (ev) => {
      if (ev.target === this.nodes.button) {
        return
      }
      const selection = window.getSelection()

      if (selection.type === 'Range') {
        const text = selection.toString()
        const trimText = trim(text)

        if (!trimText) return

        this.createButton(ev, trimText, selection)

        this.togglePopup(false)
        this.toggleButton(this.state.trimText === trimText ? void 0 : true)

        // 后置
        this.state.trimText = trimText
      } else {
        this.hideAll()
      }
    })

    this.stopPropagationNodes.forEach((node) => {
      node.addEventListener(EVENT_NAMES[this.state.platform].END, (ev) => {
        ev.stopPropagation()
      })
    })
    this.nodes.closeBtn.addEventListener(
      EVENT_NAMES[this.state.platform].END,
      () => {
        this.hideAll()
      },
    )

    bingTouch(this.nodes.bar, this.nodes.popup, this.hideAll)
  }

  // 创建按钮
  createButton(event, trimText, selection) {
    const { onEnd } = this.options
    const sh =
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0
    const rect = selection.getRangeAt(0).getBoundingClientRect()
    const pos = this.getRelativePos(event)
    const left = Math.min(rect.left + rect.width, pos.x)
    const top = rect.top + rect.height + sh

    if (!this.nodes.button) {
      const button = document.createElement('div')
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

      document.body.appendChild(button)
      this.nodes.button = button
    }

    tapStyles(this.nodes.button, {
      transform: `translate(${left + this.options.offsetX}px, ${
        top + this.options.offsetY / 2
      }px)`,
    })

    this.nodes.button[`on${EVENT_NAMES[this.state.platform].END}`] = () => {
      this.toggleButton(false)
      // 汉典
      const zdic = this.createHanDian(trimText)
      this.nodes.popup.appendChild(zdic)

      // call onEnd API
      onEnd(event, trimText, this)

      // 定位容器位置
      if (this.state.isMobile) {
        tapStyles(this.nodes.popup, {
          left: '0px',
          bottom: '0px',
          transform: 'translateY(100%)',
        })
      } else {
        tapStyles(this.nodes.popup, {
          left: `${left}px`,
          top: `${top + this.options.offsetY * 2}px`,
        })
      }
      this.togglePopup(true)

      const newPosition = this.calcPosition(
        { x: left, y: top + this.options.offsetY },
        this.nodes.popup,
      )
      this.callPosition(this.nodes.popup, newPosition)
    }

    return this.nodes.button
  }

  // 创建mask
  createMask() {
    const div = document.createElement('div')
    div.setAttribute('class', `ly-popup-mask ${this.state.platform}`)

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
    this.nodes.mask = div
  }

  // 创建浮窗
  createPopup() {
    const div = document.createElement('div')
    div.setAttribute('class', `ly-popup-cotainer ${this.state.platform}`)

    tapStyles(div, {
      position: this.state.isMobile ? 'fixed' : 'absolute',
      display: 'none',
      zIndex: '1201',
      left: 0,
      top: this.state.isMobile ? '' : '0',
      minWidth: this.state.isMobile ? '100vw' : '375px',
      minHeight: this.state.isMobile ? '60vh' : '375px',
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
      height: this.state.isMobile ? '100%' : '20px',
      zIndex: '99',
      textAlign: 'center',
      fontSize: '12px',
      backgroundColor: 'rgba(248, 249, 251, 0.8)',
      color: '#555',
      margin: '0',
      overflow: 'hidden',
    })

    div.appendChild(loading)
    this.state.isMobile && div.appendChild(bar)
    div.appendChild(closeBtn)

    document.body.appendChild(div)
    this.nodes.popup = div
    this.nodes.loading = loading
    this.nodes.bar = bar
    this.nodes.closeBtn = closeBtn

    this.stopPropagationNodes.push(bar, closeBtn)
    return div
  }

  createHanDian(word = '') {
    const previousContent = document.getElementById('handian_content')
    if (previousContent) {
      this.nodes.popup.removeChild(previousContent)
    }
    clearTimeout(this.hdTimer)

    // add new content
    const content = document.createElement('iframe')
    content.frameBorder = '0'
    content.src = `https://www.zdic.net/hans/${word}`
    content.sandbox = 'allow-same-origin allow-forms'
    content.seamless = 'seamless'
    content.id = 'handian_content'
    // content.style['display'] = 'none';
    content.width = this.state.isMobile ? window.innerWidth : '375'
    content.height = this.state.isMobile ? window.innerHeight * 0.6 : '400'

    this.state.isMobile &&
      tapStyles(content, {
        width: '100%',
        height: '60vh',
      })

    console.log('加载汉典', Date.now())
    this.toggleLoading(true)
    content.addEventListener('load', () => {
      console.log('汉典加载好了', Date.now())
      this.toggleLoading(false)
    })
    content.addEventListener('error', () => {
      console.error('加载汉典报错', Date.now())
      this.toggleLoading(false)
    })
    if (this.options.MAX_TIME_OUT) {
      this.hdTimer = setTimeout(() => {
        if (this.state.loadingVisible) {
          console.warn(`汉典加载超过${this.options.MAX_TIME_OUT}ms`)
          this.toggleLoading(false)
        }
      }, this.options.MAX_TIME_OUT)
    }

    return content
  }

  // 汉典加速
  prefetchHanDian() {
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

  // 插入样式
  injectStyles = () => {
    const style = document.createElement('style')

    style.type = 'text/css'
    style.innerHTML = styles

    document.head.appendChild(style)
    return style
  }

  getRelativePos = (event) => {
    if ([MOBILE, TABLET].includes(this.state.platform)) {
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

  // 计算元素位置
  calcPosition(position, el) {
    if (!position || !el) return { left: 0, top: 0 }
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

    if (this.state.isMobile) {
      el.style.transform = 'translateY(0px)'
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

  // 开关查典button
  toggleButton = (visible) => {
    if (!this.nodes.button) return
    this.state.buttionVisible =
      visible === void 0 ? !this.state.buttionVisible : visible

    if (this.state.buttionVisible) {
      this.nodes.button.style.opacity = 1
      this.nodes.button.style.pointerEvents = 'auto'
    } else {
      this.nodes.button.style.opacity = 0
      this.nodes.button.style.pointerEvents = 'none'
    }
  }

  // 开关查典popup
  togglePopup = (visible) => {
    if (!this.nodes.popup) return
    this.state.popupVisible =
      visible === void 0 ? !this.state.popupVisible : visible

    if (this.state.popupVisible) {
      tapStyles([document.documentElement, this.options.container], {
        overflow: 'hidden',
      })
      this.nodes.popup.style.display = 'block'
      if (this.state.isMobile) {
        this.nodes.mask.style.opacity = 1
        this.nodes.mask.style.visibility = 'visible'
        this.nodes.mask.style.zIndex = 1200
      }
      clearTimeout(this.state.popupTimer)
    } else {
      tapStyles([document.documentElement, this.options.container], {
        overflow: '',
      })
      if (this.state.isMobile) {
        this.nodes.popup.style.transform = 'translateY(100%)'
        this.nodes.mask.style.opacity = 0
        this.state.popupTimer = setTimeout(() => {
          this.nodes.popup.style.display = 'none'
          this.nodes.mask.style.zIndex = -1
          this.nodes.mask.style.visibility = 'hidden'
        }, 350)
      } else {
        this.nodes.popup.style.display = 'none'
      }
    }
  }

  // 开关loading
  toggleLoading = (visible) => {
    if (!this.nodes.loading) return
    const loading = document.getElementById('handian-loading')
    this.state.loadingVisible =
      visible === void 0 ? !this.state.loadingVisible : visible

    if (this.state.loadingVisible) {
      loading.classList.remove('hide')
    } else {
      loading.classList.add('handian-loading', 'hide')
    }
  }

  // 隐藏所有
  hideAll = () => {
    this.toggleButton(false)
    this.togglePopup(false)
    this.toggleLoading(false)
  }
}

new SelectionHanDian({
  onEnd: function onEnd(event, text, instance) {
    Array.isArray(window.dataLayer) &&
      window.dataLayer.push({
        event: 'dianClick',
        selection_text: text,
        platform: instance.state.platform,
      })
  },
})

export default SelectionHanDian
