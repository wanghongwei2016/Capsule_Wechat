//faultReport.js
var network = require('../../utils/network.js')
var app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {},
  onReady: function () {},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // toast组件实例
    new app.ToastPannel();
    if (options.page_from){
      this.setData({
        page_from: options.page_from,
        booking_id: options.booking_id
      })
    }
  },
  updateHealthReportCache: function (personalData) {
    // 如果用户使用了肤质测试，存储健康数据标记
    var that = this
    wx.getStorage({
      key: 'healthReportCache',
      success: function (res) {
        var obj = {};
        if (that.data.page_from === 'paySucc'){
          obj.face_flag = 0
        }else{
          obj.face_flag = 1
        }
        var healthReport = Object.assign(res.data, obj, personalData)
        console.log('healthReport====================')
        console.log(healthReport)
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
  onShow: function(){
    var that = this;
    setTimeout(() => {
      that.setData({
        animation: true
      })
    }, 500)
  },
  onHide: function(){
    this.setData({
      animation: false
    })
  },
  /**
   * 选择图片，上传图片
   */
  uploadAction: function () {
    var _this = this;
    console.log(app.globalData)
    if (app.globalData.localUserInfo.uin == 100000){
      wx.navigateTo({
        url: '/pages/login/login'
      })
    }else{
      wx.chooseImage({
        count: 1, // 默认9  
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有  
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有  
        success: function (res) {
          var headerDict = {
            'content-type': 'application/json',
            'User-Uin': parseInt(app.globalData.localUserInfo.uin),
            'Req-From': 'wx-app'
          }
          if (app.globalData.localUserInfo && app.globalData.localUserInfo['token']) {
            headerDict['Client-Token'] = app.globalData.localUserInfo.token
          }
          // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
          var tempFilePaths = res.tempFilePaths
          console.log(tempFilePaths);
          if (wx.showLoading) {
            wx.showLoading({
              title: "报告生成中"
            })
          }
          console.log(headerDict)
          wx.uploadFile({
            url: app.globalData.baseUrl + 'user/face_analyze',
            filePath: tempFilePaths[0],
            name: 'file',
            header: headerDict,
            success: function (res) {
              console.log(res);
              if (wx.hideLoading) {
                wx.hideLoading()
              }
              if (res.statusCode == 200) {
                var data = JSON.parse(res.data);
                console.log(data)
                if (data.ret == 0) {
                  if (data.analyze_result.face_token) {
                    if (data.analyze_result.attributes.facequality.value > data.analyze_result.attributes.facequality.threshold) {
                      let rate = app.globalData.rate
                      var personalData = {
                        beauty: data.analyze_result.attributes.gender.value == 'Female' ? data.analyze_result.attributes.beauty.female_score : data.analyze_result.attributes.beauty.male_score,
                        health: data.analyze_result.attributes.skinstatus.health,
                        stain: data.analyze_result.attributes.skinstatus.stain,
                        dark_circle: data.analyze_result.attributes.skinstatus.dark_circle,
                        acne: data.analyze_result.attributes.skinstatus.acne,
                        face_url: data.face_url,
                        hasHealthData: true
                      }
                      // app.globalData.healthReport = Object.assign(app.globalData.healthReport, personalData);
                      _this.updateHealthReportCache(personalData)
                      if (_this.data.page_from === 'paySucc'){
                        // wx.navigateBack({
                        //   delta: 1
                        // })
                        wx.reLaunch({
                          url: '/pages/paySucc/paySucc?&page_from=skinTest&booking_id=' + _this.data.booking_id
                        })
                      }else{
                        wx.navigateTo({
                          url: '/pages/skin/skin?beauty=' + personalData.beauty + '&health=' + personalData.health + '&stain=' + personalData.stain + '&dark_circle=' + personalData.dark_circle + '&face_url=' + personalData.face_url + '&acne=' + personalData.acne,
                        })
                      }
                    } else {
                      _this.show('无法识别照片，请上传一张清晰的正脸照片！')
                    }   
                  }
                } else if (data.ret == -105){
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
                }else {
                  _this.show(data.err)
                }
              } else {
                _this.show('上传照片失败')
              }
            },
            fail: function () {
              if (wx.hideLoading) {
                wx.hideLoading()
              }
              _this.show('网络开小差了...')
            }
          })
        },
        fail: function(){
          if (wx.hideLoading) {
            wx.hideLoading()
          }
          that.show('网络开小差了...')
        }
      })
    }
  }
})