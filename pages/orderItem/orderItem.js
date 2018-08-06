// orderItem.js
var app = getApp()
var network = require('../../utils/network.js')
var utils = require("../../utils/util.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    booking: {},
    booking_id:0,
    calculate_rule:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    // toast组件实例
    new app.ToastPannel();
    this.setData({
      booking_id:options.id
    })
    this.queryBookingDetail()
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
   * 查询订单详情
   */
  queryBookingDetail: function () {
    var that = this
    if (wx.showLoading) {
      wx.showLoading({
        title: '订单更新中',
      })
    }
    network.shareSleepNetwork("booking/bookingid/" + this.data.booking_id, {}, "GET", function complete(res) {
      if(wx.hideLoading){
        wx.hideLoading()
      }
      var order =  res.data.booking_info
      order.time = utils.timeShowString(parseInt(order.end_time) - parseInt(order.create_time))
      order.date = utils.date('Y-m-d H:i', order.create_time)
      order.capsule_id = String(order.capsule_id).substring(7,10)
      order.area_title = order.area_title.length > 15 ? order.area_title.substring(0, 15) + '...' : order.area_title
      that.setData({
        booking: order,
        calculate_rule: res.data.calculate_rule ? res.data.calculate_rule:"",
        balance:res.data.balance,
        need_charge:res.data.need_charge,
        coupon_cash: res.data.booking_info.coupon_cash ? res.data.booking_info.coupon_cash / 100 : 0

      })
    },that)
  },
  /**
   * 查询区域详情
   */
  areaDetailAction: function (e) {
    console.log(e.target.dataset.id)
    if (e.target.dataset.id && e.target.dataset.id > 0){
      wx.navigateTo({
        url: '/pages/areaInfo/areaInfo?area_id=' + e.target.dataset.id + "&title=" + this.data.booking.area_title,
      })
    }
  }
})