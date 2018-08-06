// areaInfo.js
var network = require('../../utils/network.js')
var utils = require("../../utils/util.js")
var app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    current: 0,
    bigImgs: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    // toast组件实例
    new app.ToastPannel();
    console.log(options);
    that.setData({
      current: options.current,
      bigImgs: options.bigImgs.split(',')
    })
    wx.setNavigationBarTitle({
      title: (parseInt(that.data.current) + 1) + '/' + that.data.bigImgs.length
    });
  },
  goBack: function () {
    wx.navigateBack({
      delta: 1
    })
  },
  /**
   * 轮播图current改变时会触发change事件
   */
  swiperAction: function (e) {
    this.setData({
      current: e.detail.current
    })
    wx.setNavigationBarTitle({
      title: (parseInt(this.data.current) + 1) + '/' + this.data.bigImgs.length
    });
  }
})