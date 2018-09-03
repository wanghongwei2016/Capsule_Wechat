// deposit.js
var app = getApp()
var network = require('../../utils/network.js')
var utils = require("../../utils/util.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    deposit: 0,
    deposit_total: 0,
    deposit_pay_text: "未交",
    deposit_text_placeholder: "押金可秒退",
    balance: 0,
    bougth_card: false //是否已经购买月卡
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // toast组件实例
    new app.ToastPannel();
    //获取月卡信息
    this.getCardInfo()
    this.setData({
      deposit: options.deposit > 0 ? options.deposit : 0,
      deposit_total: options.deposit_total,
      balance: options.balance != 0 ? options.balance : 0
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getMineInfo();
    this.getMyCardInfo();
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
    this.getMineInfo();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  /**
   * 立即抢购
   */
  cardBuyAction: function () {
    if (this.data.bougth_card) {
      wx.navigateTo({
        url: '/pages/card/card?bougth_card=' + this.data.bougth_card + "&card_no=" + this.data.month_card_info.card_no + "&end_date=" + this.data.month_card_info.end_date,
      })
    } else {
      wx.navigateTo({
        url: '/pages/card/card?bougth_card=' + this.data.bougth_card,
      })
    }

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
   * 押金操作
   */
  depositAction: function () {
    if (this.data.deposit < this.data.deposit_total) {
      wx.navigateTo({
        url: '/pages/depositPay/depositPay?deposit=' + (parseFloat(this.data.deposit_total) - parseFloat(this.data.deposit)).toFixed(2),
      })
    } else if (this.data.deposit >= this.data.deposit_total) {
      wx.showModal({
        content: '请拨打客服电话400-688-9960进行押金退还。',
        confirmText: "拨打客服",
        success: function (res) {
          if (res.confirm) {
            utils.callService()
          }
        }
      })
    }
  },
  /**
   * 充值明细
   */
  chargeDetailAction: function (e) {
    wx.navigateTo({
      url: '/pages/depositList/depositList',
    })
  },
  /**
   * 拉取我的信息
   */
  getMineInfo: function () {
    var that = this
    if (wx.showLoading) {
      wx.showLoading({
        title: '我的钱包拉取中',
      })
    }
    network.shareSleepNetwork("user/info", {}, "GET", function complete(res) {
      console.log(res)
      if (wx.hideLoading) {
        wx.hideLoading()
      }
      if (wx.stopPullDownRefresh) {
        wx.stopPullDownRefresh()
      }
      var deposit = res.data.user_info.deposit > 0 ? res.data.user_info.deposit : 0;
      var balance = res.data.user_info.balance > 0 ? res.data.user_info.balance : 0;
      that.setData({
        deposit: deposit / 100,
        deposit_total: res.data.standard_deposit / 100,
        balance: balance / 100
      })
      var text = "未交"
      var placeholder = "押金可秒退"
      if (that.data.deposit == 0) {
        var text = "未交"
      } else if (that.data.deposit > 0 && that.data.deposit < that.data.deposit_total) {
        text = "不足"
        placeholder = "您的押金不足，为了不影响您的正常使用，请补交押金"
      } else if (that.data.deposit >= that.data.deposit_total) {
        text = "已交"
        // placeholder = "押金"+this.data.deposit+"元，"
      }
      that.setData({
        deposit_pay_text: text,
        deposit_text_placeholder: placeholder
      })
    }, that)
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
        var card_info = res.data.month_card_info;
        let cdate;
        if (res.data.month_card_info.end_time * 1000 - new Date().getTime() <= 1000 * 60 * 60 * 24 * 5) {
          cdate = `当前月卡使用天数还剩${Math.ceil((res.data.month_card_info.end_time * 1000 - new Date().getTime()) / (1000 * 60 * 60 * 24))}天`;
        } else {
          cdate = `有效期至${utils.date('Y年m月d日', res.data.month_card_info.end_time)}`;
        }

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
  getCardInfo: function () {
    var that = this
    network.shareSleepNetwork("wallet/month_card_activity_info", {}, "GET", function complete(res) {

      if (res.data && res.data.ret == 0) {
        that.setData({
          card_info: res.data
        })
      }
    }, that)
  }
})