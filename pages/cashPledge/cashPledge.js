// depositPay.js
var app = getApp()
var network = require('../../utils/network.js')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    deposit_total: 99,
    deposit: 0,
    is_mine_page: 0,
    deposit_text_placeholder: '',
    depositDisabled: true,
    btn_text: '押金充值',
    back_deposit: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    // toast组件实例
    new app.ToastPannel();
    that.setData({
      deposit: options.deposit,
      deposit_text_placeholder: options.deposit_text_placeholder
    })
    if (that.data.deposit == 0) {
      that.setData({
        depositDisabled: true,
        btn_text: '押金充值',
        back_deposit: false
      })
    } else if (that.data.deposit > 0 && that.data.deposit < that.data.deposit_total) {
      that.setData({
        depositDisabled: false,
        back_deposit: true,
        btn_text: '退押金'
      })
    } else if (that.data.deposit >= that.data.deposit_total) {
      that.setData({
        depositDisabled: false,
        back_deposit: false,
        btn_text: '退押金'
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
    this.getUserInfo();
  },
  /**
   * 获取用户信息
   */
  getUserInfo: function () {
    var that = this;
    network.shareSleepNetwork("user/info", {}, "GET", function complete(res) {
      that.setData({
        deposit: res.data.user_info.deposit ? res.data.user_info.deposit / 100 : 0,
        deposit_total: res.data.standard_deposit / 100.0
      })
      if (that.data.deposit == 0) {
        that.setData({
          depositDisabled: true,
          btn_text: '押金充值',
          back_deposit: false
        })
      } else if (that.data.deposit > 0 && that.data.deposit < that.data.deposit_total) {
        that.setData({
          depositDisabled: false,
          back_deposit: true,
          btn_text: '退押金'
        })
      } else if (that.data.deposit >= that.data.deposit_total) {
        that.setData({
          depositDisabled: false,
          back_deposit: false,
          btn_text: '退押金'
        })
      }
    }, that)
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
              wx.navigateBack({
                delta: that.data.is_mine_page == 1 ? 2 : 1,
                success: function () {
                  that.show('充值成功');
                  // wx.showToast({
                  //   title: '充值成功',
                  // })
                }
              })
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
  },
  /**
   * 押金操作
   */
  depositAction: function () {
    var that = this;
    if (that.data.deposit == 0) {
      wx.navigateTo({
        url: '/pages/depositPay/depositPay?deposit=' + (parseFloat(this.data.deposit_total) - parseFloat(this.data.deposit)),
      })
    } else {
      wx.showModal({
        title: '您确定要退押金吗？',
        content: '退押金后您将无法继续使用共享头等舱，确定要退吗？',
        confirmText: "确定",
        success: function (res) {
          if (res.confirm) {
            //请求退押金
            network.shareSleepNetwork("deposit/refund", {}, "POST", function complete(res) {
              console.log(res);
              if (res.data.ret == 0) {
                that.getUserInfo();
                that.show(res.data.success)
                // wx.showToast({
                //   title: res.data.success
                // })
              } else if (res.data.ret == -3077){
                wx.showModal({
                  showCancel:false,
                  title: '错误信息',
                  content: res.data.err,
                  confirmText: "确定",
                })
              }
            }, that)
          }
        }
      })
    }
  },
  /**
   * 补交押金
   */
  backdepositAction: function () {
    wx.navigateTo({
      url: '/pages/depositPay/depositPay?deposit=' + (parseFloat(this.data.deposit_total) - parseFloat(this.data.deposit)).toFixed(2) + '&back_deposit=' + this.data.back_deposit,
    })
  },
  /**
   * 充值明细
   */
  chargeDetailAction: function (e) {
    wx.navigateTo({
      url: '/pages/depositList/depositList?type=1',
    })
  }
})