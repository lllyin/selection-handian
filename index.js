const defaultOptions = {
  // 汉典最大加载时间
  MAX_TIME_OUT: 3500,
  // 浮窗挂载节点
  container: document.body,
  // 监听节点
  el: document.body,
  // 浮窗
  popup: null,
  // 选择结束
  onEnd: () => {},
  // x轴位移量
  offsetX: 2,
  // y轴位移量
  offsetY: 12,
}

class SelectionHanDian {
  constructor(options = {}) {
    this.options = {
      ...defaultOptions,
      ...options,
    }
    this._init()
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
    const preBtn = document.querySelector('.ly-selection-popup-button')

    if (preBtn) {
      document.body.removeChild(preBtn)
    }

    const sh =
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0
    const left = event.clientX
    const top = event.clientY + sh
    const div = document.createElement('div')
    div.setAttribute('class', 'ly-selection-popup-button')

    div.style.position = 'absolute'
    div.style.display = 'block'
    div.style.left = 0
    div.style.top = 0
    div.style.width = '32px'
    div.style.minHeight = '32px'
    div.style.borderRadius = '3px'
    div.style.backgroundColor = '#f5f5f5'
    div.style.fontWeigh = 500
    div.style.color = '#9d6a51'
    div.style.cursor = 'pointer'
    div.style.zIndex = '1200'
    div.style.textAlign = 'center'
    div.style.lineHeight = '32px'
    div.style.fontSize = '16px'
    div.style.userSelect = "none"
    div.innerText = '典'
    div.title = '查汉典'

    div.style.left = `${left}px`
    div.style.top = `${top + this.options.offsetY}px`

    div.addEventListener('mousedown', (e) => e.stopPropagation())
    div.addEventListener('mouseup', (e) => e.stopPropagation())
    div.addEventListener('click', (e) => {
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
    })

    document.body.appendChild(div)
    this.button = div

    return div
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
    loading.style.textAlign = 'center'
    loading.style.fontSize = '12px'
    loading.style.height = '20px'
    loading.style.lineHeight = '20px'
    loading.style.margin = '0'
    loading.style.color = '#888'
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
    content.sandbox = 'allow-same-origin allow-scripts allow-forms'
    content.seamless = "seamless"
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
      this.button.style.display = 'block'
    }
  }

  // 隐藏button
  hideButton = () => {
    if (this.button) {
      this.button.style.display = 'none'
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
      loading.style.height = '20px'
    }
  }
  // 隐藏loading
  hideLoading() {
    const loading = document.getElementById('handian-loading')
    if (loading) {
      loading.style.height = '0'
    }
  }

  hideAll = () => {
    this.hideButton()
    this.hidePopup()
  }
}

new SelectionHanDian({
  onEnd: function (event, text, self) {
    Array.isArray(dataLayer) &&
      dataLayer.push(
        Object.assign({ event: 'dianClick', selection_text: text }),
      )
  },
})

export default SelectionHanDian
