var app = getApp()
var utils = require("/util.js")
function downloadWebPage(url) {
  if (wx.showLoading) {
    wx.showLoading({
      title: "加载中",
      mask: true
    })
  }
  wx.downloadFile({
    url: url,
    // type: 'image', // 下载资源的类型，用于客户端识别处理，有效值：image/audio/video
    // header: {}, // 设置请求的 header
    success: function (res) {
      var filePath = res.tempFilePath
      wx.openDocument({
        filePath: filePath,
        fail: function (res) {
          wx.showToast({
            title: res.errMsg
          })
        }
      })
    },
    fail: function (res) {
      wx.showToast({
        title: '页面加载失败，请重试'
      })
    },
    complete: function (res) {
      if (wx.hideLoading) {
        wx.hideLoading()
      }
    }
  })
}
function shareSleepNetwork(api, data, method, complete, that, errBack, hideError) {
  var headerDict = {
    'content-type': 'application/json',
    'User-Uin': parseInt(app.globalData.localUserInfo.uin),
    'Req-From': 'wx-app'
  }
  if (app.globalData.localUserInfo && app.globalData.localUserInfo['token']) {
    headerDict['Client-Token'] = app.globalData.localUserInfo.token
  }
  console.log(headerDict)
  if (method == "POST") {
    console.log("请求包体")
    console.log(data)
  }
  wx.request({
    url: app.globalData.baseUrl + api,
    data: data,
    method: method, // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    header: headerDict, // 设置请求的 header
    complete: function (res) {
      console.log(app.globalData.baseUrl + api + '======')
      console.log(res)
      if (api == "user/signup") {
        app.globalData.is_from_login = 1
      }
      if (!res.statusCode || parseInt(res.statusCode) != 200) {
        if (wx.hideLoading) {
          wx.hideLoading()
        }
        if (res.data && res.data.err){
          that.show(res.data.err);
        }else{
          if (!hideError) {
            that.show('网络开小差了...')
          }
        }
        if (errBack){
          errBack()
        }
      }
      /**
       * -1017  邀请好友重复注册
       * -9004 -9003 -9005  押金不足
       * -3026 未实名认证
       * -4014 区域号不存在
       */
      if (res.data.ret == -3026 || res.data.ret == -9004 || res.data.ret == -9003 || res.data.ret == -9005 || res.data.ret == -1017 || res.data.ret == -1016 || res.data.ret == -3111) {
        complete(res)
        return;
      }
      if (res.data && res.data.ret == 0) {
        complete(res)
      } else if (res.data && res.data.ret != -3007) {//订单问题，不能提示订单号
        console.log("请求失败，失败原因是")
        if (res.data.ret <= -100 && res.data.ret >= -200) {
          // wx.navigateBack({
          //   delta: 1
          // })
          if (app.globalData.localUserInfo.uin == 100000) {
            // wx.removeStorage({
            //   key: 'localUserCache',
            //   success: function (res) {
            //     app.setLocalUserInfo();
            //     wx.redirectTo({
            //       url: '/pages/login/login'
            //     })
            //   }
            // })
          } else {
            wx.reLaunch({
              url: '/pages/scanCode/scanCode'
            })
            wx.removeStorage({
              key: 'localUserCache',
              success: function (res) {
                app.setLocalUserInfo();
              }
            })
            app.globalData.loginout = true
            // console.log("关闭WebSocket=======")
            // wx.closeSocket();
            // wx.onSocketClose(function (res) {
            //   console.log('WebSocket 已关闭！')
            // })
          }
        } 
        if (res.data.ret == -4014){
          setTimeout(()=>{
            wx.navigateBack({
              delta: 1
            })
          },1000)
        }
        if (res.data.ret == -1055) {
          console.log("无押金理由");
        } else if (res.data.ret == -3106 || res.data.ret == -3107) {
          console.log("非月卡用户");
        }else {
          complete(res)
          if (res.data.err != 'login required') {
            console.log('lalaal------------------------------------------')
            if (!hideError){
              that.show(res.data.err);
            }
          }
        }
      } else {
        complete(res)
      }
      if ((res.data.unpaid_booking_id && res.data.unpaid_booking_id != 0) || (res.data.ret == -3007)) {
        if (wx.hideToast) {
          wx.hideToast()
        }
        var unpaid_booking_id = 0
        if (res.data.ret == -3007) {
          unpaid_booking_id = parseInt(res.data.err)
        } else {
          unpaid_booking_id = res.data.unpaid_booking_id
        }
        shareSleepNetwork("booking/bookingid/" + unpaid_booking_id, {}, "GET", function complete(res) {
          console.log('network========================================================')
          console.log(res);
          if (res.data.booking_info.status == 1) {
            wx.showModal({
              title: "您有进行中的订单，点击查看",
              showCancel: false,
              confirmText: "去查看",
              success: function (resp) {
                if (resp.confirm) {
                  if (wx.reLaunch) {
                    wx.reLaunch({
                      url: '/pages/orderDetail/orderDetail?booking_id=' + res.data.booking_id + '&create_time=' + res.data.booking_info['create_time'] + "&calculate_rule=" + res.data.booking_info.calculate_rule + "&capsule_id=" + res.data.booking_info.capsule_id + "&gate_capsule_id=" + res.data.gate_capsule_id
                    })
                  } else {
                    wx.redirectTo({
                      url: '/pages/orderDetail/orderDetail?booking_id=' + res.data.booking_id + '&create_time=' + res.data.booking_info['create_time'] + "&calculate_rule=" + res.data.booking_info.calculate_rule + "&capsule_id=" + res.data.booking_info.capsule_id + "&gate_capsule_id=" + res.data.gate_capsule_id
                    })
                  }
                }
              }
            })
          } else if ((res.data.booking_info.status == 2) || (res.data.booking_info.status == 3)) {
            wx.showModal({
              title: "您还有未支付的订单，请支付",
              showCancel: false,
              confirmText: "去支付",
              success: function (resp) {
                if (resp.confirm) {
                  var timeString = utils.timeShowString(res.data.booking_info.end_time - res.data.booking_info.create_time)
                  if (wx.reLaunch) {
                    wx.reLaunch({
                      url: '/pages/orderPay/orderPay?time=' + timeString + '&final_price=' + res.data.booking_info.final_price + '&booking_id=' + res.data.booking_info['booking_id'] + "&status=" + res.data.booking_info.status + "&calculate_rule=" + res.data.calculate_rule + "&capsule_id=" + res.data.booking_info.capsule_id + "&balance=" + res.data.balance + "&need_charge=" + res.data.need_charge
                    })
                  } else {
                    wx.redirectTo({
                      url: '/pages/orderPay/orderPay?time=' + timeString + '&final_price=' + res.data.booking_info.final_price + '&booking_id=' + res.data.booking_info['booking_id'] + "&status=" + res.data.booking_info.status + "&calculate_rule=" + res.data.calculate_rule + "&capsule_id=" + res.data.booking_info.capsule_id + "&balance=" + res.data.balance + "&need_charge=" + res.data.need_charge
                    })
                  }
                }
              }
            })
          } else if (res.data.booking_info.status == 4) {
            wx.showModal({
              title: "您完成了一笔订单的支付，去查看",
              showCancel: false,
              confirmText: "去查看",
              success: function (resp) {
                if (resp.confirm) {
                  var timeString = utils.timeShowString(res.data.booking_info.end_time - res.data.booking_info.create_time)
                  if (wx.reLaunch) {
                    wx.reLaunch({
                      url: '../paySucc/paySucc?time=' + timeString + '&final_price=' + res.data.booking_info.final_price + "&balance=" + (res.data.balance ? res.data.balance / 100 : 0) + '&capsule_id_origin=' + res.data.booking_info.capsule_id + '&booking_id=' + res.data.booking_id + '&phone=' + app.globalData.localUserInfo.phone + '&appraise_flag=' + res.data.appraise_flag
                    })
                  } else {
                    wx.redirectTo({
                      url: '../paySucc/paySucc?time=' + timeString + '&final_price=' + res.data.booking_info.final_price + "&balance=" + (res.data.balance ? res.data.balance / 100 : 0) + '&capsule_id_origin=' + res.data.booking_info.capsule_id + '&booking_id=' + res.data.booking_id + '&phone=' + app.globalData.localUserInfo.phone + '&appraise_flag=' + res.data.appraise_flag
                    })
                  }
                }
              }
            })
          }
        }, that)
      }
    }
  })
}
module.exports.shareSleepNetwork = shareSleepNetwork
module.exports.downloadWebPage = downloadWebPage