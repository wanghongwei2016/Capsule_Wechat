// pages/groupbuy/groupbuy.js
var app = getApp()
var network = require('../../utils/network.js')
var utils = require("../../utils/util.js")
Page({

  /**
   * 页面的初始数据 group_status
   * GROUP_INIT               = 0; //初始化团购信息
    GROUP_START              = 1; //开团中
    GROUP_SUEESS             = 2; //团购成功
    GROUP_FAILE              = 3; //开团失败
   */
  data: {
    invite_code:100000,
    members:[],
    group_price:0,
    is_grouped:false,
    group_left:72*60*60
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // toast组件实例
    new app.ToastPannel();
    this.getLocation()
    if (options.uin) {
      this.setData({
        invite_code: options.uin
      })
    }
    // 如果用户未登录，跳转注册页面
    if (app.globalData.localUserInfo.uin === 100000) {
      wx.navigateTo({
        url: '../newInvite/newInvite?uin=' + this.data.invite_code+'&type=4'
      })
    }
    if (options.booking_id && options.booking_id != "undefined") {
      this.setData({
        booking_id:options.booking_id
      })
    }
    if (options.group_id && options.group_id != "undefined") {
      this.setData({
        group_id: options.group_id
      })
    }

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
    clearInterval()
    this.getMyGroupCardInfo()
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
  onShareAppMessage: function (res) {
    if (res.from === "button") {
      console.log(res.target);
    }
    return {
      title: "【仅剩" + (this.data.group_info.group_amount - this.data.members_uin.length) + "个名额】我用" + this.data.group_price+"元拼了\n【自助休息月卡一张】",
      path: '/pages/scanCode/scanCode?group=1&group_id=' + this.data.group_info.group_id + '&uin=' + app.globalData.localUserInfo.uin,
      imageUrl: '/images/group_share_' + this.data.group_info.group_amount +'.png'
    }
  },
// 倒计时
  timeReCount: function() {
    var that = this
    if (this.data.timer){
      clearInterval(this.data.timer)
    }

    function timeKeeper() {
      if (that.data.group_left == 1) {
        that.getMyGroupCardInfo()
      }
      var timeShow = utils.timeShowString(that.data.group_left);
      that.setData({
        count_show: timeShow,
        hour_one: timeShow.substring(0, 1),
        hour_two: timeShow.substring(1, 2),
        minete_one: timeShow.substring(3, 4),
        minete_two: timeShow.substring(4, 5),
        second_one: timeShow.substring(6, 7),
        second_two: timeShow.substring(7, 8),
        group_left: that.data.group_left - 1
      })
    }
    if (that.data.group_left > 0) {
      var timer = setInterval(function () {
        timeKeeper()
      }, 1000)
      this.setData({
        timer: timer
      })
    }
    else if(that.data.group_info.group_status == 1){ //后台bug 参团剩余时间已经为0  仍然团购仍在进行中，这里需要人为判断一下，如果时间为0   做失败处理
      that.setData({
        status: 3
      })
      wx.hideShareMenu({})
    }
  },

  //拉取我的月卡拼团单号
  getMyGroupCardInfo: function () {
    var that = this
    var api = "group/" + this.data.booking_id + "/get_group_info?type=1"
    if (this.data.group_id && this.data.group_id > 0) {
      api = "group/" + this.data.group_id + "/get_group_info?type=2"
    }
    network.shareSleepNetwork(api, {}, "GET", function (res) {
      if (res.data && res.data.ret == 0) {
        var members_uin = res.data.group_info.uin_list

        
        // 判断是否已经参团
        let my_uin = app.globalData.localUserInfo.uin
        
        var members = []
        for (var i = 0; i < res.data.group_info.group_amount;i++){
          var info = { isFirst: ((members_uin.length >= (i + 1) && members_uin[i] == res.data.group_info.group_master) ? true : false), uin: members_uin.length >= (i + 1) ? members_uin[i]:0}
          members[i] = info
          if (members_uin && members_uin.length >= (i + 1) && members_uin[i] == my_uin){
            that.setData({
              is_grouped: true
            })
          }
        }
        let price_info = {2:39.8,3:34.8,5:29.8}
        that.setData({
          group_info: res.data.group_info,
          group_left: res.data.group_info.left_datetime,
          members:members,
          members_uin: members_uin,
          status: res.data.group_info.group_status,
          group_price: price_info[res.data.group_info.group_amount],
        })

        if (res.data.group_info.left_datetime > 0) {
          that.timeReCount()

        } else  {
          if (res.data.group_info.group_status == 1) { //后台bug 参团剩余时间已经为0  仍然团购仍在进行中，这里需要人为判断一下，如果时间为0   做失败处理
          that.setData({
            status: 3
          })
        }
           wx.hideShareMenu({})
        }
      }
    })
  },
  // 立即参团
  addRightNowAction:function() {
    // 如果用户未登录，跳转注册页面
    if (app.globalData.localUserInfo.uin === 100000) {
      wx.navigateTo({
        url: '../newInvite/newInvite?uin=' + this.data.invite_code + '&type=4'
      })
    } else {
      this.groupbuyNowAction()

    }
  },
  // 再开一团
  openGroupbuyAction:function() {
    wx.navigateTo({
      url: '/pages/card/card',
    })
  },
  //团购
  groupbuyNowAction: function () {
    var that = this
    var loc = { group_id: this.data.group_info.group_id, group_type: 1000, group_amount: this.data.group_info.group_amount }
    if (!isNaN(this.data.location.latitude)) {
      // loc += {
      loc.latitude = parseInt(parseFloat(this.data.location.latitude) * 1000000),
        loc.longitude = parseInt(parseFloat(this.data.location.longitude) * 1000000)
      // }
    }
    if (wx.showLoading) {
      wx.showLoading({
        title: "",
        duration: 2000
      })
    }
    network.shareSleepNetwork("group/start_group_buy", loc, "POST", function (res) {
      if (wx.hideLoading) {
        wx.hideLoading()
      }
      if(res.data && res.data.ret == 0) {
        //月卡团购请求支付
        wx.requestPayment({
          timeStamp: res.data.wechat_pay_info['timeStamp'],
          nonceStr: res.data.wechat_pay_info['nonceStr'],
          package: res.data.wechat_pay_info['package'],
          signType: res.data.wechat_pay_info['signType'],
          paySign: res.data.wechat_pay_info['paySign'],
          complete: function (result) {
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
              that.getMyGroupCardInfo()
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
      }else if(res.data.ret == -3110) {
        that.setData({
          status: 3
        })
        wx.hideShareMenu({})
      }
    },that)
  },
  /**
    * 获取定位
    */
  getLocation: function () {
    var that = this;
    //获取定位
    wx.getLocation({
      success: function (res) {
        console.log('获取定位')
        console.log(res)
        var loc = utils.convert_GCJ02_To_BD09(res.latitude, res.longitude)
        console.log(loc)
        that.setData({
          location: loc
        })
      },
      fail: function () {
        that.show('定位失败')
      }
    })
  },
})