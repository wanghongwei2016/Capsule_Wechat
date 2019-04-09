// pages/profit/profit.js


var request = require("../../utils/request.js").default


Page({

  /**
   * 页面的初始数据
   */
  data: {
    disabled: false,
    rule: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  closeRule: function() {
    this.setData({
      rule: false,
    });
  },
  openRule: function() {
    this.setData({
      rule: true,
    });
  },
  profitRecord: function() {
    wx.navigateTo({
      url: '/pages/profitRecord/profitRecord'
    })
  },
  submit: function() {
    request({
      url: '/api/withdraw/bonus',
      method: 'post',
      loading: true,
      data: {
        uin: wx.getStorageSync('localUserCache').uin
      },
      success: resp => {

      }
    });
  },
})