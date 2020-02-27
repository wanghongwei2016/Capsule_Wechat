//orderPayPage.js
var app = getApp()
var network = require("../../utils/network.js")
var utils = require("../../utils/util.js")
var request = require("../../utils/request.js").default
Page({

  ...require('../../component/red_envelopes/red_envelopes.js').mixins,

  data: {
    time: 0,
    payRightNowDisabled: false,
    balance: 0,
    booking_id: 0,
    need_update: 0,
    need_charge: 0
  },
  onLoad: function (options) {
    this.setData({
      booking_id: options.booking_id
    });
    // toast组件实例
    new app.ToastPannel();
    if (options.booking_id){
      this.getBookingInfo(options.booking_id)
    }
    wx.setNavigationBarTitle({
      title: '支付'
    })
  },
  /**
   * 生命周期函数
   */
  onShow: function () {
    if (this.data.booking_id){
      this.getBookingInfo(this.data.booking_id)
    }
  },
  /**
   * 获取订单详情
   */
  getBookingInfo: function (bookingid){
    var that = this
    network.shareSleepNetwork('booking/bookingid/' + bookingid, {}, "GET", function complete(resp) {
      var timeString = utils.timeShowString(resp.data.booking_info.end_time - resp.data.booking_info.create_time)
      that.setData({
        time: timeString,
        price: resp.data.booking_info.final_price ? resp.data.booking_info.final_price / 100.0 : 0,
        booking_id: resp.data.booking_info.booking_id,
        booking_status: resp.data.booking_info.status,
        balance: resp.data.balance ? resp.data.balance / 100.0 : 0,
        need_charge: (resp.data.booking_info.status == 2 || resp.data.booking_info.status == 3) ? 1 : 0,
        capsule_id_origin: resp.data.booking_info.capsule_id,
        area_id: resp.data.booking_info.area_id,
        appraise_flag: resp.data.appraise_flag,
        coupon_cash: resp.data.booking_info.coupon_cash ? resp.data.booking_info.coupon_cash/100:0
      })
      if (resp.data.booking_info.status == 4) {
        var price = resp.data.booking_info.final_price ? resp.data.booking_info.final_price : 0;
        var balance = resp.data.balance ? resp.data.balance / 100.0 : 0;
        console.log(that.data);
        wx.redirectTo({
          url: '../paySucc/paySucc?time=' + timeString + '&final_price=' + price + '&balance=' + balance + '&capsule_id_origin=' + that.data.capsule_id_origin + '&booking_id=' + that.data.booking_id + '&area_id=' + that.data.area_id + '&phone=' + app.globalData.localUserInfo.phone + '&appraise_flag=' + resp.data.appraise_flag
        })
      }else{
        this.checkPrizeQuota(bookingid);
      }

      
    },that)
  },
  /**
   * 立即支付
   */
  payRightNowAction: function () {
    var that = this
    if (wx.showLoading) {
      wx.showLoading({
        title: "支付请求中"
      })
    } else {
      that.setData({
        payRightNowDisabled: true
      })
    }
    network.shareSleepNetwork('booking/update', {
      to_status: 3,
      from_status: parseInt(that.data.booking_status),
      booking_id: parseInt(that.data.booking_id),
      pay_type: 9,
      // pay_type: 7,
    }, "POST", function complete(res) {
      if (wx.hideLoading) {
        wx.hideLoading()
      } else {
        that.setData({
          payRightNowDisabled: false
        })
      }
      if (res.data.ret == 0) {
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
              var timeString = utils.timeShowString(res.data.booking_info.end_time - res.data.booking_info.create_time)
              wx.redirectTo({
                //后台微信支付回调有延时，所以前端调用微信支付直接支付订单的情况下，余额写死展示为0
                url: '../paySucc/paySucc?time=' + timeString + '&final_price=' + res.data.booking_info.final_price + "&capsule_id=" + res.data.booking_info.capsule_id + "&balance=" + 0 + '&capsule_id_origin=' + that.data.capsule_id_origin + '&booking_id=' + that.data.booking_id + '&area_id=' + that.data.area_id + '&phone=' + app.globalData.localUserInfo.phone + '&appraise_flag=' + that.data.appraise_flag
              })
            } else if (result.errMsg == "requestPayment:fail cancel") { } else { }
          }
        })
      } else if (res.data.ret == -3042){
        var timeString = utils.timeShowString(res.data.booking_info.end_time - res.data.booking_info.create_time)
        wx.redirectTo({
          //后台微信支付回调有延时，所以前端调用微信支付直接支付订单的情况下，余额写死展示为0
          url: '../paySucc/paySucc?time=' + timeString + '&final_price=' + res.data.booking_info.final_price + "&capsule_id=" + res.data.booking_info.capsule_id + "&balance=" + 0 + '&capsule_id_origin=' + that.data.capsule_id_origin + '&booking_id=' + that.data.booking_id + '&area_id=' + that.data.area_id + '&phone=' + app.globalData.localUserInfo.phone + '&appraise_flag=' + that.data.appraise_flag
        })
      } else {
        that.setData({
          payRightNowDisabled: false
        })
      }
    },that)
  },
  //拨打客服电话
  callServiceAction: function () {
    utils.callService()
  },
  /**
   * 立即充值
   */
  chargeRigthNowAction: function () {
    wx.navigateTo({
      url: '/pages/myWallet/myWallet?booking_id=' + this.data.booking_id,
    })
  },

  payByGuohang() {
    request({
      url: `/jpi/booking/${this.data.booking_id}/create_guohang_link`,
      loading: true,
      success: resp => {
        wx.navigateToMiniProgram({
          appId: resp.data.xcx_appid,
          path: resp.data.xcx_path,
          extraData: {
            param: resp.data.param
          },
          success: res => { }
        })
      }
    });
  },
})