// pages/profit/profit.js


var request = require("../../utils/request.js").default

function getUserInfo(page) {
  request({
    url: '/api/user/info',
    success: resp => {
      wx.setStorageSync('userInfo', resp.user_info || null);
      if (page) {
        page.setData({
          userInfo: resp.user_info || null
        });
      }
    }
  });
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    rule: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    getUserInfo(this);

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
        if (resp.ret == 0 && resp.result_code == 'SUCCESS') {
          wx.showToast({
            title: `提现成功，提现金额稍后到您的微信钱包里`,
            icon: 'none',
          });
          request.loadUserInfo(this);
        } else if (resp.ret == 0) {
          wx.showToast({
            title: `提现失败:${resp.return_msg}`,
            icon: 'none',
          });
        } else {
          wx.showToast({
            title: `提现失败`,
            icon: 'none',
          });
        }
      }
    });
  },
})