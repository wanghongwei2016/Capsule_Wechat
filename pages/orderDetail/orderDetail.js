//orderDetailPage.js
var app = getApp()
var network = require("../../utils/network.js")
var utils = require("../../utils/util.js")
var storageService = require('../../utils/storageService.js').default
var pageData = {
  data: {
    count_show: "00:00:00",
    count_end: false,
    booking_id: 0,
    calculate_rule: "0.2元/分钟，高峰期0.3/分钟",
    endLivingDisabled: false,
    capsule_id: "1000000000",
    gate_capsule_id: "0",
    phoneService: app.globalData.phoneService,
    endSrc: '../../images/count_end.png',
    downSrc: '../../images/count_down.png',
    upSrc: '../../images/count_up.png',
    openSrc: '../../images/count_open.png',
    lightSrc: '../../images/count_light.png',
    fanSrc: '../../images/count_fan.png',
    bloodPressureSrc: '../../images/bloodPressure.png',
    heartRateSrc: '../../images/heartRate.png',
    healthSrc: '../../images/health.png',
    bloodPressureActive: false,
    heartRateActive: false,
    alarmClockActive: false,
    capsule_version: 1,
    moreShow: false,
    activity_list: [],
    failReqestNum: 0, //记录请求下订单接口的次数
    hideErrorTag: true,
    showed_buy_card: 1, //默认不显示买单特惠， 第一次点击结束订单才会显示 1初始状态，未请求过接口，不显示弹框 2 请求过预结算 可弹出窗口  3 请求过 被关闭 不再请求接口
    auto_end: false
  },
  onLoad: function(options) {
    // 生命周期函数--监听页面加载
    // toast组件实例
    new app.ToastPannel();
    var that = this
    var d = new Date()
    var calculate_rule = options.calculate_rule
    that.setData({
      booking_id: options.booking_id,
      calculate_rule: calculate_rule,
      capsule_id_origin: options.capsule_id,
      capsule_id: (options.capsule_id.length == 10 ? options.capsule_id.substring(7, 10) : options.capsule_id),
      gate_capsule_id: options.gate_capsule_id ? options.gate_capsule_id : "0"
    })

    function timeKeeper(timeCount) {
      if (that.data.count_end == true) {
        clearInterval()
      }
      var timeShow = utils.timeShowString(Date.now() / 1000 - options.create_time);
      that.setData({
        count_show: timeShow
      })
    }
    setInterval(function() {
      timeKeeper(that.data.count)
    }, 1000)
    this.checkHealthReportCache()
    this.requestActivityList()
    if (!storageService.hadMusicActModal(this.data.booking_id)) {
      setTimeout(() => {
        this.showActModal();
        storageService.setMusicActModal(this.data.booking_id);
      }, 1000);
    }

  },
  showActModal: function() {
    this.setData({
      showActModal: true,
    });
  },
  hideActModal: function() {
    this.setData({
      showActModal: false,
    });
  },
  gotoActPage: function() {
    this.hideActModal();
    wx.navigateTo({
      url: '/pages/act_make_money/act_make_money',
    })
  },
  gotoMusic: function() {
    this.hideActModal();
    wx.navigateTo({
      url: '/pages/music/music',
    })
  },
  gotoMusicActDetail: function() {
    wx.navigateTo({
      url: '/pages/act_music/act_music',
    })
  },
  onShow: function() {
    var that = this;
    wx.setNavigationBarTitle({
      title: '正在使用'
    })
    if (that.data.booking_id) {
      network.shareSleepNetwork('booking/bookingid/' + that.data.booking_id, {}, "GET", function complete(resp) {
        that.setData({
          area_id: resp.data.booking_info.area_id,
          appraise_flag: resp.data.appraise_flag,
          capsule_version: resp.data.capsule_version ? resp.data.capsule_version : 1,
          device_flag: resp.data.device_flag,
          month_card_flag: resp.data.month_card_flag,
          month_card_end_time: resp.data.month_card_end_time,
        })
        var timeString = utils.timeShowString(resp.data.booking_info.end_time - resp.data.booking_info.create_time)
        if (resp.data.booking_info.status == 4) {
          wx.redirectTo({
            url: '../paySucc/paySucc?time=' + timeString + '&final_price=' + resp.data.booking_info.final_price + "&capsule_id=" + resp.data.booking_info.capsule_id + "&balance=" + (resp.data.balance ? resp.data.balance / 100 : 0) + '&capsule_id_origin=' + that.data.capsule_id_origin + '&booking_id=' + that.data.booking_id + '&area_id=' + that.data.area_id + '&phone=' + app.globalData.localUserInfo.phone + '&appraise_flag=' + that.data.appraise_flag
          })
        } else if (resp.data.booking_info.status == 2 || resp.data.booking_info.status == 3) {
          wx.reLaunch({
            url: '../orderPay/orderPay?time=' + timeString + '&final_price=' + resp.data.booking_info.final_price + "&capsule_id=" + resp.data.booking_info.capsule_id + "&balance=" + (resp.data.balance ? resp.data.balance / 100 : 0) + "&need_charge=" + resp.data.need_charge + "&booking_id=" + resp.data.booking_id
          })
        }
      }, that)
    }
    //如果auto_end 为true  则自动显示结束弹框
    if (this.data.auto_end == true) {
      this.handEndBooking(() => {})
    }
  },
  /**
   * 跳转到活动页面
   */
  webViewAction: function(event) {
    var url = event.currentTarget.dataset.url;
    var canIUse = wx.canIUse('web-view');
    console.log(canIUse)
    if (canIUse) {
      if (url == 'xiangshui://mine/convert') {
        wx.navigateTo({
          url: "/pages/redeem/redeem"
        })
      } else if (url == 'xiangshui://mine/month_card') {
        wx.navigateTo({
          url: '/pages/card/card?share=1',
        })
      } else if (url.search('xiangshui:') == 0) {
        wx.navigateTo({
          url: url.substring('xiangshui:'.length),
        })
      } else {
        wx.navigateTo({
          url: "/pages/activity/activity?web_view_url=" + url
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
  //获取活动列表
  requestActivityList: function() {
    var that = this
    network.shareSleepNetwork("/booking/get_activity_list", {}, "GET", function complete(res) {
      if (parseInt(res.data.ret) == 0 && res.data.activity_list && res.data.activity_list.length > 0) {
        that.setData({
          activity_list: res.data.activity_list
        })
        console.log(res.data.activity_list)
      }
    }, that)
  },
  //检测有无健康数据缓存，没有的话初始化healthReportCache
  checkHealthReportCache: function() {
    try {
      var value = wx.getStorageSync('healthReportCache')
      console.log(value)
      if (!value) {
        //初始化健康报告缓存
        app.initHealthReportCache()
      }
    } catch (e) {
      console.log('未获取到缓存数据！');
    }
  },
  //跳转到故障页面
  faultReportAction: function() {
    // utils.callService()
    wx.navigateTo({
      url: '../faultReport/faultReport?capsule_id=' + this.data.capsule_id_origin + '&booking_id=' + this.data.booking_id + '&area_id=' + this.data.area_id + '&phone=' + app.globalData.localUserInfo.phone
    })
  },

  //使用流程
  normalQuestionsAction: function() {
    console.log(1)
    var canIUse = wx.canIUse('web-view');
    if (canIUse) {
      wx.navigateTo({
        url: "/pages/activity/activity?web_view_url=https://www.xiangshuispace.com/www/qa.html"
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
  repeatRequest: function() {
    var that = this
    that.setData({
      failReqestNum: that.data.failReqestNum + 1
    })
    setTimeout(() => {
      console.log(that.data.failReqestNum)
      if (that.data.failReqestNum === 2) {
        that.setData({
          hideErrorTag: false
        })
      }
      if (that.data.failReqestNum === 3) {
        if (wx.hideLoading) {
          wx.hideLoading()
        }
        that.setData({
          hideErrorTag: true,
          failReqestNum: 0
        })
      } else {
        setTimeout(() => {
          this.terminateSleepAction()
        }, 1500)
      }
    }, 0)
  },
  //结束入住，更新订单信息
  terminateSleepAction: function(e) {
    var that = this


    if (this.data.month_card_flag != 1 && this.data.showed_buy_card == 1) {
      this.cardPayTryAction(function cardPayTryAction(ret) {
        if (!ret) {
          that.endOrderAction()
        }
      })
    } else if (this.data.month_card_end_time &&
      this.data.month_card_end_time > 0 &&
      this.data.showed_buy_card == 1 &&
      this.data.month_card_end_time * 1000 - new Date().getTime() <= 1000 * 60 * 60 * 24 * 5) {
      this.setData({
        month_card_days: Math.ceil((this.data.month_card_end_time * 1000 - new Date().getTime()) / (1000 * 60 * 60 * 24))
      });
      this.cardPayTryAction(function cardPayTryAction(ret) {
        if (!ret) {
          that.endOrderAction()
        }
      })
    } else {
      that.endOrderAction()
    }
  },

  endOrderAction: function() {

    var that = this
    if (wx.showLoading) {
      wx.showLoading({
        title: "正在结束订单"
      })
    }
    var data = wx.getStorageSync('healthReportCache')
    var muse_flag = data.muse_flag ? 1 : 0;
    var face_flag = data.face_flag ? 1 : 0;
    var health_flag = data.health_flag ? 1 : 0;
    var heart_flag = data.heart_flag ? 1 : 0;
    var blood_flag = data.blood_flag ? 1 : 0;
    network.shareSleepNetwork('booking/update', {
      to_status: 2,
      from_status: 1,
      booking_id: parseInt(that.data.booking_id),
      muse_flag,
      face_flag,
      health_flag,
      heart_flag,
      blood_flag
    }, "POST", function complete(res) {
      if (res.data.ret == 0 || res.data.ret == -3042) { //-3042订单已经结束
        console.log("结束订单=====")
        console.log(res)
        if (wx.hideLoading) {
          wx.hideLoading()
        }
        that.setData({
          endLivingDisabled: false
        })
        var balance = res.data.balance ? res.data.balance : 0;
        var final_price = res.data.booking_info.final_price ? res.data.booking_info.final_price : 0;
        console.log(balance);
        if (res.data.ret == 0 && res.data.booking_info.status == 4) {
          //如果有后台背景音乐播放，则停止播放
          const backgroundAudioManager = wx.getBackgroundAudioManager();
          if (backgroundAudioManager.src) {
            backgroundAudioManager.stop();
          }
          //订单结束，请求支付
          var timeString = utils.timeShowString(res.data.booking_info.end_time - res.data.booking_info.create_time)
          wx.redirectTo({
            url: '../paySucc/paySucc?time=' + timeString + '&final_price=' + res.data.booking_info.final_price + "&capsule_id=" + res.data.booking_info.capsule_id + "&balance=" + (res.data.balance ? res.data.balance / 100 : 0) + '&capsule_id_origin=' + that.data.capsule_id_origin + '&booking_id=' + that.data.booking_id + '&area_id=' + that.data.area_id + '&phone=' + app.globalData.localUserInfo.phone + '&appraise_flag=' + that.data.appraise_flag
          })
        } else if (res.data.ret == -3011) {

          if (!that.data.hideErrorTag) {
            //如果是结束订单时舱门未关，错误提示显示3s
            // that.show(res.data.err, 3000);
            wx.showModal({
              content: res.data.err,
              confirmText: "结束使用",
              success: function(resp) {
                if (resp.confirm) {
                  that.endOrderAction();
                }
              }
            })
          }
        } else {
          //如果有后台背景音乐播放，则停止播放
          const backgroundAudioManager = wx.getBackgroundAudioManager();
          if (backgroundAudioManager.src) {
            backgroundAudioManager.stop();
          }
          //订单结束，请求支付
          var timeString = utils.timeShowString(res.data.booking_info.end_time - res.data.booking_info.create_time)
          console.log('订单结束，从详情去支付页面' + timeString)
          wx.reLaunch({
            url: '../orderPay/orderPay?time=' + timeString + '&final_price=' + res.data.booking_info.final_price + "&capsule_id=" + res.data.booking_info.capsule_id + "&balance=" + (res.data.balance ? res.data.balance / 100 : 0) + "&need_charge=" + res.data.need_charge + "&booking_id=" + res.data.booking_id
          })
        }
      } else if (res.data.ret == -3011 && that.data.failReqestNum == 2) {
        if (wx.hideLoading) {
          wx.hideLoading()
        }
        //如果是结束订单时舱门未关，错误提示显示3s
        // that.show(res.data.err, 3000);
        wx.showModal({
          content: res.data.err,
          confirmText: "结束使用",
          success: function(resp) {
            if (resp.confirm) {
              // that.setData({ failReqestNum: 0 });
              // that.repeatRequest()
              that.endOrderAction();
            }
          }
        })
      } else if (res.data.ret == -3111) {
        //三次未结束订单，第四次给用户手动结束选项
        if (wx.hideLoading) {
          wx.hideLoading()
        }
        wx.showModal({
          title: '',
          content: '如您已出舱并关闭舱门,请点击“确认”结束订单',
          showCancel: true,
          confirmText: "确认",
          success: function(resp) {
            if (resp.confirm) {
              // that.setData({ failReqestNum: 0 });
              // that.repeatRequest()
              that.endOrderAction()
            }
          }
        })
      } else if (res.data.ret == -3112) {
        // 舱内感应有人  无法手动结束
        if (wx.hideLoading) {
          wx.hideLoading()
        }
        // if (!that.data.hideErrorTag) {
        //如果是结束订单时舱门未关，错误提示显示3s
        that.show(res.data.err, 3000);
        // }
      } else {
        that.repeatRequest()
      }
    }, that, function errBack() {
      that.repeatRequest()
    }, that.data.hideErrorTag)
  },

  openGateAction: function() {
    var that = this
    network.shareSleepNetwork("capsule/" + that.data.gate_capsule_id + "/info", {}, "GET", function complete(res) {
      if (parseInt(res.data.ret) == 0) {
        if (parseInt(res.data.capsule_info.type) >= 99) {
          that.show('大门已解锁，欢迎来到享+')
        }
      }
    }, that)
  },
  // 开窗
  openTemporaryAction: function(callback) {
    var that = this
    if (wx.showLoading) {
      wx.showLoading({
        title: "正在为您开舱"
      })
    }
    network.shareSleepNetwork("capsule/openwindow", {
      booking_id: parseInt(that.data.booking_id)
    }, "POST", function compllete(res) {
      if (wx.hideLoading) {
        wx.hideLoading()
      }
      if (res.data && res.data.ret == 0) {
        that.show('已为您开舱');
      }
    }, that)
    if (this.data.capsule_version == 2) {
      if (callback) {
        callback()
      }
    }
  },
  // 关窗
  closeTemporaryAction: function() {
    var that = this
    if (wx.showLoading) {
      wx.showLoading({
        title: "正在为您关帘"
      })
    }
    network.shareSleepNetwork("capsule/closewindow", {
      booking_id: parseInt(that.data.booking_id)
    }, "POST", function compllete(res) {
      if (wx.hideLoading) {
        wx.hideLoading()
      }
      if (res.data && res.data.ret == 0) {}
    }, that)
  },
  //跳转到音乐界面
  openMusicAction: function() {
    wx.navigateTo({
      url: '/pages/music/music',
    })
  },
  handEndBooking: function(callback) {
    var that = this;

    if (!storageService.hadMonthCardModal(this.data.booking_id)) {
      if (this.data.month_card_flag != 1 ||
        (
          this.data.month_card_end_time && this.data.month_card_end_time > 0 &&
          this.data.month_card_end_time * 1000 - new Date().getTime() <= 1000 * 60 * 60 * 24 * 5
        )
      ) {
        this.setData({
          month_card_days: Math.ceil((this.data.month_card_end_time * 1000 - new Date().getTime()) / (1000 * 60 * 60 * 24))
        });
        this.cardPayTryAction((ret) => {
          if (!ret) {
            this.endOrderAction()
          }
        })
        return;
      }
    }

    wx.showModal({
      title: "是否已出舱？",
      content: '结束使用后，紫外灯消毒即将启动',
      confirmText: "已出舱",
      success: function(res) {
        if (res.confirm) {
          that.endOrderAction()
        }
      }
    })
    if (this.data.capsule_version == 2) {
      callback()
    }
  },
  searchChargeAction: function() {
    var that = this;
    if (wx.showLoading) {
      wx.showLoading({
        title: "正在为您查询"
      })
    }
    network.shareSleepNetwork("booking/checkprice", {
      booking_id: parseInt(that.data.booking_id)
    }, "POST", function compllete(res) {
      if (wx.hideLoading) {
        wx.hideLoading()
      }
      console.log(res);
      var priceText = `当前预计花费：${res.data.price ? (res.data.price / 100).toFixed(2) : 0}元`
      if (res.data.ret == 0) {
        wx.showModal({
          title: "当前费用",
          content: priceText,
          showCancel: false
        })
      }
    }, that)
  },
  /**
   * 拨打客服电话
   */
  callServiceAction: function() {
    utils.callService(this.data.phoneService)
  },
  /**
   * 底部跳转页面
   */
  jumpTo: function(e) {
    var jumpType = e.currentTarget.dataset.type
    if (jumpType == 'music') {
      wx.navigateTo({
        url: '/pages/music/music',
      })
    } else if (jumpType == 'skin') {
      wx.navigateTo({
        url: '/pages/skinTest/skinTest?page_from=orderDetail',
      })
    } else if (jumpType == 'alarmClock') {
      if (this.data.device_flag === '0') {
        wx.showModal({
          title: "提示",
          content: '功能即将开放，敬请期待！',
          confirmText: "知道了",
          showCancel: false
        })
      } else {
        wx.navigateTo({
          url: '/pages/alarmClock/alarmClock?page_from=orderDetail&booking_id=' + this.data.booking_id,
        })
      }
    } else if (jumpType == 'more') {
      this.setData({
        moreShow: true
      })
    }
  },
  /**
   * 切换按键状态
   */
  changeStatus: function(e) {
    var functionType = e.currentTarget.dataset.function
    console.log(functionType)
    if (functionType == 'end') {
      this.setData({
        endSrc: '../../images/count_end_active.png'
      })
    } else if (functionType == 'down') {
      this.setData({
        downSrc: '../../images/count_down_active.png'
      })
    } else if (functionType == 'up') {
      this.setData({
        upSrc: '../../images/count_up_active.png'
      })
    } else if (functionType == 'open') {
      this.setData({
        openSrc: '../../images/count_open_active.png'
      })
    } else if (functionType == 'light') {
      this.setData({
        lightSrc: '../../images/count_light_active.png'
      })
    } else if (functionType == 'fan') {
      this.setData({
        fanSrc: '../../images/count_fan_active.png'
      })
    } else if (functionType == 'bloodPressure') {
      this.setData({
        bloodPressureSrc: '../../images/bloodPressureActive.png',
        bloodPressureActive: true
      })
    } else if (functionType == 'heartRate') {
      this.setData({
        heartRateSrc: '../../images/heartRateActive.png',
        heartRateActive: true
      })
    } else if (functionType == 'health') {
      this.setData({
        healthSrc: '../../images/healthActive.png',
        healthActive: true
      })
    }
  },
  backStatus: function(e) {
    var functionType = e.currentTarget.dataset.function
    if (functionType == 'end') {
      this.setData({
        endSrc: '../../images/count_end.png'
      })
    } else if (functionType == 'down') {
      this.setData({
        downSrc: '../../images/count_down.png'
      })
    } else if (functionType == 'up') {
      this.setData({
        upSrc: '../../images/count_up.png'
      })
    } else if (functionType == 'open') {
      this.setData({
        openSrc: '../../images/count_open.png'
      })
    } else if (functionType == 'light') {
      this.setData({
        lightSrc: '../../images/count_light.png'
      })
    } else if (functionType == 'fan') {
      this.setData({
        fanSrc: '../../images/count_fan.png'
      })
    } else if (functionType == 'bloodPressure') {
      this.setData({
        bloodPressureSrc: '../../images/bloodPressure.png',
        bloodPressureActive: false
      })
    } else if (functionType == 'heartRate') {
      this.setData({
        heartRateSrc: '../../images/heartRate.png',
        heartRateActive: false
      })
    } else if (functionType == 'health') {
      this.setData({
        healthSrc: '../../images/health.png',
        healthActive: false
      })
    }
  },
  handleSearchRule: function() {
    var that = this
    wx.showModal({
      title: "使用规则",
      content: that.data.calculate_rule,
      showCancel: false,
    })
  },
  handleFunction: function(e) {
    var functionType = e.currentTarget.dataset.function
    var that = this
    if (functionType == 'end') {
      that.setData({
        endSrc: '../../images/count_end_active.png'
      })
      that.handEndBooking(() => {
        setTimeout(() => {
          that.setData({
            endSrc: '../../images/count_end.png'
          })
        }, 300)
      })
    } else if (functionType == 'down') {
      that.setData({
        downSrc: '../../images/count_down_active.png'
      })
      network.shareSleepNetwork("capsule/opr_chair", {
        capsule_id: parseInt(that.data.capsule_id_origin),
        opr_flag: 1
      }, "POST", function compllete(res) {
        if (wx.hideLoading) {
          wx.hideLoading()
        }
        if (res.data && res.data.ret == 0) {
          that.show('操作成功');
        }
      }, that)
      setTimeout(() => {
        that.setData({
          downSrc: '../../images/count_down.png'
        })
      }, 300)
    } else if (functionType == 'up') {
      that.setData({
        upSrc: '../../images/count_up_active.png'
      })
      network.shareSleepNetwork("capsule/opr_chair", {
        capsule_id: parseInt(that.data.capsule_id_origin),
        opr_flag: 2
      }, "POST", function compllete(res) {
        if (wx.hideLoading) {
          wx.hideLoading()
        }
        if (res.data && res.data.ret == 0) {
          that.show('操作成功');
        }
      }, that)
      setTimeout(() => {
        that.setData({
          upSrc: '../../images/count_up.png'
        })
      }, 300)
    } else if (functionType == 'open') {
      that.setData({
        openSrc: '../../images/count_open_active.png'
      })
      that.openTemporaryAction(() => {
        setTimeout(() => {
          that.setData({
            openSrc: '../../images/count_open.png'
          })
        }, 300)
      })
    } else if (functionType == 'light') {
      that.setData({
        lightSrc: '../../images/count_light_active.png'
      })
      network.shareSleepNetwork("capsule/opr_device", {
        capsule_id: parseInt(that.data.capsule_id_origin),
        device_serial: 1,
        opr_type: 1
      }, "POST", function compllete(res) {
        if (wx.hideLoading) {
          wx.hideLoading()
        }
        if (res.data && res.data.ret == 0) {
          that.show('灯已开');
        }
      }, that)
      setTimeout(() => {
        that.setData({
          lightSrc: '../../images/count_light.png'
        })
      }, 300)
    } else if (functionType == 'fan') {
      that.setData({
        fanSrc: '../../images/count_fan_active.png'
      })
      network.shareSleepNetwork("capsule/opr_device", {
        capsule_id: parseInt(that.data.capsule_id_origin),
        device_serial: 1,
        opr_type: 2
      }, "POST", function compllete(res) {
        if (wx.hideLoading) {
          wx.hideLoading()
        }
        if (res.data && res.data.ret == 0) {
          that.show('灯已关');
        }
      }, that)
      setTimeout(() => {
        that.setData({
          fanSrc: '../../images/count_fan.png'
        })
      }, 300)
    } else if (functionType == 'bloodPressure') {
      that.setData({
        bloodPressureSrc: '../../images/bloodPressureActive.png',
        bloodPressureActive: true
      })
      setTimeout(() => {
        that.setData({
          bloodPressureSrc: '../../images/bloodPressure.png',
          bloodPressureActive: false
        })
      }, 300)
      if (this.data.device_flag === '0') {
        wx.showModal({
          title: "提示",
          content: '功能即将开放，敬请期待！',
          confirmText: "确定",
          showCancel: false
        })
      } else {
        that.setData({
          moreShow: false
        })
        wx.navigateTo({
          url: '../bloodPressure/bloodPressure?booking_id=' + that.data.booking_id
        })
      }
    } else if (functionType == 'heartRate') {
      that.setData({
        heartRateSrc: '../../images/heartRateActive.png',
        heartRateActive: true
      })
      setTimeout(() => {
        that.setData({
          heartRateSrc: '../../images/heartRate.png',
          heartRateActive: false
        })
      }, 300)
      if (this.data.device_flag === '0') {
        wx.showModal({
          title: "提示",
          content: '功能即将开放，敬请期待！',
          confirmText: "确定",
          showCancel: false
        })
      } else {
        that.setData({
          moreShow: false
        })
        wx.navigateTo({
          url: '../heartRate/heartRate?booking_id=' + that.data.booking_id
        })
      }
    } else if (functionType == 'health') {
      that.setData({
        healthSrc: '../../images/healthActive.png',
        healthActive: true,
        moreShow: false
      })
      setTimeout(() => {
        that.setData({
          healthSrc: '../../images/health.png',
          healthActive: false
        })
      }, 300)
      wx.navigateTo({
        url: '/pages/health/health?page_from=orderDetail',
      })
    }
  },
  toggleMoreAction: function() {
    this.setData({
      moreShow: !this.data.moreShow
    })
  },
  /**
   * 月卡试结算
   */

  cardPayTryAction: function(tryComplete) {

    if (this.data.month_card_flag == 1 && this.data.month_card_end_time && this.data.month_card_end_time > 0) { //月卡过期提醒
      if (!storageService.hadMonthCardModal(this.data.booking_id)) {
        this.setData({
          showed_buy_card: 2,
        })
      }

      storageService.setMonthCardModal(this.data.booking_id);
    } else {
      var that = this
      var result = false //默认不弹出月卡优惠，如果为true  则月卡价格和原价不一致 弹出月卡优惠
      network.shareSleepNetwork("wallet/month_card_price", {
        "booking_id": parseInt(that.data.booking_id)
      }, "POST", function complete(res) {
        if (res.data.ret == 0 && (!res.data.month_price || (res.data.price > res.data.month_price))) { //
          if (!storageService.hadMonthCardModal(that.data.booking_id)) {
            that.setData({
              showed_buy_card: 2,
              card_price: (res.data.price / 100.0),
              card_month_price: (res.data.month_price / 100.0)
            })
          }

          storageService.setMonthCardModal(that.data.booking_id);
          tryComplete(true)
        } else {
          tryComplete(false)
        }
      }, that)
    }
  },

  /**
   * 购买月卡
   */

  buyRightNowAction: function() {
    wx.navigateTo({
      url: '/pages/card/card?bougth_card=' + (this.data.month_card_flag == 1 ? true : false) + "&page_from=1",
    })
  },

  /**
   * 月卡优惠关闭
   */
  toggleRulesAction: function(e) {
    this.setData({
      showed_buy_card: 3
    })
    // setTime/out(()=>{
    this.handEndBooking(() => {})

    // },2000)
  },






  onFinishBtnClick: function() {
    if (!storageService.hadMonthCardModal(this.data.booking_id)) {
      if (this.data.month_card_flag != 1) { //没有月卡 月卡价格弹窗
        network.shareSleepNetwork("wallet/month_card_price", {
          booking_id: parseInt(this.data.booking_id)
        }, "POST", (res) => {
          if (res.data.ret == 0 && (!res.data.month_price || (res.data.price > res.data.month_price))) {
            this.setData({
              showed_buy_card: 2,
              card_price: (res.data.price / 100.0),
              card_month_price: (res.data.month_price / 100.0)
            })
            storageService.setMonthCardModal(this.data.booking_id);
          } else {
            this.confirmModalToUpdateBooking();
          }
        }, this)
        return;
      } else if (this.data.month_card_end_time && this.data.month_card_end_time > 0 && this.data.month_card_end_time * 1000 - new Date().getTime() <= 1000 * 60 * 60 * 24 * 5) { //月卡过期提醒弹窗
        this.setData({
          month_card_days: Math.ceil((this.data.month_card_end_time * 1000 - new Date().getTime()) / (1000 * 60 * 60 * 24)),
          showed_buy_card: 2,
        });
        storageService.setMonthCardModal(that.data.booking_id);
        return;
      }
    }
    this.confirmModalToUpdateBooking();
  },


  onMonthCardModalClose: function() {
    this.setData({
      showed_buy_card: 1,
    });
    this.confirmModalToUpdateBooking();
  },


  confirmModalToUpdateBooking: function() {
    wx.showModal({
      title: "是否已出舱并关闭舱门？",
      content: '结束使用后，紫外灯消毒即将启动',
      confirmText: "已出舱",
      success: (res) => {
        if (res.confirm) {
          this.updateBookingFn(repeatFn);
        }
      }
    })
  },



  updateBookingFn: function(repeatFn) {
    if (wx.showLoading) {
      wx.showLoading({
        title: "正在结束订单"
      })
    }
    var data = wx.getStorageSync('healthReportCache')
    var muse_flag = data.muse_flag ? 1 : 0;
    var face_flag = data.face_flag ? 1 : 0;
    var health_flag = data.health_flag ? 1 : 0;
    var heart_flag = data.heart_flag ? 1 : 0;
    var blood_flag = data.blood_flag ? 1 : 0;
    network.shareSleepNetwork('booking/update', {
      to_status: 2,
      from_status: 1,
      booking_id: parseInt(this.data.booking_id),
      muse_flag,
      face_flag,
      health_flag,
      heart_flag,
      blood_flag
    }, "POST", (res) => {
      if (wx.hideLoading) {
        wx.hideLoading()
      }
      if (repeatFn && repeatN < 2 && repeatFn(res)) {
        if (wx.showLoading) {
          wx.showLoading({
            title: "正在结束订单"
          })
        }
        setTimeout(() => {
          repeatN++;
          this.updateBookingFn(repeatFn);
        }, 1500);
        return;
      }
      repeatN = 0;
      if (res.data.ret == 0 || res.data.ret == -3042) { //-3042订单已经结束
        //如果有后台背景音乐播放，则停止播放
        const backgroundAudioManager = wx.getBackgroundAudioManager();
        if (backgroundAudioManager.src) {
          backgroundAudioManager.stop();
        }
        var balance = res.data.balance ? res.data.balance : 0;
        var final_price = res.data.booking_info.final_price ? res.data.booking_info.final_price : 0;
        if (res.data.booking_info.status == 4) {
          //paySucc
          var timeString = utils.timeShowString(res.data.booking_info.end_time - res.data.booking_info.create_time)
          wx.redirectTo({
            url: '../paySucc/paySucc?time=' + timeString + '&final_price=' + res.data.booking_info.final_price + "&capsule_id=" + res.data.booking_info.capsule_id + "&balance=" + (res.data.balance ? res.data.balance / 100 : 0) + '&capsule_id_origin=' + this.data.capsule_id_origin + '&booking_id=' + this.data.booking_id + '&area_id=' + this.data.area_id + '&phone=' + app.globalData.localUserInfo.phone + '&appraise_flag=' + this.data.appraise_flag
          })
        } else {
          //orderPay
          var timeString = utils.timeShowString(res.data.booking_info.end_time - res.data.booking_info.create_time)
          wx.reLaunch({
            url: '../orderPay/orderPay?time=' + timeString + '&final_price=' + res.data.booking_info.final_price + "&capsule_id=" + res.data.booking_info.capsule_id + "&balance=" + (res.data.balance ? res.data.balance / 100 : 0) + "&need_charge=" + res.data.need_charge + "&booking_id=" + res.data.booking_id
          })
        }
      } else if (res.data.ret == -3011) { //舱门未关
        wx.showModal({
          content: res.data.err,
          confirmText: "结束使用",
          success: (resp) => {
            if (resp.confirm) {
              this.updateBookingFn(repeatFn);
            }
          }
        })
      } else if (res.data.ret == -3111) { //三次未结束订单，第四次给用户手动结束选项
        wx.showModal({
          content: '如您已出舱并关闭舱门,请点击“确认”结束订单',
          showCancel: true,
          confirmText: "确认",
          success: (resp) => {
            if (resp.confirm) {
              this.updateBookingFn(repeatFn);
            }
          }
        })
      } else if (res.data.ret == -3112 || res.data.ret == -3104) { // 舱内感应有人  无法手动结束
        this.show(res.data.err, 3000);
      } else {
        this.show(res.data.err, 3000);
      }
    }, this, () => {
      this.repeatRequest()
    }, this.data.hideErrorTag)
  },





}
let repeatN = 0;

function repeatFn(res) {
  return res.data.ret != 0 &&
    res.data.ret != -3042;
}

function intervalToDateString(interval) {
  var date = new Date(interval)
  return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()
}
Page(pageData)