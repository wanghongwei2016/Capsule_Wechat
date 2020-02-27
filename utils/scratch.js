
var request = require('../utils/request.js').default

class Scratch {
  constructor() { }
  init(page) {
    this.page = page;
    return this;
  }
  start(opts) {
    this.showCanvas();
    this.red_bag_id = opts.red_bag_id;
    this.callback = opts.callback;
    this.imageResource = opts.imageResource;
    this.maskColor = opts.maskColor;
    this.r = opts.r || 4;
    this.minX = '';
    this.minY = '';
    this.maxX = '';
    this.maxY = '';
    this.status = 0;
    wx.createSelectorQuery().select('#scratch').fields({
      size: true,
    }, (res) => {
      this.canvasWidth = res.width;
      this.canvasHeight = res.height;
      this.ctx = wx.createCanvasContext('scratch');
      this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      if (this.imageResource) {
        wx.downloadFile({
          url: this.imageResource,
          success: res => {
            this.ctx.drawImage(res.tempFilePath, 0, 0, this.canvasWidth, this.canvasHeight);
            this.ctx.draw();
          }
        })
      } else {
        this.ctx.setFillStyle(this.maskColor);
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.ctx.draw();
      }
      this.status = 1;
    }).exec();
    return this;
  }

  drawRect(x, y) {
    const {
      r,
      minX,
      minY,
      maxX,
      maxY
    } = this
    const x1 = x - r > 0 ? x - r : 0
    const y1 = y - r > 0 ? y - r : 0
    if ('' != minX) {
      this.minX = minX > x1 ? x1 : minX
      this.minY = minY > y1 ? y1 : minY
      this.maxX = maxX > x1 ? maxX : x1
      this.maxY = maxY > y1 ? maxY : y1
    } else {
      this.minX = x1
      this.minY = y1
      this.maxX = x1
      this.maxY = y1
    }
    return [x1, y1, 2 * r]
  }


  touchStart(e) {
    if (!this.status) return
    const pos = this.drawRect(e.touches[0].x, e.touches[0].y)
    this.ctx.clearRect(pos[0], pos[1], pos[2], pos[2])
    this.ctx.draw(true)
  }

  touchMove(e) {
    if (!this.status) return
    const pos = this.drawRect(e.touches[0].x, e.touches[0].y)
    this.ctx.clearRect(pos[0], pos[1], pos[2], pos[2])
    this.ctx.draw(true)
  }

  touchEnd(e) {
    if (!this.status) return
    const {
      canvasWidth,
      canvasHeight,
      minX,
      minY,
      maxX,
      maxY
    } = this
    if (maxX - minX > .6 * canvasWidth && maxY - minY > .6 * canvasHeight) {
      this.ctx.draw()
      this.callback && this.callback();
      this.status = 0;
      this.page.setData({
        'isScroll': true
      })
    }
  }

  openModal() {
    let scratch = this.page.data.scratch || {};
    scratch.show = true;
    this.page.setData({
      scratch
    });
    return this;
  }

  closeModal() {
    let scratch = this.page.data.scratch || {};
    scratch.show = false;
    this.page.setData({
      scratch
    });
    return this;
  }

  showCanvas() {
    let scratch = this.page.data.scratch || {};
    scratch.hideCanvas = false;
    this.page.setData({
      scratch
    });
    return this;
  }

  hideCanvas() {
    let scratch = this.page.data.scratch || {};
    scratch.hideCanvas = true;
    this.page.setData({
      scratch
    });
    return this;
  }

  methods() {
    return {
      scratchTouchStart: this.touchStart.bind(this),
      scratchTouchMove: this.touchMove.bind(this),
      scratchTouchEnd: this.touchEnd.bind(this),
      scratchClose: this.closeModal.bind(this),
      bindTapStartButton: this.bindTapStartButton.bind(this),
    }
  }


  bindTapStartButton() {
    
    request({
      url: '/api/receive/red_bag',
      method: 'post',
      data: {
        red_bag_id: this.red_bag_id
      },
      success: resp => {
        let scratch = this.page.data.scratch || {};
        scratch.hideStartButton = true;
        this.page.setData({
          scratch
        });
      }
    });
    return this;
  }

  priceText(text) {
    let scratch = this.page.data.scratch || {};
    scratch.priceText = text;
    this.page.setData({
      scratch
    });
    return this;
  }

}

export default Scratch