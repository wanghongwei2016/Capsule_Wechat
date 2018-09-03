// depositPay.js
var app = getApp()
var network = require('../../utils/network.js')
var utils = require("../../utils/util.js")

var storageService = require('../../utils/storageService.js').default
Page({

  /**
   * 页面的初始数据
   */
  data: {
    deposit: 99,
    is_mine_page: 0,
    btn_text: '押金充值',
    pay_reason: '',
    is_pay: false,
    info_text: '交纳'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      setScanCodeCmd: options.setScanCodeCmd,
      openCapsuleCmd: options.openCapsuleCmd,
    });
    var that = this
    // toast组件实例
    new app.ToastPannel();
    console.log(options);
    if (options.back_deposit == 'true') {
      that.setData({
        btn_text: '补交押金',
        is_pay: true,
        info_text: '补交'
      })
      wx.setNavigationBarTitle({
        title: '补交押金'
      });
      network.shareSleepNetwork("user/depositreason", { uin: parseInt(app.globalData.localUserInfo.uin) }, "POST", function complete(res) {
        console.log(res.data);
        if (res.data.ret == 0) {
          that.setData({
            pay_reason: res.data.reason ? (res.data.reason + '，') : ''
          })
        } else if (res.data.ret == -1055) {
          console.log(res.data.err)
        }
      }, that)
    }
    if (options.deposit && options.deposit > 0) {
      this.setData({
        deposit: options.deposit,
        is_mine_page: 1
      })
    } else {
      if (wx.showLoading) {
        wx.showLoading({
          title: '数据更新中',
        })
      }

      network.shareSleepNetwork("user/info", {}, "GET", function complete(res) {
        if (wx.hideLoading) {
          wx.hideLoading()
        }
        var deposit_real = (res.data.user_info.deposit ? 0 : parseInt(res.data.user_info.deposit)) / 100.0
        if (!res.data.user_info.deposit || res.data.user_info.deposit == 0) {
          that.setData({
            deposit: parseInt(res.data.standard_deposit) / 100.0
          })
        } else {
          that.setData({
            deposit: (parseInt(res.data.standard_deposit) / 100.0 - parseInt(res.data.user_info.deposit) / 100.0).toFixed(2)
          })
        }

      }, that)
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  /**
   * 联系客服
   */
  contactAction: function () {
    wx.showModal({
      content: '请拨打客服电话400-688-9960进行押金退还。',
      confirmText: "拨打客服",
      success: function (res) {
        if (res.confirm) {
          utils.callService()
        }
      }
    })
  },

  /**
   * 立即充值
   */
  payAction: function () {
    var that = this
    if (wx.showLoading) {
      wx.showLoading({
        title: '支付环境准备中',
      })
    }
    network.shareSleepNetwork("deposit/update", {}, "POST", function complete(res) {
      if (wx.hideLoading) {
        wx.hideLoading()
      }
      if (res.data && res.data.ret == 0) {
        console.log(res)
        //订单结束，请求支付
        wx.requestPayment({
          timeStamp: res.data.wechat_pay_info['timeStamp'],
          nonceStr: res.data.wechat_pay_info['nonceStr'],
          package: res.data.wechat_pay_info['package'],
          signType: res.data.wechat_pay_info['signType'],
          paySign: res.data.wechat_pay_info['paySign'],
          complete: function (result) {
            // complete
            console.log(result)
            if (result.errMsg == "requestPayment:ok") {
              if (that.data.setScanCodeCmd) {
                storageService.setScanCodeCmd();
              }
              if (that.data.openCapsuleCmd) {
                storageService.setOpenCapsuleCmd(that.data.openCapsuleCmd);
              }



              var pages = getCurrentPages()
              if (pages.length > 1) {
                console.log("11111")
                wx.navigateBack({
                  delta: 1,
                  success: function () {
                    that.show('充值成功')
                    // wx.showToast({
                    //   title: '充值成功',
                    // })
                  }
                })
              } else {
                wx.redirectTo({
                  url: '/pages/scanCode/scanCode'
                })
              }
              // wx.navigateBack({
              //   // delta: that.data.is_mine_page == 1?2:1,
              //   delta: 1,
              //   success: function () {
              //     wx.showToast({
              //       title: '充值成功',
              //     })
              //   }
              // })
            } else if (result.errMsg == "requestPayment:fail cancel") {
              that.show('支付取消');
              // wx.showToast({
              //   title: '支付取消',
              // })
            } else {
              that.show('充值失败，请重试，或者联系客服反馈');
              // wx.showToast({
              //   title: '充值失败，请重试，或者联系客服反馈',
              // })
            }
          }
        })
      } else {

      }
    }, that)
  }
})