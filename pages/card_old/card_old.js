// pages/card/card.js
var app = getApp()
var network = require('../../utils/network.js')
var utils = require("../../utils/util.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    rules_hide: true,
    bougth_card: false,
    firstShow: false, //是否是第一次进来
    page_from:0, // 1 从订单详情过来
    card_info:{
      activity_body: "59.8元/月",
      activity_title: "特惠中",
      discount_price: 3000,
      original_price: 30000
    },
    invite_bonus: app.globalData.config.invite_bonus == 0 || app.globalData.config.invite_bonus ? app.globalData.config.invite_bonus / 100 : app.globalData.configDefault.invite_bonus / 100,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // toast组件实例
    new app.ToastPannel();
    this.getCardInfo()
    this.getLocation()
    console.log(options)
    // if(options.length > 0){
      this.setData({
        bougth_card: (options.bougth_card == "true" ? true : false),
        page_from: options.page_from,
        month_card_info: {
          card_no: options.card_no,
          end_date: options.end_date
        }
      })
    // }
      // 如果用户未登录，跳转注册页面
      if (app.globalData.localUserInfo.uin === 100000) {
        wx.navigateTo({
          url: '../newInvite/newInvite?uin=100000&type=4'
        })
        return 
      } else {//如果是从分享或者扫码进入月卡购买页面 拉取用户月卡信息 if(options.share == 1)
        this.getMyCardInfo()
      }
  },
  navigateBackFunc: function(ret,auto) {
    var pages = getCurrentPages()
    var prevPage = pages[pages.length - 2];
    var that = this;
    console.log("pre page is "+prevPage)
    console.log(prevPage.data)
    prevPage.setData({
      showed_buy_card:ret
    })
    if (ret == 3) {
      prevPage.setData({
        auto_end: auto
      })
    }
    console.log(prevPage.data)

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

   
    console.log(this.data)
    console.log(!this.data.bougth_card && this.data.page_from == 1)
    if (!this.data.bougth_card && this.data.page_from == 1) {
      this.navigateBackFunc(2,false)
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
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    if (res.from === "button") {
      console.log(res.target);
    }
    return {
      title: "您的自助休息空间+健康加油站",
      path: '/pages/scanCode/scanCode?card=1',
      imageUrl: '/images/card_share.png'
    }
  },
/**
 * 去支付，购买月卡
 */

  buyAction: function() {
    // 如果用户未登录，跳转注册页面
    if (app.globalData.localUserInfo.uin === 100000) {
      wx.navigateTo({
        url: '../newInvite/newInvite?uin=100000&type=4'
      })
      return
    }
    console.log("去购买")

    var that = this
    var loc = {}
    if (!isNaN(that.data.location.latitude)) {
      loc = {
        latitude: parseInt(parseFloat(that.data.location.latitude) * 1000000),
        longitude: parseInt(parseFloat(that.data.location.longitude) * 1000000)
      }
    }
    network.shareSleepNetwork("wallet/month_card", loc, "POST", function complete(res){
      if (wx.hideLoading) {
        wx.hideLoading()
      }
      if (res.data && res.data.ret == 0) {
        console.log(res)
        //月卡请求支付
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
              //设置上一个页面是否继续弹框
              if (that.data.page_from == 1) {
                that.navigateBackFunc(3,true)
                // that.setData({
                //   bougth_card: true,
                // })
              }
              if (that.data.booking_id > 0) {
                var pages = getCurrentPages()
                var booking_page = pages[pages.length - 2]
                // if (booking_page.updateBookingStatus()){
                booking_page.setData({
                  need_update: 1
                })
              
                // }
              }
              wx.navigateBack({
                // delta: that.data.is_mine_page == 1 ? 2 : 1,
                delta: 1,
                success: function () {
                  that.show('购买成功');
                  // wx.showToast({
                  //   title: '充值成功',
                  // })
                  // 购买月卡成功，修改标记
                  that.setData({
                    bougth_card: true,
                  })
                  
                }
              })
            } else if (result.errMsg == "requestPayment:fail cancel") {
              that.show('取消购买');
              // wx.showToast({
              //   title: '支付取消',
              // })
            } else {
              that.show('购买失败，请重试，或者联系客服反馈');
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
  getCardInfo:function() {
    var that = this
    network.shareSleepNetwork("wallet/month_card_activity_info", {}, "GET", function complete(res) {
      if (wx.hideLoading) {
        wx.hideLoading()
      }
      if (res.data && res.data.ret == 0) {
        that.setData({
          card_info:res.data
        })
      }
    },that)
  },
  toggleRulesAction: function() {
    this.setData({
      rules_hide:!this.data.rules_hide
    })
  },
  /**
  * 获取定位
  */
  getLocation: function () {
    var that = this;
    //获取定位
    wx.getLocation({
      success: function (res) {
        console.log('获取定位')
        console.log(res)
        var loc = utils.convert_GCJ02_To_BD09(res.latitude, res.longitude)
        console.log(loc)
        that.setData({
          location: loc
        })
      },
      fail: function () {
        that.show('定位失败')
      }
    })
  },
  /**
   * 获取我的钱包信息
   */
  getMyCardInfo: function () {
    var that = this
    network.shareSleepNetwork("wallet/month_card_info", {}, "GET", function complete(res) {
      console.log(res)

      if (wx.hideLoading) {
        wx.hideLoading()
      }
      if (res.data && res.data.ret == 0) {
        var card_info = res.data.month_card_info
        var cdate = utils.date('Y年m月d日', res.data.month_card_info.end_time)
        card_info.end_date = cdate
        that.setData({
          bougth_card: true,
          month_card_info: card_info
        })
      } else {
        that.setData({
          bougth_card: false
        })
      }
    }, that)
  },
})