// pages/act_make_money/act_make_money.js

let recordList = [];
for (let i = 0; i < 30; i++) {
  recordList.push({
    nickName: `用户${Math.floor(Math.random() * 9000 + 1000)}`,
    price: i > 0 && Math.random() < .3 ? 1000 : 200,
  });
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    animationData: {},
    recordList: recordList,
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
    wx.createSelectorQuery().select('#animationBox').boundingClientRect(rect => {
      let animation = wx.createAnimation();
      for (let i = 1; i <= 10 - 1; i++) {
        animation.translate(1, rect.height * i * -1).step({
          timingFunction: 'ease',
          duration: 1500,
          delay: 1000,
        });
      }
      this.setData({
        animationData: animation.export()
      })
    }).exec();
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
    return {
      title: '现金拿去花，不仅免费休息，还有奖金拿。',
      path: `/pages/scanCode/scanCode?assignUrl=${encodeURIComponent('xiangshui:/pages/act_make_money/act_make_money')}`,
      imageUrl: 'https://s3.cn-north-1.amazonaws.com.cn/areaimgs/E55C83C2BC8B3198CFAE1328959F1C7E',
    }

  },
  gotoActPage: function() {
    wx.navigateTo({
      url: '/pages/card/card',
    })
  }
})