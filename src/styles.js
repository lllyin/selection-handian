const styles = `
body * {
  -webkit-touch-callout: none;
}
.ly-popup-button {
  will-change: transform, opacity;
  transition: transform, opacity 350ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
}
.ly-popup-cotainer.pc {
  border-radius: 3px;
}
.ly-popup-cotainer.mobile {
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}
.ly-popup-cotainer .ly-popup-bar {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 60px;
  background-color: transparent;
  text-align: center;
  z-index: 1000;
  line-height: 0;
}
.ly-popup-cotainer .ly-popup-bar::after {
  content: "";
  display: inline-block;
  background-color: #BBBABE;
  border-radius: 5px;
  width: 36px;
  height: 5px;
  margin-top: 9px;
}
.ly-popup-cotainer .ly-popup-close {
  position: absolute;
  right: 6px;
  top: 7px;
  width: 30px;
  height: 30px;
  z-index: 1001;
  cursor: pointer;
}
.ly-popup-cotainer .ly-popup-close > svg {
  width: 100%;
  height: 100%;
}
.ly-popup-cotainer .handian-loading {
  opacity: 1;
  will-change: transform, opacity;
}
.ly-popup-cotainer .handian-loading.hide {
    transition: opacity,transform  0.25s cubic-bezier(0, 0, 0.2, 1) 0s;
}
.ly-popup-cotainer.mobile .handian-loading.hide {
    opacity: 0;
    visibility: hidden;
}
.ly-popup-cotainer.pc .handian-loading.hide {
  transform: translateY(-100%);
}
`
export default styles
