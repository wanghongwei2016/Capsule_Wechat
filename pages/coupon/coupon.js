// coupon.js
var app = getApp()
var network = require("../../utils/network.js")
var utils = require("../../utils/util.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    coupon_list: [],
    last_id:'',
    select_coupon_id:0,
    type:2
    },
  /**
   * 生命周期函数--监听页面加载
   */

  onLoad: function(options) {
    if (options.type) {
      wx.setNavigationBarTitle({
        title: '优惠券',
      })
      this.setData({
        type:options.type
      })
    }
  },

  onShow: function () {
    this.pullCouponList()
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      last_id:''
    })
    this.pullCouponList()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.pullCouponList()
  },
  /**
   * 选中优惠券
   */
  selectCouponAction: function (e) {
    console.log(e)
    this.setData({
      select_coupon_id: e.target.dataset.id
    })
  },
  /**
   * 兑换优惠券
   */
  exchangeCouponAction: function() {
    wx.navigateTo({
      url: '../couponExchange/couponExchange',
    })
  },
  /**
   * 拉取优惠券列表
   */
  pullCouponList: function() {
    var that = this
    //type :1 全部的，2 未使用的，3已使用的,4 已失效的

    network.shareSleepNetwork("wallet/"+this.data.type+"/get_coupon_list", {}, 'GET', function complete(res) {
      if(wx.stopPullDownRefresh){
        wx.stopPullDownRefresh()
      }
      console.log(res.data.coupon_list_info)
      var coupons = []
      for (var i in res.data.coupon_list_info) {
        var item = res.data.coupon_list_info[i]
        item.end_date = utils.date("Y.m.d", item.validity_time)
        coupons.push(item)
      }
      that.setData({
        coupon_list: coupons,
        // last_id: res.data.last_id
      })
    },that)
  },
  // 查看过期优惠券
  checkPassCouponsAction: function() {
    wx.navigateTo({
      url: '/pages/coupon/coupon?type=4',
    })
  }
})