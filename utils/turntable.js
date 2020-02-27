class Turntable {
  constructor() {}
  reset(page, field){
    this.animation = wx.createAnimation({});
    this.animation.rotate(0).step({
      duration: 0,
      timingFunction: 'linear'
    })
    let data = {};
    data[field] = this.animation.export();
    page.setData(data);
  }
  turn(page, field, angle, callback, opt = {
    duration: 1000 * 6,
    timingFunction: 'ease-out',
    transformOrigin: '50% 50% 0'
  }) {
    setTimeout(() => {
      this.animation = wx.createAnimation({});
      this.animation.rotate(angle).step(opt);
      let data = {};
      data[field] = this.animation.export();
      page.setData(data);
      this.callback = callback;
    }, 300);
  }
}
export default Turntable