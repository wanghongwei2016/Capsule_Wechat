// orderList.js
var app = getApp()
var network = require('../../utils/network.js')
var utils = require("../../utils/util.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    order_data: [],
    group_data: [],
    last_id_order: '',
    last_id_group: '',
    list_type: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // this.getOrderList()
    // toast组件实例
    new app.ToastPannel();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.onPullDownRefresh()
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      last_id_order: '',
      last_id_group: ''
    })
    var that = this
    this.getOrderList(function beforBack() {
      that.setData({
        order_data: []
      })
    })
    this.getGroupList(function beforBack(res) {
      that.setData({
        group_data: []
      })
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.last_id_order.length > 0 && this.data.list_type == 0) {
      this.getOrderList()
    }
    if (this.data.last_id_group.length > 0 && this.data.list_type == 1) {
      this.getGroupList()
    }
  },
  // 拉取拼单列表
  getGroupList: function (beforBack) {
    var that = this
    if (wx.showLoading) {
      wx.showLoading({
        title: '订单拉取中',
      })
    }
    network.shareSleepNetwork("group/get_group_list", {}, "GET", function complete(res) {
      if (res.data && res.data.ret == 0) {
        that.setData({
          no_data_group: res.data.last_id ? false : true
        })
        if (wx.hideLoading) {
          wx.hideLoading()
        }
        if (wx.stopPullDownRefresh) {
          wx.stopPullDownRefresh()
        }
        if (beforBack) {
          beforBack(res.data.group_list_info)
          let infos = res.data.group_list_info
          var orders = []
          for (var index in infos) {
            var item = infos[index]
            //这里的时间还有待商量
            item.date = utils.date('Y-m-d h:i', item.create_time)
            orders[index] = item
          }


          that.setData({
            group_data: orders
          })
        }
      }
    })
  },

  /**
   * 拉取订单列表
   */
  getOrderList: function (beforBack) {
    var that = this
    if (wx.showLoading) {
      wx.showLoading({
        title: '订单拉取中',
      })
    }
    network.shareSleepNetwork("booking/bookinglist?last_id=" + that.data.last_id_order, {}, "GET", function complete(res) {
      that.setData({
        no_data_order: res.data.last_id ? false : true
      })
      if (wx.hideLoading) {
        wx.hideLoading()
      }
      if (wx.stopPullDownRefresh) {
        wx.stopPullDownRefresh()
      }
      if (beforBack) {
        beforBack()
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
      if (res.data.num > 0) {
        var old_bookings = that.data.order_data
        var tmp_arr = []
        if (res.data.num > 9) {
          tmp_arr = res.data.booking_infos.sort(by('create_time'))
        } else {
          tmp_arr = res.data.booking_infos
        }
        var booking_data = []

        for (var index in tmp_arr) {
          var item = tmp_arr[index]
          item.date = utils.date('Y-m-d h:i', item.create_time)
          booking_data[index] = item
        }
        that.setData({
          order_data: old_bookings.concat(booking_data),
          last_id: res.data.last_id_order ? res.data.last_id_order : ''
        })
      }
    }, that)
  },
  /**
   * 订单详情
   */
  orderAction: function (e) {
    console.log(e)
    var booking = this.data.order_data[e.target.dataset.id]
    if (booking.status == 1) {
      wx.navigateTo({
        url: '/pages/orderDetail/orderDetail?booking_id=' + booking.booking_id + '&create_time=' + booking.create_time + "&calculate_rule=" + booking.calculate_rule + "&capsule_id=" + booking.capsule_id + "&gate_capsule_id=" + booking.gate_capsule_id
      })
    } else if (booking.status == 2 || booking.status == 3) {
      var timeString = utils.timeShowString(booking.end_time - booking.create_time)
      wx.reLaunch({
        url: '/pages/orderPay/orderPay?time=' + timeString + '&final_price=' + booking.final_price + '&booking_id=' + booking['booking_id'] + "&status=" + booking.status + "&calculate_rule=" + booking.calculate_rule + "&capsule_id=" + booking.capsule_id + "&balance=" + booking.balance + "&need_charge=" + booking.need_charge + '&capsule_id_origin=' + booking.capsule_id + '&phone=' + app.globalData.localUserInfo.phone
      })
    } else {
      wx.navigateTo({
        url: '/pages/orderItem/orderItem?id=' + booking.booking_id,
      })

    }
  },
  // 拼单详情
  groupOrderDetail: function (e) {
    var group = this.data.group_data[e.target.dataset.id]

    wx.navigateTo({
      url: '/pages/groupbuy/groupbuy?group_id=' + group.group_id,
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  /**
   * 快去使用
   */
  goUseAction: function () {
    wx.reLaunch({
      url: '/pages/scanCode/scanCode',
    })
  },
  // 选择订单
  choosedAction: function (e) {
    this.setData({
      list_type: e.target.dataset.index
    })
  }
})