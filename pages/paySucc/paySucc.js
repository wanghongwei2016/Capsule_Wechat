var app = getApp()
var network = require("../../utils/network.js")
var utils = require("../../utils/util.js")
Page({
  data: {
    price: 0,
    balance: 0,
    showRed: false,
    red_envelope: 100,
    time: 0,
    invite_bonus: app.globalData.config.invite_bonus == 0 || app.globalData.config.invite_bonus ? app.globalData.config.invite_bonus / 100 : app.globalData.configDefault.invite_bonus / 100,
    hasHealthData: false,
    hasBloodPressureData: false,
    hasHeartRateData: false,
    rest_interval_width: 0,
    rest_width: 0,
    oxygen_width: 0,
    compatibleStyle: { spcial1Font: '94rpx', spcial2Font: '133rpx', spcial3Font: '45rpx', vitalityInfoMarginTop: '0', heartRateFont: '133rpx', bloodPressureFont: '120rpx' },
    isDialogShow: false,
    isScroll: true,
    vitalityRunStyle: '',
    heart_rate_level: 2,//心率等级 1->稍慢 2->正常 3->稍快
    blood_pressure_high_level: 2,//高压等级 1->偏高 2->正常 3->偏高
    blood_pressure_low_level: 2,//低压等级 1->偏高 2->正常 3->偏高
    stain_level: 'normal',
    dark_level: 'normal',
    acne_level: 'normal',
    barWidth: 580,
    vitalityValue: 0,
    negative_oxygen: 0,
    fee_score: 0,
    sleep_score: 0,
    other_score: 0,
    health: 0,
    bloodPressure: '70/120',
    heart_rate: '--',
    low_pressure: '-',
    high_pressure: '-',
    heartArrowLeft: 0,
    highArrowLeft: 0,
    lowArrowLeft: 0,
  },

  onShow: function() {

    this.getBookingInfo()
  },
  onLoad: function (options) {
    // toast组件实例
    new app.ToastPannel();
    console.log(options);
    this.initData();
    var that = this;
    var appraise_bonus = app.globalData.config.appraise_bonus == 0 || app.globalData.config.appraise_bonus ? app.globalData.config.appraise_bonus / 100 : app.globalData.configDefault.appraise_bonus / 100
    this.setData({
      booking_id: options.booking_id,
      appraise_bonus: appraise_bonus,
      appraise_title: app.globalData.config.appraise_title ? app.globalData.config.appraise_title : app.globalData.configDefault.appraise_title,
      isScroll: false
    })
    wx.setNavigationBarTitle({
      title: '支付成功'
    })
    if (options.page_from != 'skinTest') {
      setTimeout(function () {
        that.setData({
          appraise_show: true
        })
      }, 1000)
      setTimeout(function () {
        that.setData({
          appraise_animation_show: true
        })
      }, 1100)
    }
    if (options.page_from == 'skinTest') {
      that.setData({
        isScroll: true
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
      this.setData({
        compatibleStyle: { spcial1Font: '74rpx', spcial2Font: '113rpx', spcial3Font: '35rpx', vitalityInfoMarginTop: '40rpx', heartRateFont: '110rpx', bloodPressureFont: '80rpx' }
      })
    }

  },
  drawSkinBar: function (healthReport) {
    if (healthReport.hasHealthData) {
      this.setData({
        health: Math.ceil(healthReport.beauty),
        stain: healthReport.stain,
        dark_circle: healthReport.dark_circle,
        acne: healthReport.acne,
        hasHealthData: true
      })
      this.stainProgress(this.data.stain)
      this.darkProgress(this.data.dark_circle)
      this.acneProgress(this.data.acne)
    }
  },
  drawVitalityBar: function (data) {
    var bar_width = 360;
    var sleep_score = data.sleep_score ? data.sleep_score / 100 : 0, fee_score = data.fee_score ? data.fee_score / 100 : 0, other_score = data.other_score ? data.other_score / 100 : 0, negative_oxygen = data.negative_oxygen ? (data.negative_oxygen).toFixed(1) : 0;
    var vitalityValue = sleep_score + fee_score + other_score
    var sleep_score_width = bar_width * sleep_score / 100
    var fee_score_width = bar_width * fee_score / 100
    var other_score_width = bar_width * other_score / 100
    var rotateTotal = vitalityValue < 100 ? (360 - 90) * vitalityValue / 100 : (360 - 90) * 100 / 100
    var vitalityRunStyle = "transform: rotate(" + rotateTotal + "deg)"

    this.setData({
      vitalityValue,
      sleep_score,
      fee_score,
      other_score,
      negative_oxygen,
      sleep_score_width,
      fee_score_width,
      other_score_width,
      vitalityRunStyle,
    })
  },
  drawHeartRateBar: function (data) {
    if (data.hasHeartRateData) {
      var heartRate = data.heart_rate
      //整个进度条分为4段从左到右分值依次为： 20 50 100 200
      this.setData({
        hasHeartRateData: true,
        heart_rate: heartRate,
        heart_rate_level: heartRate <= 50 ? 1 : heartRate <= 100 ? 2 : 3,
        heartArrowLeft: this.computeArrowLeft(heartRate, 20, 50, 100, 200)
      })
    }
  },
  getGenerateReport: function () {
    var that = this;
    try {
      var data = wx.getStorageSync('healthReportCache')
      var muse_flag = data.muse_flag ? 1 : 0;
      var face_flag = data.face_flag ? 1 : 0;
      var health_flag = data.health_flag ? 1 : 0;
      var heart_flag = data.heart_flag ? 1 : 0;
      var blood_flag = data.blood_flag ? 1 : 0;
      console.log(muse_flag, face_flag, health_flag, heart_flag, blood_flag)
      // 渲染肤质健康 进度条
      this.drawSkinBar(data)
      this.drawHeartRateBar(data)
      this.drawBloodPressureBarHigh(data)
      this.drawBloodPressureBarLow(data)
      network.shareSleepNetwork('booking/generate_report', { booking_id: parseInt(that.data.booking_id), muse_flag: muse_flag, face_flag: face_flag, health_flag: health_flag, heart_flag: heart_flag, blood_flag: blood_flag }, "POST", function complete(res) {
        console.log(res)
        if (res.data.ret == 0) {
          app.initHealthReportCache()
          that.drawVitalityBar(res.data)
        }
      }, that)
    } catch (e) {
      // Do something when catch error
      console.log(e)
    }
  },
  getBookingInfo: function () {
    var that = this;
    network.shareSleepNetwork("booking/bookingid/" + that.data.booking_id, {}, "GET", function complete(res) {
      that.getGenerateReport()
      that.setData({
        time: utils.timeShowString(res.data.booking_info.end_time - res.data.booking_info.create_time),
        price: parseInt(res.data.booking_info.final_price) / 100.0,
        balance: res.data.balance && !isNaN(res.data.balance) ? res.data.balance / 100.0 : 0,
        capsule_id_origin: res.data.booking_info.capsule_id ? parseInt(res.data.booking_info.capsule_id) : null,
        area_id: res.data.booking_info.area_id ? parseInt(res.data.booking_info.area_id) : null,
        booking_id: res.data.booking_id ? parseInt(res.data.booking_id) : null,
        phone: app.globalData.localUserInfo.phone,
        appraise_flag: res.data.appraise_flag == 0 ? true : false,
        appraise_succ_text: (res.data.appraise_flag == 0 && that.data.appraise_bonus > 0) ? '提交成功，谢谢您的评价！' + that.data.appraise_bonus + '元红包已发放至您的钱包- 余额' : '提交成功，谢谢您的评价！',
        device_flag: res.data.device_flag,
        month_card_flag: res.data.month_card_flag,
        coupon_cash: res.data.booking_info.coupon_cash ? res.data.booking_info.coupon_cash/100 : 0
      })
    }, that)
  },
  completeAction: function () {
    if (wx.reLaunch) {
      wx.reLaunch({
        url: '/pages/scanCode/scanCode',//这里需要绝对路径
        complete: function (res) {
          console.log(res)
        }
      })
    } else {
      var count = 0
      if (getCurrentPages().count > 1) {
        count = getCurrentPages().count
      }
      console.log(count)
      if (count > 2) {
        wx.navigateBack({
          delta: count - 1, // 回退前 delta(默认为1) 页面
        })
      } else {
        wx.redirectTo({
          url: '/pages/scanCode/scanCode'
        })
      }
    }
    app.initHealthReportCache()
  },
  inviteFriendAction: function () {
    wx.navigateTo({
      url: '/pages/newInvite/newInvite?page_from=1',//这里需要绝对路径
      complete: function (res) {
        console.log(res)
      }
    })
  },
  /**
   * 跳转到故障报修
   */
  faultReportAction: function () {
    wx.navigateTo({
      url: '../faultReport/faultReport?capsule_id=' + this.data.capsule_id_origin + '&booking_id=' + this.data.booking_id + '&area_id=' + this.data.area_id + '&phone=' + this.data.phone
    })
  },
  /**
   * 选择星星
   */
  selectStarAction: function (event) {
    var selectId = event.currentTarget.dataset.index;
    if ((this.data.starFrom == 4 || selectId == 4) && (!(this.data.starFrom == 4 && selectId == 4))) {
      this.setData({
        tags: [],
        appraise_satisfied: this.data.appraise_satisfied_origin,
        appraise_very_satisfied: this.data.appraise_very_satisfied_origin,
      })
    }
    var appraise_stars = this.data.appraise_stars;
    for (var i = 0; i < appraise_stars.length; i++) {
      if (i <= selectId) {
        appraise_stars[i].active = true;
      } else {
        appraise_stars[i].active = false;
      }
    }
    this.setData({
      appraise_stars: appraise_stars,
      starFrom: selectId
    })

    this.checkStarStatus();
    this.checkDisabledAction();
  },
  /**
   * 检查星星选择状态
   */
  checkStarStatus: function () {
    var appraise_stars = this.data.appraise_stars;
    var starsNum = 0;
    for (var i = 0; i < appraise_stars.length; i++) {
      if (appraise_stars[i].active == true) {
        starsNum++;
      }
    }
    this.setData({
      starsNum: starsNum
    })
  },
  /**
   * 比较满意标签选择
   */
  appraiseSatisfiedAction: function (event) {
    var index = event.currentTarget.dataset.index;
    var appraise_satisfied = this.data.appraise_satisfied;
    var tags = [];
    for (var i = 0; i < appraise_satisfied.length; i++) {
      if (i == index) {
        appraise_satisfied[i].toggle = !appraise_satisfied[i].toggle;
      }
      if (appraise_satisfied[i].toggle == true) {
        tags.push(appraise_satisfied[i].tag)
      }
    }
    this.setData({
      appraise_satisfied: appraise_satisfied,
      tags: tags
    })
    console.log(tags)
    this.checkDisabledAction();
  },
  /**
   * 非常满意标签选择
   */
  appraiseVerySatisfiedAction: function (event) {
    var index = event.currentTarget.dataset.index;
    var appraise_very_satisfied = this.data.appraise_very_satisfied;
    var tags = [];
    for (var i = 0; i < appraise_very_satisfied.length; i++) {
      if (i == index) {
        appraise_very_satisfied[i].toggle = !appraise_very_satisfied[i].toggle;
      }
      if (appraise_very_satisfied[i].toggle == true) {
        tags.push(appraise_very_satisfied[i].tag)
      }
    }
    this.setData({
      appraise_very_satisfied: appraise_very_satisfied,
      tags: tags
    })
    console.log(tags)
    this.checkDisabledAction();
  },
  /**
   * 检测字符串是否为空格
   */
  checkStrIsNull: function (str) {
    return str.length > 0 && str.trim().length == 0 ? false : true
  },
  /**
   * 输入框textarea
   */
  textareaAction: function (event) {
    var text = event.detail.value;
    var canInputNum = this.data.canInputNum;
    canInputNum = canInputNum - text.length;
    if (canInputNum >= 0) {
      this.setData({
        canInputText: canInputNum
      })
    }
    this.setData({
      suggest: text
    })
    this.checkDisabledAction();
  },
  /**
   * 检测提交按钮是否可用
   */
  checkDisabledAction: function () {
    var submit_disabled;
    if (this.data.starsNum >= 0 && this.data.starsNum <= 4) {
      if (this.data.tags.length > 0 || (this.checkStrIsNull(this.data.suggest) && this.data.suggest)) {
        submit_disabled = false;
      } else {
        submit_disabled = true;
      }
    } else if (this.data.starsNum == 5) {
      submit_disabled = false;
    }
    this.setData({
      submit_disabled: submit_disabled
    })
  },
  /**
   * 关闭评论
   */
  appraiseCloseAction: function () {
    this.initData();
  },
  /**
   * 初始化数据
   */
  initData: function () {
    console.log('init!!!!!!!!!!!!!!!!!!')
    var appraise_satisfied = []
    var appraise_very_satisfied = []
    var appraise4 = app.globalData.config.appraise4 && app.globalData.config.appraise4.length > 0 ? app.globalData.config.appraise4 : app.globalData.configDefault.appraise4
    var appraise5 = app.globalData.config.appraise5 && app.globalData.config.appraise5.length > 0 ? app.globalData.config.appraise5 : app.globalData.configDefault.appraise5
    for (var i = 0; i < appraise4.length; i++) {
      appraise_satisfied.push({ tag: appraise4[i], toggle: false })
    }
    for (var i = 0; i < appraise5.length; i++) {
      appraise_very_satisfied.push({ tag: appraise5[i], toggle: false })
    }
    this.setData({
      isScroll: true,
      appraise_show: false,
      canInputText: 100,
      canInputNum: 100,
      starsNum: 0,
      tags: [],
      submit_disabled: true,
      suggest: '',
      appraise_satisfied_origin: appraise_satisfied,
      appraise_satisfied,
      appraise_very_satisfied_origin: appraise_very_satisfied,
      appraise_very_satisfied,
      appraise_stars: [
        { active: false },
        { active: false },
        { active: false },
        { active: false },
        { active: false }
      ],
      textarea_placeholder: '请输入您的建议或对我们的意见！'
    })
  },
  /**
   * 提交评价
   */
  submitAction: function () {
    var that = this;
    if (wx.showLoading) {
      wx.showLoading({
        title: "提交中",
        duration: 2000
      })
    }
    var data = {
      booking_id: parseInt(this.data.booking_id),
      score: parseInt(this.data.starsNum),
    }
    if (this.data.tags.length > 0) {
      data.appraise = this.data.tags;
    }
    if (this.checkStrIsNull(this.data.suggest) && this.data.suggest) {
      data.suggest = this.data.suggest.trim();
    }
    console.log(data);
    network.shareSleepNetwork("booking/appraise", data, "POST", function complete(res) {
      if (wx.hideLoading) {
        wx.hideLoading()
      }
      console.log(res);
      if (res.data.ret == 0) {
        if (!res.data.red_envelope) {
          that.show(that.data.appraise_succ_text);
        }
        that.initData();
        that.setData({
          showRed: res.data.red_envelope ? true : false,
          red_envelope_title: res.data.red_envelope_title ? res.data.red_envelope_title : '',
          red_envelope: res.data.red_envelope ? res.data.red_envelope / 100 : 0,
          isScroll: res.data.red_envelope ? false : true
        })
      } else {
        that.setData({
          submit_disabled: false
        })
      }
    }, that)
  },
  /**
   * 关闭红包页面
   */
  closeRed: function () {
    this.setData({
      showRed: false,
      isScroll: true
    })
  },
  /**
   * 显示、关闭弹窗
   */
  showDialog: function (e) {
    var currentStatu = e.currentTarget.dataset.statu;
    console.log('currentStatu:', currentStatu);
    //关闭  
    if (currentStatu == "close") {
      this.setData({
        isDialogShow: false,
        isScroll: true
      });
    }
    // 显示  
    if (currentStatu == "open") {
      this.setData({
        isDialogShow: true,
        isScroll: false
      });
    }
  },
  /**
 * 色斑进度条
 */
  stainProgress: function (stain) {
    var stain_level = stain < 10 ? 'normal' : stain < 50 ? 'one' : stain < 75 ? 'two' : 'three'
    if (stain >= 10 && stain <= 25) {
      stain = Number(stain) + 15;
    }
    this.setData({
      stain_width: stain * this.data.barWidth / 100 + 'rpx',
      stain_level
    })
  },
  /**
   * 黑眼圈进度条
   */
  darkProgress: function (dark_circle) {
    console.log(dark_circle)
    var dark_level = dark_circle < 10 ? 'normal' : dark_circle < 50 ? 'one' : dark_circle < 75 ? 'two' : 'three'
    if (dark_circle >= 10 && dark_circle <= 25) {
      console.log(dark_circle)
      dark_circle = Number(dark_circle) + 15;
    }
    this.setData({
      dark_width: dark_circle * this.data.barWidth / 100 + 'rpx',
      dark_level
    })
  },
  /**
   * 青春痘进度条
   */
  acneProgress: function (acne_circle) {
    var acne_level = acne_circle < 10 ? 'normal' : acne_circle < 50 ? 'one' : acne_circle < 75 ? 'two' : 'three'
    if (acne_circle >= 10 && acne_circle <= 25) {
      acne_circle = Number(acne_circle) + 15;
    }
    this.setData({
      acne_width: acne_circle * this.data.barWidth / 100 + 'rpx',
      acne_level
    })
  },
  /**
   * 立即获取肤质健康，跳转到测肤质页面
   */
  getSkinAction: function () {
    wx.navigateTo({
      url: '/pages/skinTest/skinTest?page_from=paySucc&booking_id=' + this.data.booking_id
    })
  },
  getBloodHearAction: function () {
    if (this.data.device_flag==='0'){
      wx.showModal({
        title: '提示',
        content: '功能即将开放，敬请期待！',
        confirmText: '知道了',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }else{
      wx.showModal({
        title: '如何获取？',
        content: '您可在舱内佩戴手环获取心率血压等健康数据。',
        confirmText: '知道了',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }
  },
  computeArrowLeft: function (pressureValue, n1, n2, n3, n4) {
    //整个进度条分为4段从左到右分值依次为： n1 n2 n3 n4
    var partLength = 33.33 //进度条分为3段，每段为占33.33%
    var arrowLeft = 0
    if (pressureValue <= n1) {
      arrowLeft = 0
    } else if (pressureValue <= n2) {
      arrowLeft = (100 * (pressureValue - n1) / (n2 - n1)) / 3
    } else if (pressureValue <= n3) {
      arrowLeft = partLength + (100 * (pressureValue - n2) / (n3 - n2)) / 3
    } else if (pressureValue <= n4) {
      arrowLeft = partLength * 2 + (100 * (pressureValue - n3) / (n4 - n3)) / 3
    } else {
      arrowLeft = partLength * 3
    }
    return arrowLeft
  },
  drawBloodPressureBarHigh: function (data) {
    if (data.hasBloodPressureData) {
      var high_pressure = data.high_pressure
      //整个进度条分为4段从左到右分值依次为： 60 90 140 200
      this.setData({
        highArrowLeft: this.computeArrowLeft(high_pressure, 60, 90, 140, 200),
        high_pressure: high_pressure,
        hasBloodPressureData: true,
        blood_pressure_high_level: high_pressure <= 90 ? 1 : high_pressure <= 140 ? 2 : 3
      })
    }
  },
  drawBloodPressureBarLow: function (data) {
    if (data.hasBloodPressureData) {
      var low_pressure = data.low_pressure
      //整个进度条分为4段从左到右分值依次为： 30 60 90 120
      this.setData({
        lowArrowLeft: this.computeArrowLeft(low_pressure, 30, 60, 90, 120),
        low_pressure: low_pressure,
        hasBloodPressureData: true,
        blood_pressure_low_level: low_pressure <= 60 ? 1 : low_pressure <= 90 ? 2 : 3
      })
    }
  },
  buyCardAction: function () {
    wx.navigateTo({
      url: '/pages/card/card?bougth_card=' + (this.data.month_card_flag == 1 ? true : false),
    })
  }
})