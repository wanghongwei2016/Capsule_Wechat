// deposit.js
var app = getApp()
var network = require('../../utils/network.js')
var utils = require("../../utils/util.js")
Page({
  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // toast组件实例
    new app.ToastPannel();
    this.setData({
      web_view_url: options.web_view_url + '?cache=' + Math.floor(Math.random() * 100 + 1)
    })
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  onShareAppMessage: function () {
    var ret = lowerVersion('6.5.8')
    console.log(ret)
    if (ret == true) {
      wx.showModal({
        title: '提示',
        content: '您的微信版本暂不支持此功能，请升级后使用',
      })
      return
    }
    return {
      title: "健康加油站",
      path: '/pages/activity/activity?web_view_url=' + this.data.web_view_url,
      success: function (res) {
        that.show('分享成功')
      },
      fail: function (res) {
        that.show('分享失败，请重试')
        console.log(res)
      }
    }
  }
})
function lowerVersion(standardVersion) {
  var baseVersion = ''
  var sysVersion = ''
  wx.getSystemInfo({
    success: function (res) {
      // success
      console.log(res)
      baseVersion = res.SDKVersion
      sysVersion = res.version
    }
  })
  var [MAJOR, MINOR, PATCH] = decodeURI(baseVersion).split('.')
  var [SYS_MAJOR, SYS_MINOR, SYS_PATCH] = decodeURI(sysVersion).split('.')
  var [BASE_MAJOR, BASE_MINOR, BASE_PATCH] = standardVersion.split('.')
  console.log(sysVersion)
  console.log(SYS_MAJOR, SYS_MINOR, SYS_PATCH)
  console.log(BASE_MAJOR, BASE_MINOR, BASE_PATCH)

  if (parseInt(SYS_MAJOR) <= parseInt(BASE_MAJOR) && parseInt(SYS_MINOR) <= parseInt(BASE_MINOR) && parseInt(SYS_PATCH) < parseInt(BASE_PATCH)) {
    return true;
  }
  return false
}