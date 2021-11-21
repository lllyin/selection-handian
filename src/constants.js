export const DEFAULT_OPTIONS = {
  // 汉典最大加载时间
  MAX_TIME_OUT: 5000,
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
  offsetY: 15,
  // 选择结束
  onEnd: () => {},
}

// 手机
export const MOBILE = 'mobile'
// 平板
export const TABLET = 'tablet'
// 桌面
export const PC = 'pc'

export const EVENT_NAMES = {
  [MOBILE]: {
    START: 'touchstart',
    END: 'touchend',
  },
  [TABLET]: {
    START: 'touchstart',
    END: 'touchend',
  },
  [PC]: {
    START: 'mousedown',
    END: 'mouseup',
  },
}

// 关闭按钮
export const CLOSE_ICON =
  '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg t="1636784066087" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4964" xmlns:xlink="http://www.w3.org/1999/xlink" width="200" height="200"><defs><style type="text/css"></style></defs><path d="M512 0a512 512 0 0 0-512 512 512 512 0 0 0 512 512 512 512 0 0 0 512-512 512 512 0 0 0-512-512z" fill="#efd0c9" p-id="4965"></path><path d="M717.165714 306.176a35.986286 35.986286 0 0 0-50.834285 0.146286L512 461.019429 357.668571 306.322286a35.986286 35.986286 0 0 0-50.980571 50.761143L461.165714 512 306.688 666.916571a35.986286 35.986286 0 0 0 50.980571 50.761143L512 562.980571l154.331429 154.843429a35.693714 35.693714 0 0 0 50.834285 0.073143 35.986286 35.986286 0 0 0 0.146286-50.907429L562.834286 512l154.331428-154.916571a35.913143 35.913143 0 0 0 0-50.907429z" fill="#AE060F" p-id="4966"></path></svg>'
