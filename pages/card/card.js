// pages/card/card.js
var app = getApp()
var network = require('../../utils/network.js')
var utils = require("../../utils/util.js")
var request = require("../../utils/request.js").default


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
    notice_padding_left_step: 10,
    notice_padding_left_max: 100,
    notice_padding_left: 0,

    showNoticeModal: false,
    invite_code: 100000,
    rules_hide: true,
    group_rules_hide: true,
    bougth_card: false,
    firstShow: false, //是否是第一次进来
    page_from: 0, // 1 从订单详情过来
    card_info: {
      activity_body: "49.8元/月",
      activity_title: "特惠中",
      discount_price: 3000,
      original_price: 30000
    },
    invite_bonus: app.globalData.config.invite_bonus == 0 || app.globalData.config.invite_bonus ? app.globalData.config.invite_bonus / 100 : app.globalData.configDefault.invite_bonus / 100,
    group_buy: [{
        count: 2,
        price: 39.8,
        status: 0
      },
      {
        count: 3,
        price: 34.8,
        status: 0
      },
      {
        count: 5,
        price: 29.8,
        status: 0
      },
    ],
    mom: 3,
  },

  bindSelect: function(event) {
    this.setData({
      mom: event.currentTarget.dataset.mom
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    setInterval(() => {
      if (this.data.notice_padding_left >= this.data.notice_padding_left_max) {
        this.setData({
          notice_padding_left: 0,
        });
      } else {
        this.setData({
          notice_padding_left: this.data.notice_padding_left + 1,
        });
      }
    }, 1000 / 30);

    // toast组件实例
    new app.ToastPannel();
    this.getCardInfo()
    this.getLocation()
    console.log(options)
    // if(options.length > 0){
    this.setData({
      bougth_card: (options.bougth_card == "true" ? true : false),
      month_card_info: {
        card_no: options.card_no,
        end_date: options.end_date
      }
    })
    if (options.uin) {
      this.setData({
        invite_code: options.uin
      })
    }
    if (options.page_from) {
      this.setData({
        page_from: options.page_from
      })
    }
    // }
    // 如果用户未登录，跳转注册页面
    if (app.globalData.localUserInfo.uin === 100000) {
      wx.navigateTo({
        url: '../newInvite/newInvite?uin=' + this.data.invite_code + '&type=4'
      })
      return
    } else { //如果是从分享或者扫码进入月卡购买页面 拉取用户月卡信息 if(options.share == 1)
      this.getMyCardInfo()
    }
    this.notice();
  },


  notice: function() {

    request({
      url: '/api/wallet/activity_list',
      success: resp => {
        this.setData({
          notice_title: resp.activity_title,
          notice_link: resp.activity_url,
          notice_padding_left_max: (resp.activity_title ? resp.activity_title.length : 0) * this.data.notice_padding_left_step,
        });
      }
    });
  },


  navigateBackFunc: function(ret, auto) {
    var pages = getCurrentPages()
    var prevPage = pages[pages.length - 2];
    var that = this;
    console.log("pre page is " + prevPage)
    console.log(prevPage.data)
    prevPage.setData({
      showed_buy_card: ret
    })
    if (ret == 3) {
      prevPage.setData({
        auto_end: auto
      })
    }
    console.log(prevPage.data)

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    // this.showNoticeModal();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

    if (!this.data.bougth_card && this.data.page_from && this.data.page_from == 1) {
      this.navigateBackFunc(2, false)
    }
    this.getGroupBuyingInfo()
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
  onShareAppMessage: function(res) {
    if (res.from === "button") {
      console.log(res.target);
    }
    return {
      title: "您的自助休息空间+健康加油站",
      path: '/pages/scanCode/scanCode?card=1&uin=' + app.globalData.localUserInfo.uin,
      imageUrl: 'https://s3.cn-north-1.amazonaws.com.cn/areaimgs/395916227E0EC431DB022B62AA6CEDB0'
    }
  },
  /**
   * 去支付，购买月卡
   */

  buyAction: function() {
    if (this.data.mom == 1) {
      this.buy1();
    } else if (this.data.mom == 3) {
      this.buy3();
    }
  },
  buy1: function() {
    // 如果用户未登录，跳转注册页面
    if (app.globalData.localUserInfo.uin === 100000) {
      wx.navigateTo({
        url: '../newInvite/newInvite?uin=' + this.data.invite_code + '&type=4'
      })
      return
    }
    console.log("去购买")

    var that = this
    var loc = {}
    if (that.data.location && !isNaN(that.data.location.latitude)) {
      loc = {
        latitude: parseInt(parseFloat(that.data.location.latitude) * 1000000),
        longitude: parseInt(parseFloat(that.data.location.longitude) * 1000000)
      }
    }
    network.shareSleepNetwork("wallet/month_card", loc, "POST", function complete(res) {
      if (wx.hideLoading) {
        wx.hideLoading()
      }
      if (res.data && res.data.ret == 0) {
        console.log(res)
        //月卡请求支付
        wx.requestPayment({
          timeStamp: res.data.wechat_pay_info['timeStamp'],
          nonceStr: res.data.wechat_pay_info['nonceStr'],
          package: res.data.wechat_pay_info['package'],
          signType: res.data.wechat_pay_info['signType'],
          paySign: res.data.wechat_pay_info['paySign'],
          complete: function(result) {
            console.log(that.data.is_mine_page)
            if (result.errMsg == "requestPayment:ok") { //支付成功
              that.getGroupBuyingInfo()
              //设置上一个页面是否继续弹框
              if (that.data.page_from == 1) {
                that.navigateBackFunc(3, true)
              }
              if (that.data.booking_id > 0) {
                var pages = getCurrentPages()
                var booking_page = pages[pages.length - 2]
                booking_page.setData({
                  need_update: 1
                })
              }
              wx.navigateBack({
                delta: 1,
                success: function() {
                  that.show('购买成功');
                  that.setData({
                    bougth_card: true,
                  })

                }
              })
            } else if (result.errMsg == "requestPayment:fail cancel") { //支付取消
              that.show('取消购买');
            } else { //支付失败
              that.show('购买失败，请重试，或者联系客服反馈');
            }
          }
        })
      }
    }, that);
  },
  buy3: function() {
    // 如果用户未登录，跳转注册页面
    if (app.globalData.localUserInfo.uin === 100000) {
      wx.navigateTo({
        url: '../newInvite/newInvite?uin=' + this.data.invite_code + '&type=4'
      })
      return
    }
    console.log("去购买")

    var that = this
    var loc = {}
    if (that.data.location && !isNaN(that.data.location.latitude)) {
      loc = {
        latitude: parseInt(parseFloat(that.data.location.latitude) * 1000000),
        longitude: parseInt(parseFloat(that.data.location.longitude) * 1000000)
      }
    }
    network.shareSleepNetwork("wallet/season_card", loc, "POST", function complete(res) {
      if (wx.hideLoading) {
        wx.hideLoading()
      }
      if (res.data && res.data.ret == 0) {
        console.log(res)
        //月卡请求支付
        wx.requestPayment({
          timeStamp: res.data.wechat_pay_info['timeStamp'],
          nonceStr: res.data.wechat_pay_info['nonceStr'],
          package: res.data.wechat_pay_info['package'],
          signType: res.data.wechat_pay_info['signType'],
          paySign: res.data.wechat_pay_info['paySign'],
          complete: function(result) {
            console.log(that.data.is_mine_page)
            if (result.errMsg == "requestPayment:ok") { //支付成功
              that.getGroupBuyingInfo()
              //设置上一个页面是否继续弹框
              if (that.data.page_from == 1) {
                that.navigateBackFunc(3, true)
              }
              if (that.data.booking_id > 0) {
                var pages = getCurrentPages()
                var booking_page = pages[pages.length - 2]
                booking_page.setData({
                  need_update: 1
                })
              }
              wx.navigateBack({
                delta: 1,
                success: function() {
                  that.show('购买成功');
                  that.setData({
                    bougth_card: true,
                  })

                }
              })
            } else if (result.errMsg == "requestPayment:fail cancel") { //支付取消
              that.show('取消购买');
            } else { //支付失败
              that.show('购买失败，请重试，或者联系客服反馈');
            }
          }
        })
      }
    }, that);
  },
  getCardInfo: function() {
    var that = this
    network.shareSleepNetwork("wallet/month_card_activity_info", {}, "GET", function complete(res) {
      if (wx.hideLoading) {
        wx.hideLoading()
      }
      if (res.data && res.data.ret == 0) {
        that.setData({
          card_info: res.data
        })
      }
    }, that)
  },
  toggleRulesAction: function(e) {
    if (e.target.dataset.type == 1) {
      this.setData({
        rules_hide: !this.data.rules_hide
      })
    } else if (e.target.dataset.type == 2) {
      this.setData({
        group_rules_hide: !this.data.group_rules_hide
      })
    }

  },
  /**
   * 获取定位
   */
  getLocation: function() {
    var that = this;
    //获取定位
    wx.getLocation({
      success: function(res) {
        console.log('获取定位')
        console.log(res)
        var loc = utils.convert_GCJ02_To_BD09(res.latitude, res.longitude)
        console.log(loc)
        that.setData({
          location: loc
        })
      },
      fail: function() {
        that.show('定位失败')
      }
    })
  },
  /**
   * 获取我的钱包信息
   */
  getMyCardInfo: function() {
    var that = this
    network.shareSleepNetwork("wallet/month_card_info", {}, "GET", function complete(res) {
      console.log(res)

      if (wx.hideLoading) {
        wx.hideLoading()
      }
      if (res.data && res.data.ret == 0) {
        var card_info = res.data.month_card_info
        var cdate = utils.date('Y年m月d日', res.data.month_card_info.end_time)
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
  //团购
  groupbuyNowAction: function(e) {
    var index = e.target.dataset.index
    var item = this.data.group_buy[index]
    var that = this
    var loc = {
      group_id: 0,
      group_type: 1000,
      group_amount: item.count
    }
    if (!isNaN(that.data.location.latitude)) {
      // loc += {
      loc.latitude = parseInt(parseFloat(that.data.location.latitude) * 1000000),
        loc.longitude = parseInt(parseFloat(that.data.location.longitude) * 1000000)
      // }
    }
    if (wx.showLoading) {
      wx.showLoading({
        title: "",
        duration: 2000
      })
    }
    network.shareSleepNetwork("group/start_group_buy", loc, "POST", function(res) {
      if (wx.hideLoading) {
        wx.hideLoading()
      }
      //月卡团购请求支付
      wx.requestPayment({
        timeStamp: res.data.wechat_pay_info['timeStamp'],
        nonceStr: res.data.wechat_pay_info['nonceStr'],
        package: res.data.wechat_pay_info['package'],
        signType: res.data.wechat_pay_info['signType'],
        paySign: res.data.wechat_pay_info['paySign'],
        complete: function(result) {
          // complete
          console.log(that.data.is_mine_page)
          if (result.errMsg == "requestPayment:ok") {
            item.status = 1
            var array = that.data.group_buy
            array[index] = item
            that.setData({
              booking_id: res.data.booking_id,
              group_buy: array
            })
            // 月卡购买成功，跳转参团页面
            wx.navigateTo({
              url: '/pages/groupbuy/groupbuy?booking_id=' + res.data.booking_id,
              success: function(res) {},
              fail: function(res) {},
              complete: function(res) {},
            })
          } else if (result.errMsg == "requestPayment:fail cancel") {
            that.show('取消购买');
            // wx.showToast({
            //   title: '支付取消',
            // })
          } else {
            that.show('购买失败，请重试，或者联系客服反馈');
            // wx.showToast({
            //   title: '充值失败，请重试，或者联系客服反馈',
            // })
          }
        }
      })
    }, that)
  },

  //跳转开团详情页面
  groupInfoAction: function(e) {
    var index = e.target.dataset.index
    var item = this.data.group_buy[index]
    var path = (item.id > 0 ? "group_id=" + item.id : "booking_id=" + this.data.booking_id)
    wx.navigateTo({
      url: '/pages/groupbuy/groupbuy?' + path,
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  // 月卡 团购拼团中
  getGroupBuyingInfo: function() {
    var that = this
    network.shareSleepNetwork("group/1000/get_group_detail", {}, "GET", function(res) {
      if (res.data && res.data.ret == 0) {
        var infos = res.data.group_list_info
        var group_buy = that.data.group_buy
        let my_uin = app.globalData.localUserInfo.uin

        for (var i = 0; i < group_buy.length; i++) {
          var group_info = group_buy[i]
          group_info.status = 0
          group_info.id = 0
          for (var j = 0; infos && j < infos.length; j++) {
            var item = infos[j]
            if (item.group_amount == group_info.count && my_uin == item.group_master) {
              group_info.status = item.group_status
              group_info.id = item.group_id
              break;
            }
          }
          group_buy[i] = group_info
        }
        that.setData({
          group_buy: group_buy
        })
      }
    }, that)
  },
  showNoticeModal: function() {
    this.setData({
      showNoticeModal: true
    })
  },
  hideNoticeModal: function() {
    this.setData({
      showNoticeModal: false
    })
  },
})