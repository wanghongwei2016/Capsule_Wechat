var network = require('../../utils/network.js')
var utils = require("../../utils/util.js")
var request = require('../../utils/request.js').default
const {
  mixins,
  checkPhone,
  Message,
} = require('../../utils/common.js')
var app = getApp()
Page({
  ...mixins,
  data: {
    motto: '获取验证码',
    code_font: 28,
    code_disabled: false,
    login_disabled: false,
    phone: '',
    code: '',
    timeCount: 60,
    userInfo: {},
    loginShadow: '',
    first_show_id: 0
  },
  /*发送验证码 */
  getCodeAction: function(event) {
    if (!checkPhone(this.data.phone)) return Message.msg('手机号码输入有误！');
    const phone = this.data.phone;
    this.selectComponent('#imageCodeModal').open((noncestr, timestamp, sign, code) => {
      request({
        url: '/api/user/getverificationcode',
        method: 'post',
        loading: true,
        data: {
          phone,
          noncestr: noncestr || '',
          timestamp: timestamp || 0,
          sign: sign || '',
          image_code: code || '',
          type: event.currentTarget.dataset.sendtype || 0,
        },
        success: resp => {
          this.selectComponent('#imageCodeModal').close();
          if (event.currentTarget.dataset.sendtype == 1) {
            Message.msg('语音验证码发送成功，请注意接听电话！');
          } else {
            Message.msg('验证码发送成功！');
          }
        }
      });
    });


  },
  /**登录 */
  loginAction: function() {

    if (!checkPhone(this.data.phone)) return Message.msg('手机号码输入有误！');
    if (!/^\d{4,8}$/.test(this.data.code)) return Message.msg('验证码输入有误！');


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
      success: function(res) {
        console.log('wx.login' + res.code)
        network.shareSleepNetwork("user/signup", {
          phone: that.data['phone'].replace(/\s*/g, ""),
          verify_code: that.data['code'],
          wechat_code: res.code
        }, "POST", function complete(res) {
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
                complete: function(res) {
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
      fail: function(res) {
        // fail
      },
      complete: function(res) {
        // complete
      }
    })

  },

  onLoad: function() {
    var that = this
    // toast组件实例
    new app.ToastPannel();
    app.getLocalUserInfo(function(userInfo) {
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
  onUnload: function() {
    var page = getCurrentPages()[0]
    // page.onShow()
    // console.log(page)
  },
  /**
   * 获取用户信息
   */
  getLocalUserInfo: function(callBack) {
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
          complete: function(res) {
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
  deleteAction: function(e) {
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
  loginByWeChatAction: function(e) {
    var that = this;
    wx.login({
      success: function(res) {
        if (res.code) {
          let code = res.code;
          // 查看是否授权
          wx.getSetting({
            success: function(res) {
              if (res.authSetting['scope.userInfo']) {
                // 已经授权，可以直接调用 getUserInfo 获取头像昵称
                wx.getUserInfo({
                  withCredentials: true,
                  success: function(res) {
                    console.log(code);
                    console.log(res.iv);
                    console.log(res.encryptedData);

                    network.shareSleepNetwork("user/signup", {
                      wechat_code: code,
                      iv: res.iv,
                      dec_data: res.encryptedData
                    }, "POST", function complete(res) {
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
                            complete: function(res) {
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
})