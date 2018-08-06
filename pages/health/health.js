// pages/health/health.js
var network = require('../../utils/network.js')
var app = getApp()
var utils = require("../../utils/util.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasHealthData: false,
    pushList: [],
    loadingText: '数据拉取中'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // toast组件实例
    new app.ToastPannel()
    this.getPushList()
    if (options.page_from === 'orderDetail') {
      this.setData({
        page_from: options.page_from
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    var that = this
    this.setData({
      last_id: ''
    })
    this.getPushList(function beforeBack() {
      that.setData({
        pushList: []
      })
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if(this.data.last_id){
      this.getPushList()
    }
  },
  /**
   * 获取推送列表
   */
  getPushList: function (beforeBack) {
    var that = this;
    if (beforeBack) {
      beforeBack()
    }
    let data = {}
    if (that.data.last_id){
      data.last_id = that.data.last_id
    }
    if (wx.showLoading) {
      wx.showLoading({
        title: that.data.loadingText,
      })
    }
    network.shareSleepNetwork("capsule/pushlist", data, "GET", function complete(res) {
      let pushList = that.data.pushList
      if (wx.hideLoading) {
        wx.hideLoading()
      }
      if (wx.stopPullDownRefresh) {
        wx.stopPullDownRefresh()
      }
      if (res.data.ret == 0) {
        if (res.data.push_list && res.data.push_list.length > 0){
          var respPushList = res.data.push_list;
          for (var i = 0; i < respPushList.length; i++) {
            var item = respPushList[i]
            console.log(item.subject)
            item.push_time = utils.date('Y-m-d h:i:s', item.push_time)
          }
          that.setData({
            pushList: pushList.concat(respPushList),
            last_id: res.data.last_id,
            hasHealthData: true
          })
        }
      }
    }, this)
  },
  updateHealthReportCache: function () {
    // 如果用户使用了冥想音乐，存储健康数据标记
    wx.getStorage({
      key: 'healthReportCache',
      success: function (res) {
        console.log(res.data)
        var healthReport = Object.assign(res.data, { health_flag: 1 })
        wx.setStorage({
          key: 'healthReportCache',
          data: healthReport,
          complete: function (res) {
            console.log(res)
          }
        })
      }
    })
  },
  /**
   * 跳转到活动页面
   */
  webViewAction: function (event) {
    var chooseId = event.currentTarget.dataset.index;
    var canIUse = wx.canIUse('web-view');
    console.log(canIUse)
    if (canIUse) {
      this.updateHealthReportCache()
      wx.navigateTo({
        url: "/pages/activity/activity?web_view_url=" + this.data.pushList[chooseId].content
      })
    } else {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。',
        showCancel: false,
        confirmText: '知道了'
      })
    }
  },
})