// pages/depositList/depositList.js
var app = getApp()
var network = require('../../utils/network.js')
var utils = require("../../utils/util.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    charge_data: [],
    last_id: '',
    type: 1,
    loadingText: '',
    isBalance: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // this.getChargeList()
    // toast组件实例
    new app.ToastPannel();
    this.setData({
      type: options.type
    })
    var loadingText = '';
    var isBalance = true;
    var title = '充值明细';
    if (this.data.type == 1) {
      loadingText = '押金明细拉取中';
      isBalance = false;
      title = '押金明细';
    } else if (this.data.type == 2) {
      loadingText = '充值明细拉取中';
      isBalance = true;
      title = '充值明细';
    }
    wx.setNavigationBarTitle({
      title: title,
    })
    this.setData({
      loadingText: loadingText,
      isBalance: isBalance
    })
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
    this.onPullDownRefresh()
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
    var that = this
    this.setData({
      last_id: ''
    })
    this.getChargeList(function beforeBack() {
      that.setData({
        charge_data: []
      })
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.last_id.length > 0) {
      this.getChargeList()
    }
  },
  /**
   * 拉取充值明细
   */
  getChargeList: function (beforeBack) {
    var that = this
    if (wx.showLoading) {
      wx.showLoading({
        title: that.data.loadingText,
      })
    }
    network.shareSleepNetwork("booking/chargebookinglist?last_id=" + that.data.last_id, { type: parseInt(that.data.type) }, "GET", function complete(res) {
      that.setData({
        no_data: res.data.last_id ? false : true
      })
      if (wx.hideLoading) {
        wx.hideLoading()
      }
      if (wx.stopPullDownRefresh) {
        wx.stopPullDownRefresh()
      }
      if (beforeBack) {
        beforeBack()
      }
      var by = function (name, minor) {
        return function (o, p) {
          var a, b;
          if (o && p && typeof o === 'object' && typeof p === 'object') {
            a = o[name];
            b = p[name];
            if (a === b) {
              return typeof minor === 'function' ? minor(o, p) : 0;
            }
            if (typeof a === typeof b) {
              return a > b ? -1 : 1;
            }
            return typeof a > typeof b ? -1 : 1;
          } else {
            thro("error");
          }
        }
      }
      if (res.data.booking_infos && res.data.booking_infos.length > 0) {
        var old_bookings = that.data.charge_data

        var tmp_arr = []
        if (res.data.booking_infos.length > 9) {
          tmp_arr = res.data.booking_infos.sort(by('create_time'))
        } else {
          tmp_arr = res.data.booking_infos
        }
        console.log(tmp_arr)
        var booking_data = []
        for (var i = 0; i < tmp_arr.length; i++) {
          var item = tmp_arr[i]
          console.log(item.subject)
          item.date = utils.date('Y-m-d h:i', item.create_time)
          booking_data[i] = item
        }
        // for (var index in res.data.booking_infos) {
        //   var item = res.data.booking_infos[index]
        //   console.log(item.subject)
        //   item.date = utils.date('Y-m-d h:i', item.create_time)
        //   booking_data[index] = item
        // }
        that.setData({
          charge_data: old_bookings.concat(booking_data),
          last_id: res.data.last_id ? res.data.last_id : ''
        })
      }
    },that)
  },
  /**
   * 立即充值
   */
  goUseAction: function () {
    wx.redirectTo({
      url: '/pages/myWallet/myWallet',
    })
  },
  /**
   * 缴纳押金
   */
  payDepositAction: function (){
    console.log(11)
    wx.redirectTo({
      url: '/pages/depositPay/depositPay',
    })
  }
})