// areaInfo.js
var network = require('../../utils/network.js')
var utils = require("../../utils/util.js")
var app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    area_id: 1102,
    area_info: {},
    scanCodeText: '扫码使用',
    current: 0
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    // toast组件实例
    new app.ToastPannel();
    if (options.area_id) {
      that.setData({
        area_id: parseInt(options.area_id)
      })
    }
    console.log(options.title)
    if (options.title) {
      wx.setNavigationBarTitle({
        title: options.title,
      })
    }
    wx.setNavigationBarTitle({
      title: options.title
    });
    requestArea_info(this)
  },
  /**
   * 查看地址
   */
  openMapAction: function () {
    var that = this
    if (wx.showLoading) {
      wx.showLoading({
        title: '地图信息加载中',
      })
    }
    var location = utils.convert_BD09_To_GCJ02(that.data.area_info["location"]['latitude'] / 1000000, that.data.area_info["location"]['longitude'] / 1000000)
    console.log(location)
    wx.openLocation({
      latitude: parseFloat(location["latitude"]),
      longitude: parseFloat(location["longitude"]),
      address: that.data.area_info.address,
      complete: function (res) {
        console.log(res)
        if (wx.hideLoading) {
          wx.hideLoading()
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function () {
    if (app.globalData.localUserInfo.uin != 100000) {
      this.setData({
        // price_label_hiden: false,
        protocol_label_hiden: false,
        bind_screte_hiden: false
      })
      // if (app.globalData.is_from_login == 1) {
      //   checkBooking(this)
      // }
      // checkBooking(this)
    }
  },
  //点击右上角分享
  onShareAppMessage: function () {
    var ret = utils.lowerVersion('6.5.8')
    console.log(ret)
    if (ret == true) {
      wx.showModal({
        title: '提示',
        content: '您的微信版本暂不支持此功能，请升级后使用',
      })
      return
    }
    return {
      title: this.data.area_info.title,
      path: '/pages/areaInfo/areaInfo?area_id=' + this.data.area_info.area_id + '&title=' + this.data.area_info.title,
      success: function (res) {
        that.show('分享成功');
      },
      fail: function (res) {
        that.show('分享失败，请重试');
        // wx.showToast({
        //   image: '/images/error.png',
        //   title: '邀请失败，请重试',
        // })
      }
    }
  },
  /**
  * 拨打客服电话
  */
  callServiceAction: function () {
    utils.callService(this.data.area_info.contact)
  }, 
  /**
   * 点击区域进入详情
   */
  areaDetailAction: function (e) {
    wx.navigateTo({
      url: '/pages/areaInfo/areaInfo?area_id=' + e,
    })
  },
  /**
   * 扫码活动
   */
  scanCodeAction: function () {
    scanCode(this)
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    requestArea_info(this)
  },
  /**
   * 轮播图current改变时会触发change事件
   */
  swiperAction: function (e) {
    this.setData({
      current: e.detail.current
    })
  },
  /**
   * 包月活动
   */
  monthLiveAction: function () {
    var that = this
    wx.showModal({
      title: '包月预约',
      content: '目前包月服务需要打客服电话预约，预约成功后我们将为您保留您所预约的太空舱，在未来一个月内的任何时间仅供您一人使用。客服电话：' + that.data.area_info.contact,
      confirmText: "联系客服",
      success: function (resp) {
        if (resp.confirm) {
          wx.makePhoneCall({
            phoneNumber: that.data.area_info.contact,
          })
        }
      }
    })
  }
})

function requestArea_info(page) {
  if (wx.showLoading) {
    wx.showLoading({
      title: '加载中',
    })
  }

  network.shareSleepNetwork("capsule/getareainfo/" + page.data.area_id, {}, "GET", function complete(res) {
    wx.stopPullDownRefresh()
    if (wx.hideLoading) {
      wx.hideLoading()
    }
    if (res.data.area_info && res.data.area_info.capsules && res.data.area_info.capsules.length>0){
      res.data.area_info.capsules = res.data.area_info.capsules.map(function (item) {
        item.capsule_id = String(item.capsule_id).slice(-3);
        return item;
      })
    }
    page.setData({
      area_info: res.data.area_info
    })

    wx.setNavigationBarTitle({
      title: res.data.area_info.title,
    })
    wx.getLocation({
      // type:"2",
      success: function (resp) {
        console.log('获取定位')
        var loc = utils.convert_GCJ02_To_BD09(resp.latitude, resp.longitude)
        var distance = utils.getDistance(loc.latitude, loc.longitude, res.data.area_info.location.latitude / 1000000, res.data.area_info.location.longitude / 1000000);
        console.log(distance);
        page.setData({
          distance: parseInt(distance) < 1000 ? parseInt(distance) + 'm' : (distance / 1000).toFixed(3) + 'km'
        })
      },
      fail: function () {
        page.show('定位失败');
      }
    })
    console.log(res.data.area_info)
  }, page)
}
function scanCode(that) {
  wx.login({
    success: function (res) {
      console.log(res.code)
    }
  })
  wx.scanCode({
    complete: function (res) {
      console.log(res)
      if ((res.scanType == "QR_CODE" || res.type == "QR_CODE") && res.errMsg == "scanCode:ok" && res.result.indexOf('id') != -1) {
        // bookingSubmit(res.result)
        console.log("scan===============")
        console.log(res.result)
        var capsule_id = utils.getCapsuleId(res.result)
        openCapsule(capsule_id,that)
      } else if ((res.scanType == "QR_CODE" || res.type == "QR_CODE") && res.errMsg == "scanCode:ok" && res.result.indexOf('invite') != -1) {
        var result_arr = res.result.split('/');
        var invite_code = result_arr[result_arr.length - 1];
        if (invite_code){
          if (app.globalData.localUserInfo.uin == 100000) {
            wx.navigateTo({
              url: '../newInvite/newInvite?uin=' + invite_code + "&type=1"
            })
          } else {
            wx.showModal({
              title: '提示',
              content: '您已是我们的老用户，该活动仅限新用户参加',
              confirmText: "确定",
              showCancel: false
            })
          }
        }else{
          wx.navigateTo({
            url: '../newInvite/newInvite?type=0'
          })
        }
      } else {
        wx.showModal({
          title: '提示',
          content: '没有扫到有效的共享头等舱二维码，请重试',
          confirmText: "确定",
          showCancel: false
        })
      }
    }
  })
}
function openCapsule(capsule_id,that) {
  if (app.globalData.localUserInfo.uin != 100000) {
    network.shareSleepNetwork("capsule/" + capsule_id + "/info", {}, "GET", function complete(res) {
      if (parseInt(res.data.ret) == 0) {
        if (parseInt(res.data.capsule_info.type) >= 99) {
          that.show('大门已解锁，欢迎来到享+')
          // wx.showToast({
          //   title: '大门已解锁，欢迎来到享+',
          // })
        } else if (parseInt(res.data.capsule_info.status) == 2) {
          wx.showModal({
            content: '晚来一步，太空舱已被占用，看看附近有没有其他的舱可用吧',
            confirmText: '好的',
            success: function (resp) {
              if (resp.confirm) {
                that.areaDetailAction(res.data.capsule_info.area_id)
              }
            }
          })
        } else {
          // wx.showModal({
          //   content: res.data.calculate_rule,
          //   confirmText: "立即开舱",
          //   success: function (resp) {
          //     if (resp.confirm) {
          //       console.log("go==========")
          //       console.log(capsule_id)
          //       wx.redirectTo({
          //         url: '/pages/openDoor/openDoor?capsule_id=' + capsule_id
          //       })
          //     }
          //   }
          // })
          wx.redirectTo({
            url: '/pages/openDoor/openDoor?capsule_id=' + capsule_id
          })
        }

      } else if (parseInt(res.data.ret) == -9003 || parseInt(res.data.ret) == -9004) {
        var confitext = (parseInt(res.data.ret) == -9004 ? "补全押金" : "支付押金")
        wx.showModal({
          content: res.data.err,
          confirmText: confitext,
          success: function (resp) {
            if (resp.confirm) {
              if (confitext == "补全押金") {
                wx.navigateTo({
                  url: `/pages/depositPay/depositPay?ru=${encodeURIComponent('/')}&back_deposit=true`,
                })
              } else {
                wx.navigateTo({
                  url: '/pages/depositPay/depositPay',
                })
              }
            }
          }
        })
      } else if (parseInt(res.data.ret) == -9005) {
        wx.showModal({
          content: res.data.err,
          confirmText: "去充值",
          success: function (resp) {
            if (resp.confirm) {
              wx.navigateTo({
                url: '/pages/myWallet/myWallet',
              })
            }
          }
        })
      } else if (parseInt(res.data.ret) == -3026) {
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
      }
    }, that)
  }else{
    wx.removeStorage({
      key: 'localUserCache',
      success: function (res) {
        app.setLocalUserInfo();
        wx.navigateTo({
          url: '/pages/login/login'
        })
      }
    })
  }
}
function userLogin() {
  wx.navigateTo({
    url: '/pages/login/login',
  })
}
function checkBooking(that) {
  network.shareSleepNetwork("booking/bookinglist", {}, "GET", function complete(res) {
    if (res.data.num > 0) {
      for (var index in res.data.booking_infos) {
        var item = res.data.booking_infos[index]
        console.log(item)
        if (parseInt(item.status) == 1) {
          wx.redirectTo({
            url: '/pages/orderDetail/orderDetail?booking_id=' + item.booking_id + '&create_time=' + item.create_time + "&calculate_rule=" + item.calculate_rule + "&capsule_id=" + item.capsule_id + "&gate_capsule_id=" + res.data.gate_capsule_id,
            complete: function (res) {
              console.log(res)
            }
          })
          break;
        } else if (item.status == 2 || item.status == 3) {
          var timeString = utils.timeShowString(item.end_time - item.create_time)
          wx.reLaunch({
            url: '/pages/orderPay/orderPay?time=' + timeString + '&final_price=' + item.final_price + '&booking_id=' + item.booking_id + "&status=" + item.status + "&calculate_rule=" + item.calculate_rule + "&capsule_id=" + item.capsule_id,
            complete: function (res) {
              console.log(res)
            }
          })
          break;
        }
      }
    }
  },that)
}