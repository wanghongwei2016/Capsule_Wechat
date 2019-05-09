// pages/notice_month_card/notice_month_card.js



function openActionLink(actionlink) {
  if (!actionlink) return;
  if (/^xcx:.+$/.test(actionlink)) {
    wx.navigateTo({
      url: actionlink.substring('xcx:'.length),
    })
  } else if (/^https:.+$/.test(actionlink)) {
    wx.navigateTo({
      url: `/pages/webView/webView?url=${encodeURIComponent(actionlink)}`,
    })
  } else if (/^article:.+$/.test(actionlink)) {
    wx.navigateTo({
      url: `/pages/article/article?article_id=${actionlink.substring('article:'.length)}`,
    })
  }
}


function bindOpenActionLink(event) {
  openActionLink(event.currentTarget.dataset.link);
}


Page({
  bindOpenActionLink,

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})