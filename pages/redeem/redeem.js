var app = getApp()
var network = require("../../utils/network.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    verify_code: '',
    redeemSuccess: false,
    red_envelope: 0,
    code_delete: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // toast组件实例
    new app.ToastPannel();
  },
  /**
   * 输入兑换码
   */
  inputVerifyCode: function (e) {
    var verify_code = e.detail.value
    var code_delete;
    if(verify_code){
      code_delete = true
    }else{
      code_delete = false
    }
    this.setData({
      verify_code: verify_code,
      code_delete: code_delete
    })
  },
  deleteAction: function () {
    this.setData({
      verify_code: '',
      code_delete: false
    })
  },
  /**
   * 关闭弹窗
   */
  handleCloseAction () {
    this.setData({
      verify_code: '',
      redeemSuccess: false,
      red_envelope: 0
    })
  },
  /**
   * 立即兑换
   */
  handleRedeemAction: function () {
    console.log(app.globalData.localUserInfo)
    if (app.globalData.localUserInfo.uin === 100000){
      wx.showModal({
        content: '登录后才能兑换现金红包哦~',
        confirmText: '去登录',
        success: function (res) {
          if (res.confirm) {
            wx.navigateTo({
              url: "/pages/login/login"
            })
          }
        }
      })
      return
    }
    var that = this;
    if (!that.data.verify_code){
      that.show('请输入兑换码')
      return
    }
    if (wx.showLoading) {
      wx.showLoading({
        title: "提交中",
        duration: 2000
      })
    }
    network.shareSleepNetwork("user/get_verify_red", { 'verify_code': that.data.verify_code}, "POST", function complete(res) {
      if (wx.hideLoading) {
        wx.hideLoading()
      }
      console.log(res);
      if (res.data.ret == 0) {
        that.setData({
          redeemSuccess: true,
          verify_code: '',
          red_envelope: res.data.red_envelope ? res.data.red_envelope / 100 : 0,
          code_delete: false
        })
      } else {
        that.setData({
          submit_disabled: false
        })
      }
    }, that)
  },
  /**
   * 跳转到活动页面
   */
  webViewAction: function () {
    var canIUse = wx.canIUse('web-view');
    if (canIUse) {
      wx.navigateTo({
        url: "/pages/activity/activity?web_view_url=" + 'https://www.xiangshuispace.com/www/redeemRule.html'
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
  }
})