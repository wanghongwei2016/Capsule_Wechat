// couponExchange.js
var network = require('../../utils/network.js')
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    coupon_id:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // toast组件实例
    new app.ToastPannel();
    // 如果用户未登录，跳转注册页面
    if (app.globalData.localUserInfo.uin === 100000) {
      wx.navigateTo({
        url: '../newInvite/newInvite?uin=100000&type=5'
      })
      return
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
   * 优惠券输入
   */
  couponIdInput: function (e) {
      this.setData({
        coupon_id: e.detail.value
      })
  },
  /**
   * 兑换优惠券
   */
  exchangeAction: function () {
    var that = this
    if (that.data.coupon_id.length == 0) {
      that.show('兑换码不能为空');
      // wx.showToast({
      //   title: '兑换码不能为空',
      // })
    } else {
      if (wx.showLoading) {
        wx.showLoading({
          title: '兑换中',
        })
      }
      network.shareSleepNetwork("coupon/exchange", { 'phone': app.globalData.localUserInfo.phone , 'uin': app.globalData.localUserInfo.uin, 'coupon_id': that.data.coupon_id }, 'POST', function complete(res) {
        if (wx.hideLoading){
          wx.hideLoading()
        }
        that.show('兑换成功');
        wx.navigateBack({
          delta: 1
        })
        // wx.showToast({
        //   title: '兑换成功',
        //   success: function(res){
        //     wx.navigateBack({
        //       delta:1
        //     })
        //   }
        // })
      },that)
    }
  }
})