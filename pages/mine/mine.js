// mine.js
var app = getApp()
var network = require('../../utils/network.js')
var utils = require("../../utils/util.js")
Page({
  /**
   * 页面的初始数据
   */
  data: {
    login_in_data: [],
    normal_pageData: [
      { "icon": "health.png", "title": "健康小贴士" },
      { "icon": "question.png", "title": "用户指南" },
      { "icon": "call.png", "title": "客服电话", "des": "400-688-9960" }
    ],
    uin: 100000,
    nick_name: '随机昵称',
    verified_disable: false,
    deposit_des: "未交押金",
    balance: 0,
    phone: '',
    coupon_count: 0,
    first_show_id: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // toast组件实例
    new app.ToastPannel();
    this.setData({
      register_bonus: app.globalData.config.register_bonus === 0 || app.globalData.config.register_bonus ? app.globalData.config.register_bonus / 100 : app.globalData.configDefault.register_bonus / 100,
      invite_bonus: app.globalData.config.invite_bonus === 0 || app.globalData.config.invite_bonus ? app.globalData.config.invite_bonus / 100 : app.globalData.configDefault.invite_bonus / 100
    })
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
    var that = this
    console.log(this.data.uin)
    if (app.globalData.localUserInfo.uin != 100000) {
      this.getLocalUserInfo(function callback() {
        that.setData({
          uin: app.globalData.localUserInfo.uin,
          login_in_data: [
            { "icon": "balance.png", "title": "钱包", "des": that.data.balance },
            { "icon": "order.png", "title": "订单", "des": that.data.balance },
            { "icon": "invite.png", "title": "邀请好友", "des": that.data.invite_bonus },
            { "icon": "skin.png", "title": "扫一扫，测肤质" }
          ]
        })
      })

    }
    if (app.globalData.localUserInfo.uin != 100000) {
      this.setData({
        uin: app.globalData.localUserInfo.uin,
        login_in_data: [
          { "icon": "balance.png", "title": "钱包", "des": that.data.balance },
          { "icon": "order.png", "title": "订单", "des": that.data.balance },
          { "icon": "invite.png", "title": "邀请好友", "des": that.data.invite_bonus },
          { "icon": "skin.png", "title": "扫一扫，测肤质" }
        ]
      })
    } else {
      this.setData({
        uin: 100000,
        login_in_data: []
      })
    }

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
    if (app.globalData.localUserInfo.uin == 100000) {
      wx.stopPullDownRefresh()
      return;
    }
    var that = this
    this.getLocalUserInfo(function callback() {
      that.setData({
        uin: app.globalData.localUserInfo.uin,
        login_in_data: [
          { "icon": "balance.png", "title": "钱包", "des": that.data.balance },
          { "icon": "order.png", "title": "订单", "des": that.data.balance },
          { "icon": "invite.png", "title": "邀请好友", "des": that.data.invite_bonus },
          { "icon": "skin.png", "title": "扫一扫，测肤质" }
        ]
      })
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  /**
   * 获取用户信息
   */
  getLocalUserInfo: function (callBack) {
    var that = this
    var is_verified = false
    var deposit_text = "押金"
    var is_deposit = false
    var back_deposit = false
    if (wx.showLoading) {
      wx.showLoading({
        title: '加载中',
        mask: true
      })
    }
    network.shareSleepNetwork("user/info", {}, "GET", function complete(res) {
      if (wx.hideLoading) {
        wx.hideLoading()
      }
      wx.stopPullDownRefresh()
      if (res.data && res.data.ret == 0) {
        console.log(res)
        if (res.data.user_info.id_verified == 1) {
          is_verified = true
        }
        if (res.data.user_info.deposit == res.data.standard_deposit) {
          is_deposit = true
        }
        console.log(res.data.user_info.out_trade_no ? 1 : 0)
        if (isNaN(res.data.user_info.deposit) && !res.data.user_info.out_trade_no) {
          deposit_text = "未交押金"
        } else if (res.data.user_info.deposit < res.data.standard_deposit && res.data.user_info.out_trade_no || isNaN(res.data.user_info.deposit)) {
          deposit_text = "押金不足"
        } else if (res.data.user_info.deposit >= res.data.standard_deposit) {
          deposit_text = "已交押金"
        }
        var phoneNumber = phoneNumberResolve(res.data.user_info.phone)
        console.log(phoneNumber)
        that.setData({
          deposit_total: res.data.standard_deposit ? res.data.standard_deposit : 0,
          deposit: res.data.user_info.deposit ? res.data.user_info.deposit : 0,
          nick_name: res.data.user_info.nick_name,
          verified_disable: is_verified,
          deposit_des: deposit_text,
          phone: phoneNumber,
          balance: (isNaN(res.data.user_info.balance) ? 0 : res.data.user_info.balance / 100.0),
          is_deposit: is_deposit,
          back_deposit: res.data.user_info.deposit > 0 && res.data.user_info.deposit < res.data.standard_deposit ? 'true' : 'false'
        })
        if (callBack) {
          callBack()
        }
      } else {
        that.show('用户信息更新失败，请重试')
        // wx.showToast({
        //   title: '用户信息更新失败，请重试',
        // })
      }
      // if (is_verified == false && that.data.first_show_id == 0 && app.globalData.localUserInfo.uin != 100000) {
      //   wx.navigateTo({
      //     url: '/pages/verifi/verifi',
      //   })
      //   that.setData({
      //     first_show_id: 1
      //   })
      //   return
      // }
      // console.log(that.data.is_deposit)
      // console.log(that.data.deposit_des);
      // console.log(that.data.back_deposit);
      // if (is_verified == true && is_deposit == false && that.data.first_show_id == 0 && app.globalData.localUserInfo.uin != 100000) {
      //   wx.navigateTo({
      //     url: '/pages/depositPay/depositPay?deposit=' + (that.data.deposit_total - that.data.deposit) / 100 + '&back_deposit=' + that.data.back_deposit,
      //   })
      //   that.setData({
      //     first_show_id: 1
      //   })
      //   return
      // }
    }, that)
  },
  /**
   * 退出登录
   */
  loginOutAction: function () {
    var that = this
    wx.showModal({
      content: '您确定要退出登录吗?',
      confirmText: "登出",
      success: function (res) {
        if (res.confirm) {
          console.log("关闭WebSocket=======")
          wx.closeSocket();
          wx.onSocketClose(function (res) {
            if (app.globalData.timer) {
              clearInterval(app.globalData.timer)
            }
            console.log('WebSocket 已关闭！')
          })
          network.shareSleepNetwork("user/logout", {}, "POST", function complete(res) {
            wx.removeStorage({
              key: 'localUserCache',
              success: function (res) {
                app.setLocalUserInfo();
                that.onShow()
              }
            })
          }, that);
          that.setData({
            first_show_id: 0
          })
        }
      }
    })

  },
  /**
   * 登录/注册
   */
  loginAction: function () {
    wx.navigateTo({
      url: '/pages/login/login',
    })
  },
  /**
   * 用户指南
   */
  normalQuestionsAction: function () {
    var canIUse = wx.canIUse('web-view');
    if (canIUse) {
      wx.navigateTo({
        url: "/pages/activity/activity?web_view_url=https://www.xiangshuispace.com/www/qa.html"
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
  /**
  * 拨打客服电话
  */
  callServiceAction: function () {
    utils.callService("400-688-9960")
  },
  /**
   * row 点击事件
   */
  sectionSelectAction: function (e) {
    console.log(e)
    var title = e.target.dataset.title
    if (title == "用户指南") {
      this.normalQuestionsAction()
    } else if (title == "客服电话") {
      this.callServiceAction()
    } else if (title == "钱包") {
      wx.navigateTo({
        url: '/pages/deposit/deposit?deposit=' + parseInt(this.data.deposit) / 100.0 + "&deposit_total=" + parseInt(this.data.deposit_total) / 100.0 + "&balance=" + this.data.balance,
      })
    } else if (title == "邀请好友") {
      wx.navigateTo({
        url: '/pages/newInvite/newInvite',
      })
    } else if (title == "扫一扫，测肤质") {
      wx.navigateTo({
        url: '/pages/skinTest/skinTest',
      })
    } else if (title == "健康小贴士") {
      wx.navigateTo({
        url: '/pages/health/health',
      })
    }else if (title == "优惠券") {
      wx.navigateTo({
        url: '/pages/coupon/coupon',
      })
    } else if (title == "订单") {
      wx.navigateTo({
        url: '/pages/orderList/orderList',
      })
    }
  },
  /**
   * 实名认证
   */
  verifAction: function () {
    wx.navigateTo({
      url: '/pages/verifi/verifi',
    })
  },
  /**
   * 占位方法
   */
  tempAction: function () {

  }
})
function phoneNumberResolve(numberString) {
  var tmp = numberString.substring(3, 7)
  console.log(tmp)
  return numberString.replace(tmp, "****")
}