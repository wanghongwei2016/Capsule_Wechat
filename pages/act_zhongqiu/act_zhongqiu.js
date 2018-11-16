// pages/act_zhongqiu/act_zhongqiu.js

var network = require("../../utils/network.js")

var storageService = require('../../utils/storageService.js').default
var request = require('../../utils/request.js').default

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogin: false,
    countComplete: 0,
    isComplete: false,
    isExchange: false,
    cardMap: {},
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
    this.load();
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
    return {
      title: '中秋集卡赢百元红包——集齐卡片100%兑换现金红包。',
      path: `/pages/scanCode/scanCode?assignUrl=${encodeURIComponent('xiangshui:/pages/act_zhongqiu/act_zhongqiu')}`,
      imageUrl: 'https://s3.cn-north-1.amazonaws.com.cn/areaimgs/063BC21E431DD690C3EFE3A05FFA2598',
    }

  },


  gotoLogin: function () {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  },



  checkCard: function (card) {
    return this.data.cardMap[card];
  },

  exchange: function () {

    request({
      url: '/api/acitvity/get_mid_autumn_cash', loading: true,
      success: resp => {
        this.selectComponent('#redpModal').setData({
          show: true,
          title: '中秋集卡赢大奖',
          sub_title: '恭喜您获得红包',
          footer_text: '红包将在五分钟内自动放入「我的-钱包」',
          unit: '',
          prize_text: resp.cash / 100,
          fail: false,
        });
        this.load();
      }
    });

  },

  load: function () {

    if (storageService.getLocalUserCache()) {
      this.setData({
        isLogin: true
      });
      request({
        url: '/api/acitvity/get_mid_autumn_card_list', loading: true,
        success: (resp) => {
          let countComplete = resp.success_num || 0;
          let isExchange = resp.status == 1;
          let cardList = resp.card_list || [];
          let cardMap = {};
          cardList.map(card => {
            cardMap[card] = true;
          });
          let isComplete = cardMap['中'] && cardMap['秋'] && cardMap['节'] && cardMap['快'] && cardMap['乐'] ? true : false;
          this.setData({
            countComplete,
            isExchange,
            cardMap,
            isComplete,
          });
        }
      });
    }
  }

})