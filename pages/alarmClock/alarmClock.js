var app = getApp()
var network = require("../../utils/network.js")
var utils = require("../../utils/util.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    timeOrigin: '9:00',
    time: '9:00',
    clockChecked: false,
    time_info: '上午'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // toast组件实例
    new app.ToastPannel()

    this.checkAlarmClockData()

    this.setData({
      booking_id: Number(options.booking_id)
    })
  },
  /**
   * 如果用户设置了闹钟，存储健康数据标记
   */
  updateHealthReportCache: function (h, m, setAlarmClockType) {
    wx.getStorage({
      key: 'healthReportCache',
      success: function (res) {
        var obj = { hasSetAlarmClockData: true, h: h, m: m, setAlarmClockType: setAlarmClockType};
        var healthReport = Object.assign(res.data, obj)
        wx.setStorage({
          key: 'healthReportCache',
          data: healthReport,
          complete: function (res) {
            console.log(res)
          }
        })
      }
    })
  },
  /**
   * 当有闹钟缓存时展示数据
   */
  checkAlarmClockData: function () {
    try {
      var data = wx.getStorageSync('healthReportCache')
      console.log(data)
      if (data.hasSetAlarmClockData) {
        this.setData({
          timeOrigin: data.h + ':' + data.m,          
          time: (data.h > 12 ? (data.h - 12) : data.h === 0 ? 12 : data.h)+':'+data.m,
          clockChecked: data.setAlarmClockType === 'set' ? true : false,
          time_info: data.h + data.m >= 1200 ? '下午' : '上午',
        })
      }
    } catch (e) {
      // Do something when catch error
      console.log(e)
      this.show('未获取到缓存数据！')
    }
  },
  /**
   * 设置闹钟
   */
  setAlarmAction: function(){
    var that = this
    var h = Number(that.data.timeOrigin.split(':')[0])
    var mOrigin = that.data.timeOrigin.split(':')[1]
    var m = Number(that.data.timeOrigin.split(':')[1])
    network.shareSleepNetwork("capsule/set_alarm", { hour_data: h,minute_data: m, booking_id: that.data.booking_id ,set_flag: '1'}, "POST", function complete(res) {
      if (res.data.ret === 0) {
        that.updateHealthReportCache(h, mOrigin,'set')
        that.show('闹钟设置成功！')
      }
    }, that)
  },
  /**
   * 取消闹钟
   */
  cancleAlarmAction: function () {
    var that = this
    var h = Number(that.data.timeOrigin.split(':')[0])
    var mOrigin = that.data.timeOrigin.split(':')[1]
    network.shareSleepNetwork("capsule/set_alarm", { booking_id: that.data.booking_id, set_flag: '0' }, "POST", function complete(res) {
      if (res.data.ret === 0) {
        that.updateHealthReportCache(h, mOrigin, 'cancel')
        that.show('闹钟取消成功！')
      }
    }, that)
  },
  bindTimeChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    var h = Number(e.detail.value.split(':')[0]);
    var m = e.detail.value.split(':')[1]
    console.log(h)
    this.setData({
      time: h > 12 ? (h - 12) + ':' + m : (h === 0 ? 12 : h) + ':' + m,
      clockChecked: true,
      time_info: h+m >= 1200 ? '下午' : '上午',
      timeOrigin: e.detail.value
    })
    this.setAlarmAction()
  },
  switchChange: function (e) {
    console.log('switch2 发生 change 事件，携带值为', e.detail.value)
    if(e.detail.value){
      this.setAlarmAction()
    }else{
      this.cancleAlarmAction()
    }
  }
})