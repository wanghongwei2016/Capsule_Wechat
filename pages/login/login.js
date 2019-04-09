//loginPage.js
var network = require('../../utils/network.js')
var utils = require("../../utils/util.js")
var app = getApp()
var pageData = {
  data: {
    motto: '获取验证码',
    code_font: 28,
    code_disabled: true,
    login_disabled: true,
    phone: '',
    code: '',
    timeCount: 60,
    userInfo: {},
    loginShadow: '',
    first_show_id: 0
  },
  format: function (val) {
    if (val.length > 3) {
      val = val.slice(0, 3) + ' ' + val.slice(3, val.length);
    }
    if (val.length > 8) {
      val = val.slice(0, 8) + ' ' + val.slice(8, val.length);
    }
    return val;
  },
  inputPhone: function (e) {
    var phone = e.detail.value
    console.log(phone)
    phone = this.format(phone.replace(/\s*/g, ""));
    this.setData({
      phone: phone
    })
    if (phone.length > 0) {
      this.setData({
        phone_delete: true
      })
    } else {
      this.setData({
        phone_delete: false
      })
    }
    var isIOS;
    wx.getSystemInfo({
      success: function (res) {
        // success
        console.log(res)
        isIOS = res.system.toUpperCase().indexOf('IOS') > -1 ? 1 : 0
      }
    })
    if (isIOS === 0) {
      if (phone.length > 13) {
        phone = phone.slice(0, 13)
        this.setData({
          phone: phone
        })
      }
    }
    //如果没有输入手机号，提示输入
    if (phone.replace(/\s*/g, "").length != 11) {
      this.setData({
        code_disabled: true,
        login_disabled: true,
        loginShadow: ''
      })
    } else {
      var codeDisabled = false
      var loginDisabled = false
      var loginShadow = ''
      if (this.data.timeCount == 60) {
        codeDisabled = false;
      } else {
        codeDisabled = true;
      }

      if (this.data.code.length == 4) {
        loginDisabled = false;
        loginShadow = 'button_login_active';
      } else {
        loginDisabled = true;
        loginShadow = '';
      }
      this.setData({
        code_disabled: codeDisabled,
        login_disabled: loginDisabled,
        loginShadow: loginShadow
      })
    }
  },
  inputCode: function (e) {
    var loginDisabled = false;
    var loginShadow = '';
    if (e.detail.value.length > 0) {
      this.setData({
        code_delete: true
      })
    } else {
      this.setData({
        code_delete: false
      })
    }
    if (this.data.phone.replace(/\s*/g, "").length == 11 && e.detail.value.length == 4) {
      loginDisabled = false;
      loginShadow = 'button_login_active';
    } else {
      loginDisabled = true;
      loginShadow = '';
    }
    this.setData({
      code: e.detail.value,
      login_disabled: loginDisabled,
      loginShadow: loginShadow
    })
  },
  /*发送验证码 */
  getCodeAction: function (e) {
    var label = e.target
    var that = this
    this.verifyCodeRequest(0, function callback(res) {
      if (res.data && res.data.ret == 0) {
        timeCutDown()
        that.show('验证码发送成功');
        // wx.showToast({
        //   title: '验证码发送成功',
        //   duration: 2000
        // })
      } else {
        that.setData({
          motto: '重新发送',
          timeCount: 60,
          code_disabled: false
        })
      }
    })
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
        // this.data.motto = '重新发送('+(--timeCount)+')'
        // this.data.timeCount = timeCount;
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

  },
  /**登录 */
  loginAction: function () {
    var that = this
    if (wx.showLoading) {
      wx.showLoading({
        title: "登录中",
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
        network.shareSleepNetwork("user/signup", { phone: that.data['phone'].replace(/\s*/g, ""), verify_code: that.data['code'], wechat_code: res.code }, "POST", function complete(res) {
          if (wx.hideLoading) {
            wx.hideLoading()
          }
          if (res.data.ret == 0) {
            function initUserInfo() {
              var userinfo = that.data.userInfo
              userinfo['uin'] = res['data']['uin']
              userinfo['token'] = res['data']['token']
              userinfo['phone'] = that.data['phone'].replace(/\s*/g, "")
              app.globalData.localUserInfo = userinfo
              app.globalData.loginout = false
              wx.setStorage({
                key: 'localUserCache',
                data: userinfo,
                complete: function (res) {
                  console.log(res)
                }
              })
              app.createSocket(res['data']['uin'], res['data']['token']);
              that.getLocalUserInfo();
            }
            if ((res.data.flag || res.data.flag == 1) && that.data.register_bonus > 0) {
              that.show('领取成功，大礼包已发放至你的账户，请到“我的－优惠券”页面查看')
              setTimeout(initUserInfo, 1000)
            } else {
              initUserInfo()
            }
          } else {
            that.setData({
              login_disabled: false
            })
          }

        }, that)
      },
      fail: function (res) {
        // fail
      },
      complete: function (res) {
        // complete
      }
    })

  },
  //打开用户协议
  protocolShowAction: function () {
    var canIUse = wx.canIUse('web-view');
    if (canIUse) {
      wx.navigateTo({
        url: "/pages/activity/activity?web_view_url=https://www.xiangshuispace.com/www/termsofuse.html"
      })
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
  onLoad: function () {
    var that = this
    // toast组件实例
    new app.ToastPannel();
    app.getLocalUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    })
    console.log(this.data.userInfo)
    app.globalData.loginout = false
    this.setData({
      register_bonus: app.globalData.config.register_bonus == 0 || app.globalData.config.register_bonus ? app.globalData.config.register_bonus / 100 : app.globalData.configDefault.register_bonus / 100
    })
  },
  onUnload: function () {
    var page = getCurrentPages()[0]
    // page.onShow()
    // console.log(page)
  },
  /**
   * 语音验证码
   */
  sendVoiceCodeAction: function () {
    var that = this;
    if (this.data.phone.length == 0) {
      that.show('手机号不能为空');
      return;
    } else if (this.data.phone.replace(/\s*/g, "").length != 11) {
      that.show('请输入正确的手机号');
      return;
    }
    this.verifyCodeRequest(1, function callback(res) {
      if (res.data.ret == 0) {
        that.show('语音验证码发送成功，请注意接听电话');
      }
    })
  },
  /**
   * 请求验证码
   */
  verifyCodeRequest: function (code_type, callback) {
    var that = this
    var dict = { phone: that.data['phone'].replace(/\s*/g, "") }
    if (code_type == 1) {
      dict['type'] = 1
    }
    network.shareSleepNetwork("user/getverificationcode", dict, "POST", function complete(res) {
      if (callback) {
        callback(res)
      }
    }, that)
  },
  /**
   * 获取用户信息
   */
  getLocalUserInfo: function (callBack) {
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
        var userinfo = wx.getStorageSync('localUserCache')
        wx.setStorage({
          key: 'localUserCache',
          data: userinfo,
          complete: function (res) {
            console.log(res)
          }
        })
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
      // if (is_verified == false && that.data.first_show_id == 0 && app.globalData.localUserInfo.uin != 100000) {
      //   wx.redirectTo({
      //     url: '/pages/verifi/verifi',
      //   })
      //   that.setData({
      //     first_show_id: 1
      //   })
      // } 
      // else if (is_verified == true && is_deposit == false && that.data.first_show_id == 0 && app.globalData.localUserInfo.uin != 100000) {
      //   wx.redirectTo({
      //     url: '/pages/depositPay/depositPay?deposit=' + (that.data.deposit_total - that.data.deposit) / 100 + '&back_deposit=' + that.data.back_deposit,
      //   })
      // } else {
      //   var pages = getCurrentPages()
      //   if (pages.length > 1) {
      //     wx.navigateBack({
      //       delta: 1
      //     })
      //   } else {
      //     wx.redirectTo({
      //       url: '/pages/scanCode/scanCode'
      //     })
      //   }
      // }
      if (is_deposit == false && that.data.first_show_id == 0 && app.globalData.localUserInfo.uin != 100000 && false) {
        wx.redirectTo({
          url: '/pages/depositPay/depositPay?deposit=' + (that.data.deposit_total - that.data.deposit) / 100 + '&back_deposit=' + that.data.back_deposit,
        })
      } else {
        var pages = getCurrentPages()
        if (pages.length > 1) {
          wx.navigateBack({
            delta: 1
          })
        } else {
          wx.redirectTo({
            url: '/pages/scanCode/scanCode'
          })
        }
      }
    }, that)
  },
  /**
   * 清除手机号或验证码
   */
  deleteAction: function (e) {
    var deleteType = e.target.dataset.type;
    console.log(deleteType)
    if (deleteType == 'code') {
      this.setData({
        code: '',
        code_delete: false,
        login_disabled: true
      })
    } else if (deleteType == 'phone') {
      this.setData({
        phone: '',
        phone_delete: false,
        code_disabled: true,
        login_disabled: true
      })
    }
  },
  loginByWeChatAction: function (e) {
    var that = this;
    wx.login({
      success: function (res) {
        if (res.code) {
          let code = res.code;
          // 查看是否授权
          wx.getSetting({
            success: function (res) {
              if (res.authSetting['scope.userInfo']) {
                // 已经授权，可以直接调用 getUserInfo 获取头像昵称
                wx.getUserInfo({
                  withCredentials: true,
                  success: function (res) {
                    console.log(code);
                    console.log(res.iv);
                    console.log(res.encryptedData);

                    network.shareSleepNetwork("user/signup", { wechat_code: code, iv: res.iv, dec_data: res.encryptedData }, "POST", function complete(res) {
                      if (wx.hideLoading) {
                        wx.hideLoading()
                      }
                      if (res.data.ret == 0) {
                        function initUserInfo() {
                          var userinfo = that.data.userInfo
                          userinfo['uin'] = res['data']['uin']
                          userinfo['token'] = res['data']['token']
                          userinfo['phone'] = that.data['phone'].replace(/\s*/g, "")
                          app.globalData.localUserInfo = userinfo
                          app.globalData.loginout = false
                          wx.setStorage({
                            key: 'localUserCache',
                            data: userinfo,
                            complete: function (res) {
                              console.log(res)
                            }
                          })
                          app.createSocket(res['data']['uin'], res['data']['token']);
                          that.getLocalUserInfo();
                        }
                        if ((res.data.flag || res.data.flag == 1) && that.data.register_bonus > 0) {
                          that.show('88元大礼包已到账')
                          setTimeout(initUserInfo, 1000)
                        } else {
                          initUserInfo()
                        }
                      } else {
                        that.setData({
                          login_disabled: false
                        })
                      }

                    }, that)


                  }
                })
              }
            }
          })
        } else {
          console.log(res.errMsg)
        }
      }
    });
  }
}
Page(pageData)

function saveUserInfoToLocal(info) {
  wx.setStorage({
    key: 'String',
    data: Object / String,
    success: function (res) {
      // success
    },
    fail: function (res) {
      // fail
    },
    complete: function (res) {
      // complete
    }
  })
}

