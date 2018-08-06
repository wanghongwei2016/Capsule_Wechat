//faultReport.js
var network = require('../../utils/network.js')
var app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    fault_number: 1100000001,
    textarea_placeholder: '请输入您遇到的问题和建议',
    upload_pic_text: '上传照片(最多上传4张)',
    can_upload: true,
    fault_pics: [],
    canInputNum: 100,
    canInputNumText: '还可输入100字',
    submit_disabled: true,
    tags: [],
    description: ''
  },
  onReady: function () {
    
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // toast组件实例
    new app.ToastPannel();

    var fault_reasons = [];
    var qa = app.globalData.config.qa && app.globalData.config.qa.length > 0 ? app.globalData.config.qa : app.globalData.configDefault.qa
    for(var i=0;i<qa.length;i++){
      fault_reasons.push({ reason: qa[i],toggle: false})
    }
    this.setData({
      capsule_id: options.capsule_id ? parseInt(options.capsule_id) : null,
      area_id: options.area_id ? parseInt(options.area_id) : null,
      booking_id: options.booking_id ? parseInt(options.booking_id) : null,
      phone: options.phone ? parseInt(options.phone) : null,
      fault_number: (options.capsule_id.length == 10 ? options.capsule_id.substring(options.capsule_id.length-3) : options.capsule_id),
      fault_reasons
    })
  },
  /**
   * 用户指南
   */
  normalQuestionsAction: function () {
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
  /**
   * 选择图片，上传图片
   */
  uploadAction: function () {
    var _this = this;
    var headerDict = {
      'content-type': 'application/json',
      'User-Uin': parseInt(app.globalData.localUserInfo.uin),
      'Req-From': 'wx-app'
    }
    if (app.globalData.localUserInfo && app.globalData.localUserInfo['token']) {
      headerDict['Client-Token'] = app.globalData.localUserInfo.token
    }
    console.log(headerDict)
    wx.chooseImage({
      count: 1, // 默认9  
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有  
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有  
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
        console.log(tempFilePaths);
        wx.uploadFile({
          url: app.globalData.baseUrl + 'img/upload/capsule', //仅为示例，非真实的接口地址
          filePath: tempFilePaths[0],
          name: 'file',
          header: headerDict,
          success: function (res) {
            console.log(res);
            if (res.statusCode == 200) {
              var data = JSON.parse(res.data);
              if (data.ret == 0) {
                var fault_pics = _this.data.fault_pics;
                fault_pics.push(data.url)
                if (fault_pics.length >= 4) {
                  _this.setData({
                    can_upload: false
                  })
                }
                _this.setData({
                  fault_pics: fault_pics
                })
                _this.checkDisabledAction();                
              }
            } else {
              _this.show('上传图片失败')
              // wx.showToast({
              //   title: res.errMsg,
              //   icon: '',
              //   duration: 2000
              // })
            }
          }
        })
      }
    })
  },
  /**
   * 删除图片
   */
  deleteAction: function (event) {
    var deleteId = event.currentTarget.dataset.index;
    var fault_pics = this.data.fault_pics;
    fault_pics.splice(deleteId, 1);
    this.setData({
      fault_pics: fault_pics
    })
    if (fault_pics.length < 4) {
      this.setData({
        can_upload: true
      })
    }
    this.checkDisabledAction();
  },
  /**
   * 故障理由选择
   */
  selectAction: function (event) {
    var index = event.currentTarget.dataset.index;
    var fault_reasons = this.data.fault_reasons;
    var tags = [];
    for (var i = 0; i < fault_reasons.length; i++) {
      if (i == index) {
        fault_reasons[i].toggle = !fault_reasons[i].toggle;
      }
      if (fault_reasons[i].toggle == true) {
        tags.push(fault_reasons[i].reason)
      }
    }
    this.setData({
      fault_reasons: fault_reasons,
      tags: tags
    })
    this.checkDisabledAction();
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
        canInputNumText: '还可输入' + canInputNum + '字'
      })
    }
    this.setData({
      description: text
    })
    this.checkDisabledAction();
  },
  /**
   * 检测字符串是否为空格
   */
  checkStrIsNull : function (str) {
    return str.length > 0 && str.trim().length == 0 ? false : true
  },
  /**
   * 检测提交按钮是否可用
   */
  checkDisabledAction: function () {
    var submit_disabled;
    if (this.data.tags.length > 0 || (this.checkStrIsNull(this.data.description) && this.data.description) || this.data.fault_pics.length > 0) {
      submit_disabled = false;
    } else {
      submit_disabled = true;
    }
    this.setData({
      submit_disabled: submit_disabled
    })
  },
  /**
   * 提交故障
   */
  submitAction: function(){
    var that = this;
    that.setData({
      submit_disabled: true
    })
    if (wx.showLoading) {
      wx.showLoading({
        title: "提交中"
      })
    }
    var data ={
      capsule_id: this.data.capsule_id,
      booking_id: this.data.booking_id,      
      create_time: parseInt((new Date().getTime())/1000),
      app_version: app.globalData.app_version,
      phone: String(that.data.phone)
    }
    if (this.data.area_id){
      data.area_id = this.data.area_id;
    }
    if (this.data.tags.length>0){
      data.tags = this.data.tags;
    }
    if ((this.checkStrIsNull(this.data.description) && this.data.description)){
      data.description = this.data.description.trim();
    }
    if (this.data.fault_pics.length>0){
      data.imgs = this.data.fault_pics;
    }
    try {
      var systemInfo = wx.getSystemInfoSync()
      data.client_type = systemInfo.model;
      data.client_version = 'wechat '+systemInfo.version;
      console.log(data);
      network.shareSleepNetwork("capsule/failurereport", data, "POST", function complete(res) {
        if (wx.hideLoading) {
          wx.hideLoading()
        }
        console.log(res);
        if (res.data.ret == 0) {
          that.show('感谢您的反馈,我们会尽快处理')
          setTimeout(function(){
            wx.navigateBack({
              delta: 1
            })
          },2000)
        } else {
          that.setData({
            submit_disabled: false
          })
        }
      }, that)
    } catch (e) {
      that.show('获取系统信息失败，请稍后再试')
    }
  }
})