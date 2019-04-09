//invitePage.js
var network = require('../../utils/network.js')
var app = getApp()
var QR = require("../../utils/qrcode.js")
Page({
  /**
   * 页面的初始数据
   */
  data: {
    rules_hide: true,
    page_type: 0,//0,邀请好友 1，邀请好友注册 2，邀请好友发放优惠券 3，重复邀请 4、月卡页面进入 5、邀请好友页面进入
    phone: '',
    code: '',
    timeCount: 60,
    motto: '| 获取验证码',
    code_font: 28,
    code_disabled: true,
    login_disabled: true,
    invite_code: '',
    page_from: 0,
    show_alert: 0,// 0 我的，1 结束订单 
    code_hide: true,
    first_show_id: 0,
    hasUin: false,
    invite_bonus:  (app.globalData.config.invite_bonus / 100),
    invited_bonus: (app.globalData.config.invited_bonus / 100),
    codeUrl: 'https://www.xiangshuispace.com/invite/'//默认二维码生成文本 http://dev.h5.xiangshuispace.com/invite/
  },
  onReady: function () {

  },
  onShow: function () {
    let hasUin
    if (app.globalData.localUserInfo.uin === 100000) {
      hasUin = false
    } else {
      hasUin = true
    }
    this.setData({
      hasUin: hasUin
    })
  },
  /**
   * 控制活动规则的显示和隐藏
   */
  toggleRulesAction: function () {
    this.setData({
      rules_hide: !this.data.rules_hide
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('newInvite options====================')
    console.log(options)
    // toast组件实例
    new app.ToastPannel();
    if (!isNaN(options.type)) {
      this.setData({
        page_type: options.type,
        invite_code: options.uin
      })
      console.log('page_type:' + this.data.page_type)
    }
    if (!isNaN(options.page_from)) {
      this.setData({
        page_from: options.page_from
      })
    }
  },
  inputPhone: function (e) {
    var phone = e.detail.value
    this.setData({
      phone: phone
    })
    //如果没有输入手机号，提示输入
    if (phone.length != 11) {
      this.setData({
        code_disabled: true,
        login_disabled: true
      })
    } else {
      var codeDisabled = false
      var loginDisabled = false
      if (this.data.timeCount == 60) {
        codeDisabled = false;
      } else {
        codeDisabled = true;
      }

      if (this.data.code.length == 4) {
        loginDisabled = false
      } else {
        loginDisabled = true
      }
      this.setData({
        code_disabled: codeDisabled,
        login_disabled: loginDisabled
      })
    }
  },
  inputCode: function (e) {
    var loginDisabled = false
    if (this.data.phone.length == 11 && e.detail.value.length == 4) {
      loginDisabled = false
    } else {
      loginDisabled = true
    }
    this.setData({
      code: e.detail.value,
      login_disabled: loginDisabled
    })
  },
  /*发送验证码 */
  getCodeAction: function (e) {
    var label = e.target
    var that = this
    verifyCodeRequest(that)
    that.setData({
      code_disabled: true
    })
    // 倒计时功能
    function timeCutDown() {
      var time = that.data['motto']
      var count = that.data.timeCount;
      if (count == 60) {
        that.setData({
          code_disabled: true
        })
      }
      if (count > 1) {
        that.setData({
          motto: (--count) + 's后重发',
          timeCount: count,
          code_font: 22
        })
        setTimeout(function () {
          timeCutDown()
        }, 1000)
      } else {
        // this.data.motto = '重新发送'
        that.setData({
          motto: '重新发送',
          timeCount: 60,
          code_disabled: false
        })
      }
    }
    function verifyCodeRequest(that) {
      network.shareSleepNetwork("user/getverificationcode", { phone: that.data['phone'] }, "POST", function complete(res) {
        if (res.data && res.data.ret == 0) {
          timeCutDown()
          that.show('验证码发送成功');
        } else {
          that.setData({
            motto: '重新发送',
            timeCount: 60,
            code_disabled: false
          })
        }
      },that)
    }
  },
  /**登录 */
  loginAction: function () {
    var that = this
    if (wx.showLoading) {
      wx.showLoading({
        title: "注册中",
        duration: 2000
      })
    } else {
      that.setData({
        login_disabled: true
      })
    }
    wx.login({
      success: function (res) {
        console.log('wx.login' + res.code)
        var params = { phone: that.data['phone'], verify_code: that.data['code'], wechat_code: res.code }
        if (that.data.invite_code != 100000) {
          params['invite_code'] = that.data.invite_code
        }
        network.shareSleepNetwork("user/signup", params, "POST", function complete(res) {
          console.log(res);
          if (wx.hideLoading) {
            wx.hideLoading()
          }
          if (res.data.ret == 0) {
            var userinfo = {}
            userinfo['uin'] = res['data']['uin']
            userinfo['token'] = res['data']['token']
            app.globalData.localUserInfo = userinfo
            wx.setStorage({
              key: 'localUserCache',
              data: userinfo,
              complete: function (res) {
                console.log(res)
              }
            })
            if (that.data.page_type in [0,2,3]) {
              var pages = getCurrentPages()
              if (wx.reLaunch) {
                wx.reLaunch({
                  url: '/pages/scanCode/scanCode'
                })
              } else if (pages.count > 1) {
                wx.navigateBack({
                  delta: pages - 1
                })
              }
            } else {
              wx.showModal({
                content: '领取成功，大礼包已发放至你的账户，请到“我的-钱包-优惠券”页面查看',
                confirmText: "确定",
                success: function (res) {
                  if (res.confirm) {
                    that.getLocalUserInfo();                    
                  }
                }
              })
            }
          } else {
            that.setData({
              login_disabled: false
            })
            if (res.data.ret == -1017 || res.data.ret == -1016) {//重复领取、老用户使用
              wx.showModal({
                content: '亲已注册过了，您可邀请新用户注册领取大礼包哦!',
                confirmText: "确定",
                success: function (res) {
                  if (res.confirm) {
                    if (that.data.page_type in [0,1,2,3]){
                      wx.reLaunch({
                        url: '/pages/scanCode/scanCode',
                      })
                    }else{
                      that.getLocalUserInfo()
                    }
                   
                  }
                }
              })
            }
          }

        },that)
      },
      fail: function (res) {
        // fail
      },
      complete: function (res) {
        // complete
      }
    })

  },
  onShareAppMessageBefore: function () {
    if (app.globalData.localUserInfo.uin === 100000) {
      wx.showModal({
        content: '登录后才能邀请好友哦~',
        confirmText: '去登录',
        success: function (res) {
          if (res.confirm) {
            wx.navigateTo({
              url: "/pages/login/login"
            })
          }
        }
      })
      return
    }
    this.onShareAppMessage()
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var ret = lowerVersion('6.5.8')
    console.log(ret)
    if (ret == true) {
      wx.showModal({
        title: '提示',
        content: '您的微信版本暂不支持此功能，请升级后使用',
      })
      return
    }
    var that = this
    if (this.data.page_type == 1) {
      if (app.globalData.localUserInfo.uin === 100000) {
        wx.showModal({
          content: '登录后才能邀请好友哦~',
          confirmText: '去登录',
          success: function (res) {
            if (res.confirm) {
              wx.navigateTo({
                url: "/pages/login/login"
              })
            }
          }
        })
        return
      }
      console.log('/pages/scanCode/scanCode?invite=1&uin=' + app.globalData.localUserInfo.uin + "&type=1");
      return {
        title: `您的好友送您${this.data.invited_bonus}元头等舱红包!新用户尊享1小时免费体验！`,
        path: '/pages/scanCode/scanCode?invite=1&uin=' + app.globalData.localUserInfo.uin + "&type=1",
        imageUrl: 'https://s3.cn-north-1.amazonaws.com.cn/areaimgs/7C202C26F8DCFED2F5DE4786567D66EF',
        success: function (res) {
          that.show('邀请成功');
        },
        fail: function (res) {
          that.show('邀请失败，请重试');
        }
      }
    }else{
      if (app.globalData.localUserInfo.uin === 100000) {
        wx.showModal({
          content: '登录后才能邀请好友哦~',
          confirmText: '去登录',
          success: function (res) {
            if (res.confirm) {
              wx.navigateTo({
                url: "/pages/login/login"
              })
            }
          }
        })
        return
      }
      console.log('/pages/scanCode/scanCode?invite=1&uin=' + app.globalData.localUserInfo.uin + "&type=1")
      return {
        title: `您的好友送您${this.data.invited_bonus}元头等舱红包!新用户尊享1小时免费体验！`,
        path: '/pages/scanCode/scanCode?invite=1&uin=' + app.globalData.localUserInfo.uin + "&type=1",
        imageUrl: 'https://s3.cn-north-1.amazonaws.com.cn/areaimgs/7C202C26F8DCFED2F5DE4786567D66EF',
        success: function (res) {                    
          that.show('邀请成功');
        },
        fail: function (res) {
          console.log(res)
          that.show('邀请失败，请重试');
        }
      }
    }
  },

  buttonAction: function () {
    if (this.data.page_type == 0) {
      this.onShareAppMessage()
    } else if (this.data.page_type == 1 || this.data.page_type == 4 || this.data.page_type == 5) {
      this.loginAction()
    } else if (this.data.page_type == 2 || this.data.page_type == 3) {
      wx.reLaunch({
        url: '/pages/scanCode/scanCode',
      })
    }
  },
  action: function () {

  },
  //适配不同屏幕大小的canvas
  setCanvasSize: function () {
    var size = {};
    try {
      var res = wx.getSystemInfoSync();
      var scale = 750 / 400;//不同屏幕下canvas的适配比例；设计稿是750宽
      var width = res.windowWidth / scale;
      var height = width;//canvas画布为正方形
      size.w = width;
      size.h = height;
    } catch (e) {
      // Do something when catch error
      console.log("获取设备信息失败" + e);
    }
    return size;
  },
  createQrCode: function (url, canvasId, cavW, cavH) {
    //调用插件中的draw方法，绘制二维码图片
    QR.qrApi.draw(url, canvasId, cavW, cavH);

  },
  creatCodeAction: function () {
    if (app.globalData.localUserInfo.uin === 100000) {
      wx.showModal({
        content: '登录后才能邀请好友哦~',
        confirmText: '去登录',
        success: function (res) {
          if (res.confirm) {
            wx.navigateTo({
              url: "/pages/login/login"
            })
          }
        }
      })
      return
    }
    var that = this;
    var url = that.data.codeUrl + '#/invite/' + app.globalData.localUserInfo.uin;
    console.log(url)
    that.setData({
      code_hide: false
    })
    var size = that.setCanvasSize();
    //绘制二维码
    that.createQrCode(url, "mycanvas", size.w, size.h);
  },
  hideCodeAction: function(){
    this.setData({
      code_hide: true
    })
  },
  /**
   * 获取用户信息
   */
  getLocalUserInfo: function (callBack) {
    console.log("获取用户信息");
    var that = this
    var is_verified = false
    var is_deposit = false
    var back_deposit = false

    if (wx.showLoading) {
      wx.showLoading({
        title: '加载中',
        mask: true
      })
    }
    network.shareSleepNetwork("user/info", {}, "GET", function complete(res) {
      if (wx.hideLoading) {
        wx.hideLoading()
      }
      if (res.data && res.data.ret == 0) {
        console.log(res)
        if (res.data.user_info.id_verified == 1) {
          is_verified = true
        }
        if (res.data.user_info.deposit >= res.data.standard_deposit) {
          is_deposit = true
        }

        that.setData({
          deposit_total: res.data.standard_deposit ? res.data.standard_deposit : 0,
          deposit: res.data.user_info.deposit ? res.data.user_info.deposit : 0,
          is_deposit: is_deposit,
          back_deposit: res.data.user_info.deposit > 0 && res.data.user_info.deposit < res.data.standard_deposit ? 'true' : 'false'
        })

        if (callBack) {
          callBack()
        }
      } else {
        that.show('用户信息更新失败，请重试')
      }
      if (is_deposit == false && that.data.first_show_id == 0 && app.globalData.localUserInfo.uin != 100000) {
        wx.redirectTo({
          url: '/pages/depositPay/depositPay?deposit=' + (that.data.deposit_total - that.data.deposit) / 100 + '&back_deposit=' + that.data.back_deposit,
        })
      } else {
        setTimeout(function () {
          wx.navigateBack({
            delta: 1
          })
        }, 0)
      }
      // if (is_verified == false && that.data.first_show_id == 0 && app.globalData.localUserInfo.uin != 100000) {
      //   wx.redirectTo({
      //     url: '/pages/verifi/verifi',
      //   })
      //   that.setData({
      //     first_show_id: 1
      //   })
      // } else if (is_verified == true && is_deposit == false && that.data.first_show_id == 0 && app.globalData.localUserInfo.uin != 100000) {
      //   wx.redirectTo({
      //     url: '/pages/depositPay/depositPay?deposit=' + (that.data.deposit_total - that.data.deposit) / 100 + '&back_deposit=' + that.data.back_deposit,
      //   })
      // } else {
      //   setTimeout(function () {
      //     wx.navigateBack({
      //       delta: 1
      //     })
      //   }, 0)
      // }
    },that)
  }
})
function lowerVersion(standardVersion) {
  var baseVersion = ''
  var sysVersion = ''
  wx.getSystemInfo({
    success: function (res) {
      // success
      console.log(res)
      baseVersion = res.SDKVersion
      sysVersion = res.version
    }
  })
  var [MAJOR, MINOR, PATCH] = decodeURI(baseVersion).split('.')
  var [SYS_MAJOR, SYS_MINOR, SYS_PATCH] = decodeURI(sysVersion).split('.')
  var [BASE_MAJOR, BASE_MINOR, BASE_PATCH] = standardVersion.split('.')
  console.log(sysVersion)
  console.log(SYS_MAJOR, SYS_MINOR, SYS_PATCH)
  console.log(BASE_MAJOR, BASE_MINOR, BASE_PATCH)

  if (parseInt(SYS_MAJOR) <= parseInt(BASE_MAJOR) && parseInt(SYS_MINOR) <= parseInt(BASE_MINOR) && parseInt(SYS_PATCH) < parseInt(BASE_PATCH)) {
    return true;
  }
  return false
}