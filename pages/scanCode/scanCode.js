// homePage.js
var app = getApp()
var network = require('../../utils/network.js')
var utils = require("../../utils/util.js")
const hSwiper = require("../../component/hSwiper/hSwiper.js")
var storageService = require('../../utils/storageService.js').default
Page({
  /**
   * 页面的初始数据
   */
  data: {
    current_city: "北京市",
    area_city: "北京市",
    page_contents: [],
    scanCodeText: '扫码使用',
    is_login: 0,
    location: {},
    activityList: [],
    //swiper插件变量
    hSwiperVar: {},
    has_area: false,
    isLocation: true,
    isFirstShow: true,
    firstShow: 1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    console.log(options)
    // toast组件实例
    new app.ToastPannel();
    this.setLang()
    if (app.globalData.loginout) {
      const backgroundAudioManager = wx.getBackgroundAudioManager();
      if (backgroundAudioManager.src) {
        backgroundAudioManager.stop();
      }
      app.initHealthReportCache()
      wx.showModal({
        content: '您的账号在另一台设备登录，如非本人操作，账户可能被盗用，请重新登录。',
        confirmText: "确定",
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            wx.removeStorage({
              key: 'localUserCache',
              success: function (res) {
                const backgroundAudioManager = wx.getBackgroundAudioManager();
                if (backgroundAudioManager.src) {
                  backgroundAudioManager.stop()
                }
                app.setLocalUserInfo();
                wx.navigateTo({
                  url: '/pages/login/login'
                })
              }
            })
          }
        }
      })
    }
    if (options.invite == 1) {
      wx.navigateTo({
        url: '../newInvite/newInvite?uin=' + options.uin + "&type=1"
      })
    } else if (options.card == 1) {
      wx.navigateTo({
        url: '/pages/card/card?share=1&uin=' + options.uin,
      })
    } else if (options.group == 1) {
      wx.navigateTo({
        url: '/pages/groupbuy/groupbuy?group_id=' + options.group_id + '&uin=' + options.uin,
      })
    }
    if (options.q && decodeURIComponent(options.q).indexOf('invite') != -1) {
      if (utils.getUinFromUrl(options.q)) {
        wx.navigateTo({
          url: '../newInvite/newInvite?uin=' + utils.getUinFromUrl(options.q) + "&type=1"
        })
      } else {
        wx.navigateTo({
          url: '../newInvite/newInvite?type=0'
        })
      }
    }
    console.log('ennennennne')
    console.log(options.q)
    if (options.q && decodeURIComponent(options.q).indexOf('id') != -1) {
      if (app.globalData.localUserInfo.uin != 100000) {
        this.setData({
          protocol_label_hiden: false,
          bind_screte_hiden: false
        })
        app.globalData.is_from_login = 1
        var capsule_id = utils.getCapsuleId(options.q)
        openCapsule(capsule_id, that)
      } else {
        wx.navigateTo({
          url: '/pages/login/login'
        })
      }
    } else if (options.q && decodeURIComponent(options.q).indexOf('wallet/card') != -1) {
      wx.navigateTo({
        url: '/pages/card/card?share=1&uin=' + options.uin,
      })
    } else if (options.q && decodeURIComponent(options.q).indexOf('wallet/exchange') != -1) {
      wx.navigateTo({
        url: '/pages/redeem/redeem',
      })
    }

    if (wx.showLoading) {
      wx.showLoading({
        title: '数据加载中',
      })
    }
    this.getLocation();
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function () {
    this.setData({
      firstShow: 1
    })
    if (!this.data.isFirstShow) {
      this.getLocation();
    }
    if (app.globalData.localUserInfo.uin != 100000) {
      this.setData({
        protocol_label_hiden: false,
        bind_screte_hiden: false
      })
      // if (app.globalData.is_from_login == 1) {
      //   checkBooking(this)
      // }
      console.log('test===========================')
      console.log(this.data.firstShow)
      if (this.data.firstShow == 1) {
        checkBooking(this)
        this.setData({
          firstShow: 0
        })
      }
    }
    let capsule_id = storageService.tryOpenCapsuleCmd();
    if (capsule_id) {
      openCapsule(capsule_id, this);
    }
  },
  /**
   * 跳转到活动页面
   */
  webViewAction: function (event) {
    var chooseId = event.currentTarget.dataset.index;
    var canIUse = wx.canIUse('web-view');
    console.log(canIUse)
    if (canIUse) {
      if (this.data.activityList[chooseId].url == 'xiangshui://mine/convert') {
        wx.navigateTo({
          url: "/pages/redeem/redeem"
        })
      } else if (this.data.activityList[chooseId].url == 'xiangshui://mine/month_card') {
        wx.navigateTo({
          url: '/pages/card/card?share=1',
        })
      } else if (this.data.activityList[chooseId].url.search('xiangshui:') == 0) {
        wx.navigateTo({
          url: this.data.activityList[chooseId].url.substring('xiangshui:'.length),
        })
      } else {
        wx.navigateTo({
          url: "/pages/activity/activity?web_view_url=" + this.data.activityList[chooseId].url
        })
      }
    } else {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。',
        showCancel: false,
        confirmText: '知道了'
      })
    }
  },
  setLang() {
    // const _ = wx.T._
    // console.log('test=================================')
    // console.log(_)
    // this.setData({
    //   test: _('附近推荐')
    // })
  },
  /**
   * 常见问题
   */
  normalQuestionsAction: function () {
    network.downloadWebPage("https://www.xiangshuispace.com/www/Q&A.pdf")
  },
  /** 
   *打开定位 
   */
  openLocation: function () {
    var that = this;
    wx.showModal({
      title: '请允许享+定位',
      content: '请确保微信开启了定位服务，且允许享+确定您的位置',
      confirmText: "设置",
      success: function (res) {
        if (res.confirm) {
          wx.openSetting({
            success: (res) => {
              res.authSetting = {
                "scope.userLocation": true
              }
              that.setData({
                isFirstShow: true
              })
              that.getLocation();
            }
          })
        }
      }
    })
  },
  /**
   * 获取定位
   */
  getLocation: function () {
    var that = this;
    //获取定位
    wx.getLocation({
      // type:"2",
      success: function (res) {
        console.log('获取定位')
        console.log(res)
        var loc = utils.convert_GCJ02_To_BD09(res.latitude, res.longitude)
        console.log(loc)
        that.setData({
          location: loc
        })
        that.requestArea_List()
      },
      fail: function () {
        that.show('定位失败')
        // wx.showToast({
        //   title: '定位失败',
        // })
        that.requestArea_List()
      }
    })
  },
  /**
   * 我的页面
   */
  callServiceAction: function () {
    wx.navigateTo({
      url: '/pages/mine/mine',
    })
  },
  /**
   * 扫码活动
   */
  scanCodeAction: function () {
    scanCode(this)
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
   * 分享
   */
  onShareAppMessage: function () {
    return {
      title: "您的自助休息空间+健康加油站",
      path: '/pages/scanCode/scanCode?uin=' + app.globalData.userInfo.uin,
      success: function (res) {
      },
      fail: function (res) {
        console.log(res)
      }
    }
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getLocation();
  },
  /**
   * 请求首页数据
   */
  requestArea_List: function () {
    var that = this;
    var correctUrl = ''
    wx.stopPullDownRefresh()
    if (this.data.location) {
      that.setData({
        isLocation: true
      })
    } else {
      that.setData({
        isLocation: false
      })
    }

    if (isNaN(that.data.location.latitude)) {
      that.setData({
        isLocation: false
      })
      correctUrl = "capsule/getarearecommend";
      // correctUrl = "capsule/getarearecommend?city=" + that.data.area_city
    } else {
      correctUrl = "capsule/getarearecommend?latitude=" + parseInt(parseFloat(that.data.location.latitude) * 1000000) + "&&longitude=" + parseInt(parseFloat(that.data.location.longitude) * 1000000)
    }

    if (wx.showLoading) {
      wx.showLoading({
        title: '加载中',
        mask: true
      })
    }
    network.shareSleepNetwork(correctUrl, {}, "GET", function complete(res) {
      if (wx.hideLoading) {
        wx.hideLoading()
      }
      that.setData({
        page_contents: res.data.sections,
        current_city: res.data.city,
        area_city: res.data.city,
        activityList: res.data.activitys
      })
      var has_area = that.data.has_area;
      if (that.data.page_contents[0].areas && that.data.page_contents[0].areas.length > 0) {
        that.setData({
          has_area: true
        })
        var swiper = new hSwiper({ reduceDistance: 30, varStr: "hSwiperVar", list: that.data.page_contents && that.data.page_contents[0].areas ? that.data.page_contents[0].areas : [] });
      } else if (!that.data.page_contents[0].areas) {
        that.setData({
          has_area: false
        })
      }
    }, that)
  }
})
function scanCode(that) {
  wx.login({
    success: function (res) {
      console.log("code===========")
      console.log(res.code)
    }
  })
  wx.scanCode({
    complete: function (res) {
      console.log('............')
      console.log(res)
      if ((res.scanType == "QR_CODE" || res.type == "QR_CODE") && res.errMsg == "scanCode:ok" && res.result.indexOf('id') != -1) {
        // bookingSubmit(res.result)
        var capsule_id = utils.getCapsuleId(res.result)
        openCapsule(capsule_id, that)
      } else if ((res.scanType == "QR_CODE" || res.type == "QR_CODE") && res.errMsg == "scanCode:ok" && res.result.indexOf('invite') != -1) {
        var result_arr = res.result.split('/');
        var invite_code = result_arr[result_arr.length - 1];
        if (invite_code) {
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
        } else {
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
function openCapsule(capsule_id, that) {
  if (app.globalData.localUserInfo.uin != 100000) {
    network.shareSleepNetwork("capsule/" + capsule_id + "/info", {}, "GET", function complete(res) {
      if (parseInt(res.data.ret) == 0) {
        if (parseInt(res.data.capsule_info.type) >= 99) {
          that.show('大门已解锁，欢迎来到享+')
        } else if (parseInt(res.data.capsule_info.status) == 2) {
          // that.show('晚来一步，头等舱已被占用，换一个试试吧')
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
          let calculate_rule = res.data.calculate_rule;
          network.shareSleepNetwork("booking/bookinglist", {}, "GET", function complete(res) {
            if (res.data.ret == 0) {
              if (res.data.booking_infos && res.data.booking_infos.length > 0) {
                wx.navigateTo({
                  url: '/pages/openDoor/openDoor?capsule_id=' + capsule_id
                })
              } else {

                wx.showModal({
                  content: calculate_rule,
                  confirmText: "立即开舱",
                  success: function (resp) {
                    if (resp.confirm) {
                      wx.navigateTo({
                        url: '/pages/openDoor/openDoor?capsule_id=' + capsule_id
                      })
                    } else if (resp.cancel) {
                      // wx.navigateBack({
                      //   delta: 1, // 回退前 delta(默认为1) 页面
                      // })
                    }
                  }
                })
              }
            }
          }, that)



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
                  url: `/pages/depositPay/depositPay?openCapsuleCmd=${capsule_id}&back_deposit=true`,
                })
              } else {
                wx.navigateTo({
                  url: `/pages/depositPay/depositPay?openCapsuleCmd=${capsule_id}`,
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
                url: `/pages/myWallet/myWallet?openCapsuleCmd=${capsule_id}`,
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
                url: `/pages/verifi/verifi?openCapsuleCmd=${capsule_id}`,
              })
            }
          }
        })
      }
    }, that)
  } else {
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
  network.shareSleepNetwork("booking/bookinglist?types=1,2,3", {}, "GET", function complete(res) {
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
            url: '/pages/orderPay/orderPay?time=' + timeString + '&final_price=' + item.final_price + '&booking_id=' + item.booking_id + "&status=" + item.status + "&capsule_id=" + item.capsule_id + "&calculate_rule=" + item.calculate_rule + "&balance=" + item.balance + "&need_charge=" + item.need_charge,
            complete: function (res) {
              console.log(res)
            }
          })
          break;
        }
      }
    }
  }, that)
}
