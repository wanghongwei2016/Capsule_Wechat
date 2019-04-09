// deposit.js
var app = getApp()
var network = require('../../utils/network.js')
var utils = require("../../utils/util.js")
Page({
  /**
   * 页面的初始数据
   */
  data: {
    balance: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // toast组件实例
    new app.ToastPannel();
    this.setData({
      balance: options.balance != 0 ? options.balance : 0
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    network.shareSleepNetwork("user/info", {}, "GET", function complete(res) {
      var balance = res.data.user_info.balance > 0 ? res.data.user_info.balance : 0;
      that.setData({
        balance: balance / 100
      })
    },that)
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
    wx.navigateTo({
      url: '/pages/myWallet/myWallet?is_mine_page=1'
    })
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