// myWallet.js
var network = require("../../utils/network")
var utils = require("../../utils/util.js")
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    type_list: [],
    charge_id: 20,
    is_mine_page:0,
    booking_id:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // toast组件实例
    new app.ToastPannel();
    var that = this
    if (options.is_mine_page) {
      this.setData({
        is_mine_page: options.is_mine_page
      })
    }
    if (options.booking_id){
      this.setData({
        booking_id: options.booking_id
      })
    }
    network.shareSleepNetwork("charge/get", {}, "GET", function complete(res) {
      if(res.data.ret == 0){
        that.setData({
          type_list:res.data.charge_infos,
          charge_id: res.data.charge_infos[0].charge_id
        })
      }
    },that)
  },
  /**
   * 选择充值类型
   */
  selecteRechargeAction: function(e) {
    this.setData({
      charge_id: e.target.dataset.chargeid
    })
  },
  /**
   * 钱包充值
   */
  rechargeAction: function () {
    var that = this
    if(wx.showLoading){
      wx.showLoading({
        title: '支付环境准备中',
      })
    }
    network.shareSleepNetwork("charge/update", {charge_id:this.data.charge_id}, "POST", function complete(res) {
      if(wx.hideLoading){
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
            console.log(that.data.is_mine_page)
            if (result.errMsg == "requestPayment:ok") {
              if (that.data.booking_id > 0) {
                var pages = getCurrentPages()
                var booking_page = pages[pages.length - 2]
                // if (booking_page.updateBookingStatus()){
                booking_page.setData({
                  need_update:1
                })
                // }
              }
              wx.navigateBack({
                // delta: that.data.is_mine_page == 1 ? 2 : 1,
                delta: 1,
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
    },that)
  },

  /**
   * 充值明细
   */
  chargeDetailAction: function (e) {
    wx.navigateTo({
      url: '/pages/depositList/depositList?type=2',
    })
  },
  bindChargeShuoming: function () {
    this.setData({
      showShuoming: true,
    });
  },
  hideShuoming: function () {
    this.setData({
      showShuoming: false,
    });
  },
})