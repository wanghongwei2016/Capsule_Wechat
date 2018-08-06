// pages/join/joinUs.js
var app = getApp()
var network = require('../../utils/network.js')
var utils = require("../../utils/util.js")
Page({
  /**
   * 我的页面
   */
  concactUs: function () {
    if (this.data.name && this.data.phone && this.data.city && this.data.msg && this.data.email){
      var that = this;
      var emailCheck = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;
      if (!emailCheck.test(this.data.email)) {
        wx.showToast({
          image: '/images/error.png',
          title: '邮箱格式有误!'
        })
        return;
      }
      wx.request({
        url: 'https://www.xiangshuispace.com/api/user/join',
        method:'POST',
        data: {
          join_user_name: this.data.name,
          join_user_phone: this.data.phone,
          join_user_city: this.data.city,
          join_user_email: this.data.email,
          join_user_msg: this.data.msg
        },
        header: {
          'content-type': 'application/json',
          'User-Uin': 100000
        },
        success: function (resp) {
          if (resp.data && resp.data.ret == 0) {
            wx.showToast({
              title: '请等待我们的回复!'
            });
            that.setData({name:'',phone:'',city:'',email:'',msg:''})
          }
        }
      })
    }else{
      wx.showToast({
        image: '/images/error.png',
        title: '请填写完整信息!'
      })
    }
  },
  inputName: function (e) {
    this.setData({
      name: e.detail.value
    })
  },
  inputPhone: function (e) {
    this.setData({
      phone: e.detail.value
    })
  },
  inputCity: function (e) {
    this.setData({
      city: e.detail.value
    })
  },
  inputEmail: function (e) {
    this.setData({
      email: e.detail.value
    })
  },
  inputMsg: function (e) {
    this.setData({
      msg: e.detail.value
    })
  },
  /**
   * 页面的初始数据
   */
  data: {
    name:'',
    phone:'',
    city:'',
    email:'',
    msg:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  }
})