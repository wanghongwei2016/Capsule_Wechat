//faultReport.js
var network = require('../../utils/network.js')
var utils = require("../../utils/util.js")
var app = getApp()

var interval;
var varName;
var ctx = wx.createCanvasContext('canvasArcCir');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    hasSkinData: false,
    dark_level: 'normal'
  },
  canvasIdErrorCallback: function (e) {
    console.error(e.detail.errMsg)
  },
  onReady: function () {
    let rate = app.globalData.rate
    //创建并返回绘图上下文context对象。
    var cxt_arc = wx.createCanvasContext('canvasCircle');
    cxt_arc.setLineWidth(8 / rate);
    cxt_arc.setStrokeStyle('#eaeaea');
    cxt_arc.setLineCap('round');
    cxt_arc.beginPath();
    cxt_arc.arc(90 / rate, 90 / rate, 82 / rate, 0, 2 * Math.PI, false);
    cxt_arc.stroke();
    cxt_arc.draw();
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let rate = app.globalData.rate
    // toast组件实例
    new app.ToastPannel();

    var that = this;
    network.shareSleepNetwork("user/info", {}, "GET", function complete(res) {
      console.log(res);
      if (res.data && res.data.ret == 0) {
        that.setData({
          nick_name: res.data.user_info.nick_name
        })
      }
    })
    this.setData({
      personalData: options,
      date: utils.date('Y-m-d h:i', new Date().getTime() / 1000),
      beauty: Math.ceil(options.beauty),
      health: Math.ceil(options.health),
      stain: options.stain,
      dark_circle: options.dark_circle,
      face_url: options.face_url,
      acne: options.acne
    })
    this.circleProgress(options.beauty)
    this.dialProgress(this.data.health)
    this.stainProgress(options.stain)
    this.darkProgress(options.dark_circle)
    this.acneProgress(options.acne)
  },
  /**
   * 颜值圆型进度条
   */
  circleProgress: function (beauty) {
    let rate = app.globalData.rate
    var ctx = wx.createCanvasContext('canvasArcCir');
    function drawArc(s, e) {
      ctx.setFillStyle('white');
      ctx.clearRect(0, 0, 180 / rate, 180 / rate);
      ctx.draw();
      var x = 90 / rate, y = 90 / rate, radius = 82 / rate;
      ctx.setLineWidth(8 / rate);
      ctx.setStrokeStyle('#189df9');
      ctx.setLineCap('round');
      ctx.beginPath();
      ctx.arc(x, y, radius, s, e, false);
      ctx.stroke()
      ctx.draw()
    }
    var step = 1, startAngle = 1.5 * Math.PI, endAngle = 0;
    var animation_interval = 1000 / 60, n = 60;
    var animation = function () {
      if (step <= n) {
        endAngle = step * 2 * Math.PI / n + 1.5 * Math.PI;
        var limitEndAngle = 2 * Math.PI * beauty / 100 + 1.5 * Math.PI;
        if (endAngle <= limitEndAngle) {
          drawArc(startAngle, endAngle);
          step++;
        } else {
          clearInterval(varName);
        }
      } else {
        clearInterval(varName);
      }
    };
    varName = setInterval(animation, animation_interval);
  },
  /**
   * 健康仪表盘
   */
  dialProgress: function (health) {
    var dep = 1.8;
    var rotate = 0;
    var health_text = '';
    if (health <= 60) {
      health_text = '您的皮肤综合得分为' + health + '分，属于亚健康状态。请看下面详细分析和小建议，拥有健康皮肤不是梦！'
    } else {
      health_text = '您的皮肤综合得分为' + health + '分，属于健康状态。那也不要忘记继续保持好习惯呦！'
    }
    if (health > 50) {
      rotate = dep * health - 90;
    } else if (health == 50) {
      rotate = 0;
    } else if (health < 50) {
      rotate = -(90 - dep * health);
    }
    this.setData({
      indicator_rotate: 'transform: rotate(' + rotate + 'deg) translateX(-50%)',
      health_text
    })
  },
  /**
   * 色斑进度条
   */
  stainProgress: function (stain) {
    var stain_level = stain < 10 ? 'normal' : stain < 50 ? 'one' : stain < 75 ? 'two' : 'three'
    if (stain >= 10 && stain <= 25) {
      stain = Number(stain) + 15;
    }
    this.setData({
      stain_width: stain * 580 / 100 + 'rpx',
      stain_level
    })
  },
  /**
   * 黑眼圈进度条
   */
  darkProgress: function (dark_circle) {
    console.log(dark_circle)
    var dark_level = dark_circle < 10 ? 'normal' : dark_circle < 50 ? 'one' : dark_circle < 75 ? 'two' : 'three'
    if (dark_circle >= 10 && dark_circle <= 25) {
      console.log(dark_circle)
      dark_circle = Number(dark_circle) + 15;
    }
    this.setData({
      dark_width: dark_circle * 580 / 100 + 'rpx',
      dark_level
    })
  },
  /**
   * 青春痘进度条
   */
  acneProgress: function (acne_circle) {
    var acne_level = acne_circle < 10 ? 'normal' : acne_circle < 50 ? 'one' : acne_circle < 75 ? 'two' : 'three'
    if (acne_circle >= 10 && acne_circle <= 25) {
      acne_circle = Number(acne_circle) + 15;
    }
    this.setData({
      acne_width: acne_circle * 580 / 100 + 'rpx',
      acne_level
    })
  },
  /**
 * 用户点击右上角分享
 */
  onShareAppMessage: function () {
    var ret = utils.lowerVersion('6.5.8')
    console.log(ret)
    if (ret == true) {
      wx.showModal({
        title: '提示',
        content: '您的微信版本暂不支持此功能，请升级后使用',
      })
      return
    }
    var that = this
    var personalData = this.data.personalData
    return {
      title: "快来生成你的肤质报告吧！",
      path: '/pages/skinTest/skinTest',
      success: function (res) {
        that.show('分享成功');
      },
      fail: function (res) {
        that.show('分享失败，请重试');
      },
    }
  },
})