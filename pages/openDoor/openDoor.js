//openDoor.js
var network = require("../../utils/network")
var utils = require("../../utils/util.js")
var app = getApp()
Page({
  data: {
    progress: 1,
    openStatus: "解锁中",
    timer: '',
    requestTag: 0,
    failReqestNum: 0, //记录请求下订单接口的次数
    hideErrorTag: true
  },
  onLoad: function (options) {
    // toast组件实例
    new app.ToastPannel();

    wx.setNavigationBarTitle({
      title: this.data.openStatus
    })

    this.setData({
      capsule_id: options.capsule_id
    })
  },
  progressUp: function () {
    var proCount = this.data.progress
    if (this.data.progress == 49 && this.data.requestTag===0) {
      this.setData({
        requestTag: 1
      })
      bookingSubmit(this.data.capsule_id, this)
    }else if (proCount != 50 && proCount < 99) {
      proCount += 1
      this.setData({
        progress: proCount
      })
    } else if (proCount == 99){
      this.clearInterval()
    }
  },
  onShow: function () {
    var that = this
    let timer = setInterval(function () {
      that.progressUp()
    }, 1000 / 50)
    that.setData({
      timer: timer
    })
  },
  clearInterval: function () {
    if (this.data.timer) {
      clearInterval(this.data.timer)
    }
  },
  repeatRequest: function(){
    var that = this
    that.clearInterval()
    that.setData({
      failReqestNum: that.data.failReqestNum + 1
    })
    setTimeout(() => {
      console.log(that.data.failReqestNum)
      if (that.data.failReqestNum === 2){
        that.setData({
          hideErrorTag: false
        })
      }
      if (that.data.failReqestNum === 3) {
        that.setData({
          hideErrorTag: true,
          failReqestNum: 0
        })
        setTimeout(() => {
          wx.navigateBack({
            delta: 1 // 回退前 delta(默认为1) 页面
          })
        }, 2000)
      } else {
        setTimeout(() => {
          bookingSubmit(parseInt(that.data.capsule_id), that)
        }, 1000)
      }
    }, 0)
  }
})
function bookingSubmit(capsule_id, that) {
  network.shareSleepNetwork("booking/request", { capsule_id: parseInt(capsule_id) }, "POST", function complete(res) {
    function back() {
      wx.navigateBack({
        delta: 1 // 回退前 delta(默认为1) 页面
      })
    }
    if (res.data.ret == 0) {
      app.initHealthReportCache()
      setTimeout(() => {
        that.setData({
          progress: 51
        })
        setTimeout(() => {
          that.clearInterval()
          that.setData({
            progress: 100,
            openStatus: "解锁成功"
          })
          setTimeout(()=>{
            wx.reLaunch({
              url: '/pages/orderDetail/orderDetail?booking_id=' + res.data.booking_id + '&create_time=' + res.data.booking_info['create_time'] + "&calculate_rule=" + res.data.booking_info.calculate_rule + "&capsule_id=" + res.data.booking_info.capsule_id,
              success: function (res) {
                console.log("跳转订单详情成功")
              },
              fail: function (res) {
                console.log("跳转订单详情失败")
                console.log(res)
              },
              complete: function (res) {
                // complete
              }
            })
          },300)
        }, 1000)
      }, 2000)
    } else if (parseInt(res.data.ret) == -3026) {
      that.clearInterval()
      wx.showModal({
        content: res.data.err,
        confirmText: "去认证",
        success: function (resp) {
          if (resp.confirm) {
            wx.navigateTo({
              url: '/pages/verifi/verifi',
            })
          }
        }
      })
    } else if (res.data.ret != -3007) {
      that.repeatRequest()
    }
  }, that, function errBack() {
    that.repeatRequest()
  }, that.data.hideErrorTag)
}