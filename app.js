//app.js

const debug = false;

function type(o, t) {
  if (t === undefined) {
    if (o !== o) return 'NaN';
    let typeStr = Object.prototype.toString.call(o);
    return typeStr.substring(8, typeStr.length - 1);
  } else {
    return type(o) === t;
  }
}

function typeValue(o, t, d) {
  return type(o, t) ? o : (d || null);
}

let UUID = {
  cs: '012346789abcdef'.toUpperCase().split(''),
  get: function(n) {
    n = n || 32;
    var _uuid = "";
    for (var i = 0; i < n; i++) {
      var index = Math.floor(Math.random() * this.cs.length);
      _uuid += this.cs[index];
    }
    return _uuid;
  }
};

Date.prototype.format = function(fmt) {
  if (!fmt) fmt = "yyyy-MM-dd hh:mm:ss";
  var o = {
    "M+": this.getMonth() + 1, //月份
    "W": (function(date) {
      switch (date.getDay()) {
        case 0:
          return "日";
        case 1:
          return "一";
        case 2:
          return "二";
        case 3:
          return "三";
        case 4:
          return "四";
        case 5:
          return "五";
        case 6:
          return "六";
        default:
          return "";
      }
    })(this), //星期
    "d+": this.getDate(), //日
    "h+": this.getHours(), //小时
    "m+": this.getMinutes(), //分
    "s+": this.getSeconds(), //秒
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度
    "S": this.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt))
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
};





var utils = require("utils/util.js")
import {
  ToastPannel
} from './component/toast/toast'

import locales from './utils/locales'
import T from './utils/wxapp-i18n'

T.registerLocale(locales)
T.setLocale('zh-Hans')
wx.T = T









App({
  ToastPannel,
  onLaunch: function(options) {
    console.log('options====================')
    console.log(options)
    var that = this
    showVersionUpdate()
    // wx.removeStorage({
    //   key: 'localUserCache',
    //   complete: function(res) {
    //     console.log(res)
    //   }
    // })
    let sysInfo = wx.getSystemInfoSync()
    let rate = 750 / sysInfo.screenWidth
    that.globalData.rate = rate;
    try {
      var res = wx.getStorageSync('localUserCache')
      console.log("app onLaunch")
      console.log(res)

      if (res["uin"] && res["uin"] != 100000) {
        that.globalData.localUserInfo = res
        //用户是否在另外的设备登录
        that.globalData.loginout = false
      }
    } catch (e) {
      console.log("app onlaunch fail" + e)
    }
    if (wx.getNetworkType) {
      wx.getNetworkType({
        success: function(res) {
          if (res.networkType == "none") {
            wx.navigateBack({
              delta: 1
            })
            wx.showModal({
              title: '打开失败',
              content: '无法打开小程序，请检查网络状态',
              showCancel: false,
              confirmText: "知道了",
              success: function(resp) {
                if (resp.confirm) {
                  wx.navigateBack({
                    delta: 1
                  })
                }
              }
            })
          }
        },
      })
    }
  },
  onShow: function() {
    var that = this;
    if (this.globalData.websocket == 0) {
      this.createSocket(this.globalData.localUserInfo.uin, this.globalData.localUserInfo.token)
    }
    wx.request({
      url: this.globalData.baseUrl + 'sysconfig',
      method: 'GET',
      success: function(res) {
        console.log('config===============')
        console.log(res);
        if (res.data.ret == 0) {
          that.globalData.config = res.data;
        } else {
          that.globalData.config = that.globalData.configDefault
        }
      },
      fail: function() {
        that.globalData.config = that.globalData.configDefault
      }
    })
  },
  onHide: function() {

  },

  createSocket: function(uin, token) {
    var that = this;
    var baseUrl = this.globalData.baseUrl;
    this.globalData.websocket = 1;
    var timer;
    //链接websocket开始
    if (uin != 100000) {
      console.log("socket=========");
      var headerDict = {
        'content-type': 'application/json',
        'User-Uin': parseInt(uin),
        'Req-From': 'wx-app',
        'Client-Token': token
      }

      wx.request({
        url: baseUrl + 'user/set',
        data: JSON.stringify({
          igetui_cltid: String(uin)
        }),
        method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        header: headerDict, // 设置请求的 header
        success: function(res) {
          console.log(res.data)
        }
      })

      var socketOpen = false
      wx.connectSocket({
        url: 'wss://www.xiangshuispace.com/chat'
      })

      wx.onSocketOpen(function(res) {
        console.log('WebSocket连接已打开！')
        socketOpen = true
        sendSocketMessage(JSON.stringify({
          msg_type: 'register',
          name: String(uin)
        }))
      })

      wx.onSocketError(function(res) {
        console.log('WebSocket连接打开失败，请检查！')
      })

      wx.onSocketClose(function(res) {
        console.log('WebSocket 已关闭！')
        console.log(res);
        console.log(that.globalData.timer)
        if (that.globalData.timer) {
          clearInterval(that.globalData.timer)
        }
      })

      function sendSocketMessage(msg) {
        if (socketOpen) {
          wx.sendSocketMessage({
            data: msg
          })
          that.globalData.timer = setInterval(() => {
            wx.sendSocketMessage({
              data: JSON.stringify({
                msg_type: "ping"
              })
            })
          }, 30000)
        } else {
          console.log("WebSocket连接打开失败，请检查!")
        }
      }

      wx.onSocketMessage(function(res) {
        console.log('收到服务器内容：' + res.data)
        var reqData = JSON.parse(res.data)
        console.log(reqData);
        that.globalData.reqData = reqData;
        if (reqData.content.booking_id) {
          wx.request({
            url: baseUrl + 'booking/bookingid/' + reqData.content.booking_id,
            data: {},
            method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
            header: headerDict, // 设置请求的 header
            success: function(resp) {
              console.log("booking/bookingid/=========")
              console.log(resp.data)
              var timeString = utils.timeShowString(resp.data.booking_info.end_time - resp.data.booking_info.create_time)
              if (resp.data.booking_info.status == 4) {
                wx.redirectTo({
                  url: '../paySucc/paySucc?time=' + timeString + '&final_price=' + resp.data.booking_info.final_price + "&capsule_id=" + resp.data.booking_info.capsule_id + "&balance=" + (resp.data.balance ? resp.data.balance / 100 : 0) + '&capsule_id_origin=' + resp.data.booking_info.capsule_id + '&booking_id=' + resp.data.booking_id + '&area_id=' + resp.data.booking_info.area_id + '&phone=' + that.globalData.localUserInfo.phone + '&appraise_flag=' + resp.data.appraise_flag
                })
              } else if (resp.data.booking_info.status == 2 || resp.data.booking_info.status == 3) {
                wx.reLaunch({
                  url: '../orderPay/orderPay?time=' + timeString + '&final_price=' + resp.data.booking_info.final_price + "&capsule_id=" + resp.data.booking_info.capsule_id + "&balance=" + (resp.data.balance ? resp.data.balance / 100 : 0) + "&need_charge=" + resp.data.need_charge + "&booking_id=" + resp.data.booking_id
                })
              }
            }
          })
        }
      })
    }
    //链接websocket结束
  },
  getUserInfo: function(cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.login({
        success: function() {
          wx.getUserInfo({
            success: function(res) {
              console.log(res)
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },
  getLocalUserInfo: function(cb) {
    var that = this
    if (that.globalData.localUserInfo) {
      typeof cb == "function" && cb(that.globalData.userInfo)
    } else {
      //调用登录接口
      wx.redirectTo({
        url: '/pages/login/login'
      })
    }
  },
  setUserInfo: function(info) {
    that.globalData.userInfo = userinfo
  },
  setLocalUserInfo: function(info) {
    var that = this
    that.globalData.rotateOrigin = 0
    that.globalData.musicPlayId = null
    if (!info || info.keys.count == 0) {
      that.globalData.localUserInfo = {
        uin: 100000
      }
    } else {
      that.globalData.localUserInfo = info
    }
  },
  //初始化健康报告数据
  initHealthReportCache: function() {
    wx.setStorage({
      key: 'healthReportCache',
      data: {},
      complete: function(res) {
        console.log(res)
      }
    })
  },

  globalData: {
    debug: debug,
    userInfo: {
      // uin:'100000'
    },
    is_from_login: 0,
    localUserInfo: {
      uin: 100000
    },
    websocket: 0,
    app_version: '4.7.6',
    phoneService: '400-688-9960',
    baseUrl: debug ?
      'http://dev.xiangshuispace.com:18083/api/' :
      // 'http://dev.xiangshuispace.com:18084/api/' :
      'https://www.xiangshuispace.com/api/',
    config: {
      appraise4: ["空间狭小拥挤", "内饰不够好", "卷帘升降不顺畅", "沙发不够舒适", "控制板位置偏低", "操作略繁琐", "舱内有异味", "私密度不高", "隔音不太好", "灯光偏暗"],
      appraise5: ["外观时尚", "宽敞明亮", "卷帘升降顺畅", "沙发舒适", "控制板位置合适", "操作便利", "APP操作流畅", "干净卫生", "私密性良好", "比较隔音"],
      appraise_bonus: 500,
      invite_bonus: 1000,
      invited_bonus: 8800,
      qa: ["无法开舱", "卷帘无法关闭", "灯不亮", "行李舱无法打开", "座椅无法调节", "充电板无法使用", "舱内脏乱", "有异味", "其他"],
      register_bonus: 6600,
      standard_deposit: 0,
      appraise_title: '请评价您的使用体验'
    }
  },

})

function showVersionUpdate() {
  var baseVersion = ''
  var sysVersion = ''
  wx.getSystemInfo({
    success: function(res) {
      console.log(res)
      baseVersion = res.SDKVersion
      sysVersion = res.version
    }
  })
  var [MAJOR, MINOR, PATCH] = decodeURI(baseVersion).split('.') //baseVersion.split('.').map(Number)
  var [SYS_MAJOR, SYS_MINOR, SYS_PATCH] = decodeURI(sysVersion).split('.') // sysVersion.split('.').map(Number)
  console.log(sysVersion)
  console.log(SYS_MAJOR, SYS_MINOR, SYS_PATCH)
  if (SYS_MAJOR <= 6 && SYS_MINOR <= 5 && SYS_PATCH < 6) {
    wx.showModal({
      content: "未避免影响您使用“享+”的部分功能，建议您升级微信客户端",
      showCancel: false,
      confirmText: "知道了",
      complete: function(res) {
        console.log(res)
      }
    })
  }
}