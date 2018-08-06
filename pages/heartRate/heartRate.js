var app = getApp()
var network = require("../../utils/network.js")
var utils = require("../../utils/util.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    prompt_show: true,
    timeTotal: 60,
    restTime: 60,
    timeTotalFormat: utils.timeMS(60),
    heart_rate_btn_text: '开始测量',
    statusTag: 1, //1表示测试按钮的文案是“开始测试” 2表示测试按钮的文案是“测试中”,
    showResult: false,
    heart_rate: 0,
    arrowLeft: 0,
    timer: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // toast组件实例
    new app.ToastPannel();

    this.checkHeartRateData()

    this.setData({
      booking_id: Number(this.options.booking_id)
    })
  },
  onUnload: function () {
    if (this.data.timer) {
      clearInterval(this.data.timer)
    }
  },
  /**
   * 当有心率值缓存时不显示提示页面，并展示数据
   */
  checkHeartRateData: function () {
    try {
      var data = wx.getStorageSync('healthReportCache')
      console.log(data)
      if (data.hasHeartRateData) {
        this.drawHeartRateBar(data.heart_rate)
        this.setData({
          prompt_show: false,
          showResult: true,
          heart_rate: data.heart_rate
        })
        var setData = { title: '心率', frontColor: '#ffffff', backgroundColor: '#189df9' }
        this.setNavigationBar(setData)
      } else {
        var setData = { title: '', frontColor: '#000000', backgroundColor: '#f8f9f9' }
        this.setNavigationBar(setData)
      }
    } catch (e) {
      // Do something when catch error
      this.show('未获取到缓存数据！')
    }
  },
  /**
   * 如果用户使用了心率测试，存储健康数据标记
   */
  updateHealthReportCache: function (heartRateData) {
    wx.getStorage({
      key: 'healthReportCache',
      success: function (res) {
        var obj = { heart_flag: 1, heart_rate: heartRateData, hasHeartRateData: true };
        var healthReport = Object.assign(res.data, obj)
        wx.setStorage({
          key: 'healthReportCache',
          data: healthReport,
          complete: function (res) {
            console.log(res)
          }
        })
      }
    })
  },
  /**
   * 隐藏提示
   */
  hidePromptAction: function () {
    this.setData({
      prompt_show: false
    })
    var setData = { title: '心率', frontColor: '#ffffff', backgroundColor: '#189df9' }
    this.setNavigationBar(setData)
  },
  /**
   * 设置导航条
   */
  setNavigationBar: function (data) {
    wx.setNavigationBarTitle({
      title: data.title
    })
    wx.setNavigationBarColor({
      frontColor: data.frontColor,
      backgroundColor: data.backgroundColor
    })
  },
  /**
   * 发送心率测量请求
   */
  requestHealthData: function () {
    var that = this
    network.shareSleepNetwork("capsule/request_health_data", { health_tag: 1, booking_id: that.data.booking_id }, "POST", function complete(res) {
      if (res.data.ret === 0) {
        that.countDownAction()
      }
    }, that)
  },
  /**
   * 获取心率测量数据
   */
  getHealthData: function () {
    var that = this
    network.shareSleepNetwork("capsule/get_health_data", { health_tag: 1, booking_id: that.data.booking_id }, "POST", function complete(res) {
      if (res.data.ret === 0) {
        that.updateHealthReportCache(res.data.heart_rate)
        that.drawHeartRateBar(res.data.heart_rate)
        that.setData({
          heart_rate_btn_text: '开始测量',
          timeTotal: that.data.timeTotal,
          timeTotalFormat: utils.timeMS(that.data.timeTotal),
          statusTag: 1,
          showResult: true,
          resultType: 3,
          heart_rate: res.data.heart_rate
        })
      }else{
        that.resetData()
      }
    }, that, function errBack() {
      that.resetData()
    })
  },
  /**
   * 复位
   */
  resetData: function(){
    this.setData({
      heart_rate_btn_text: '开始测量',
      timeTotal: this.data.timeTotal,
      timeTotalFormat: utils.timeMS(this.data.timeTotal),
      statusTag: 1
    })
  },
  /**
   * 倒计时
   */
  countDownAction: function () {
    var timeTotal = this.data.timeTotal
    this.setData({
      heart_rate_btn_text: '测量中',
      statusTag: 2
    })
    var timer = setInterval(() => {
      timeTotal--;
      this.setData({
        timeTotalFormat: utils.timeMS(timeTotal),
        restTime: timeTotal,
      })
      if (timeTotal == 0) {
        clearTimeout(timer)
        this.getHealthData()
      }
    }, 1000)
    this.setData({
      timer: timer
    })
  },
  /**
   * 开始测量血压
   */
  startTestAction: function () {
    if (this.data.statusTag === 1) {
      this.requestHealthData()
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
  drawHeartRateBar: function (heartRate) {
    //整个进度条分为4段从左到右分值依次为： 20 50 100 200
    this.setData({
      arrowLeft: this.computeArrowLeft(heartRate, 20, 50, 100, 200)
    })
  }
})

/**
 * 心率、血压严重程度算法：
  1、心率：分为四个值，20、50、100、200.当测量值为在50-100区间内，按正常百分比显示（例如测量值为88，三角则指示在88的位置）；当值位于20-50或100-200区间内时，用测量值减去基数20或100，然后除以区间30或100差后所得的百分比为心率偏慢或偏高时所在区间内的百分比指示（例如测量值为33，则用33减去基数20，然后用13除以区间差30，所得的百分比为心率偏慢时在该区间内的指示；心率偏高时算法与此算法相同）《注：两端的数字20和200在实际中不显示出来》

  2、血压：高压分为四个值，60、90、140、200. 此算法与心率算法相同，两端的60时和200同样在实际中不现实出来
  低压同分为四个值，30、60、90、120. 此算法与心率、血压高压算法相同，两端的30时和120同样在实际中不现实出来
 */