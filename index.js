const defaultOptions = {
  // 汉典最大加载时间
  MAX_TIME_OUT: 3500,
  // 滚动容器，默认为 document.documentElement || document.body
  scroller: void 0,
  // 浮窗挂载节点
  container: document.body,
  // 监听节点
  el: document.body,
  // 浮窗
  popup: null,
  // x轴位移量
  offsetX: 2,
  // y轴位移量
  offsetY: 12,
  // 选择结束
  onEnd: () => {},
}

class SelectionHanDian {
  constructor(options = {}) {
    this.options = {
      ...defaultOptions,
      ...options,
    }
    this._init()
    this.injectStyles()
    this._createPopup()
  }

  //  初始化
  _init() {
    const { container, el, onEnd } = this.options

    window.removeEventListener('mousedown', this.hideAll)
    el.addEventListener('mouseup', (e) => {
      const selection = window.getSelection()

      if (selection.type === 'Range') {
        const text = selection.toString()
        const trimText = this.trimText(text)

        if (!trimText) return

        this._createButton(event, trimText)

        onEnd(e, trimText, this)

        window.addEventListener('mousedown', this.hideAll)
      }
    })
  }

  // 创建按钮
  _createButton(event, trimText) {
    let button = document.querySelector('.ly-selection-popup-button')
    const sh =
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0
    const left = event.clientX
    const top = event.clientY + sh

    if (!button) {
      button = document.createElement('div')
      button.setAttribute('class', 'ly-selection-popup-button')

      button.style.position = 'absolute'
      button.style.display = 'block'
      button.style.left = 0
      button.style.top = 0
      button.style.width = '32px'
      button.style.minHeight = '32px'
      button.style.borderRadius = '3px'
      button.style.backgroundColor = '#f5f5f5'
      button.style.fontWeigh = 500
      button.style.color = '#9d6a51'
      button.style.cursor = 'pointer'
      button.style.zIndex = '1200'
      button.style.textAlign = 'center'
      button.style.lineHeight = '32px'
      button.style.fontSize = '16px'
      button.style.userSelect = 'none'
      button.innerText = '典'
      button.title = '查汉典'

      button.addEventListener('mousedown', (e) => e.stopPropagation())
      button.addEventListener('mouseup', (e) => e.stopPropagation())

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

      this.popup.style.left = `${left}px`
      this.popup.style.top = `${top}px`
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

  // 创建浮窗
  _createPopup() {
    const div = document.createElement('div')
    div.setAttribute('class', 'ly-selection-popup-cotainer')

    div.style.position = 'absolute'
    div.style.display = 'none'
    div.style.zIndex = '1201'
    div.style.left = 0
    div.style.top = 0
    div.style.minWidth = '375px'
    div.style.minHeight = '375px'
    div.style.backgroundColor = '#fff'
    div.style.borderRadius = '2px'
    div.style.boxShadow = 'rgb(0 0 0 / 8%) 1px 2px 13px 0px'
    div.style.overflow = 'hidden'

    const loading = document.createElement('p')
    loading.style.position = 'absolute'
    loading.style.left = '50%'
    loading.style.top = '0'
    loading.style.transform = 'translateX(-50%)'
    loading.style.zIndex = '99'
    loading.style.textAlign = 'center'
    loading.style.fontSize = '12px'
    loading.style.width = '100%'
    loading.style.height = '20px'
    loading.style.lineHeight = '20px'
    loading.style.backgroundColor = 'rgba(0, 0, 0, 0.36)'
    loading.style.color = '#f5f5f5'
    loading.style.margin = '0'
    loading.style.overflow = 'hidden'

    loading.innerHTML = '加載結果中，請稍候……'
    loading.id = 'handian-loading'
    div.appendChild(loading)

    document.body.appendChild(div)
    this.popup = div

    return div
  }

  _createHanDian(word = '') {
    // remove previous handian
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
    content.width = '375'
    content.height = '400'

    console.log('加载汉典', Date.now())
    this.showLoading()
    content.addEventListener('load', () => {
      console.log('汉典加载好了', Date.now())
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
  injectStyles = (styles) => {
    const style = document.createElement('style')

    style.type = 'text/css'
    style.innerHTML = `
      .ly-selection-popup-button {
        transition: transform 350ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, opacity 500ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
      }
      .ly-selection-popup-cotainer .handian-loading {
          top: 0 !important;
          transition: top 0.25s cubic-bezier(0, 0, 0.2, 1) 0s;
      }
      .ly-selection-popup-cotainer .handian-loading.hide {
        top: -25px !important;
      }
    `
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

    el.style.transition = 'all 0.25s cubic-bezier(0, 0, 0.2, 1) 0s'
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
      this.popup.style.display = 'block'
    }
  }

  // 隐藏popup
  hidePopup = () => {
    if (this.popup) {
      this.popup.style.display = 'none'
    }
  }

  // 展示loading
  showLoading() {
    const loading = document.getElementById('handian-loading')
    if (loading) {
      loading.classList.remove('hide')
      // loading.style.height = '20px'
    }
  }
  // 隐藏loading
  hideLoading() {
    const loading = document.getElementById('handian-loading')
    if (loading) {
      loading.classList.add('handian-loading', 'hide')
      // loading.style.height = '0'
    }
  }

  hideAll = () => {
    this.hideButton()
    this.hidePopup()
  }
}

new SelectionHanDian({
  onEnd: function (event, text, self) {
    Array.isArray(window.dataLayer) &&
      window.dataLayer.push(
        Object.assign({ event: 'dianClick', selection_text: text }),
      )
  },
})

export default SelectionHanDian
