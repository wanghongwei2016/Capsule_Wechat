// cityList.js
var network = require('../../utils/network.js')
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    city_list:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    // toast组件实例
    new app.ToastPannel();
    network.shareSleepNetwork("capsule/getcity",{},"GET",function complete(res){
      if(res.data.ret == 0) {
        that.setData({
          city_list:res.data.citys
        })
      }
    },that)
  },
  //选择城市
  chooseCityAction: function(e) {
    console.log(e)
    var pages = getCurrentPages()
    var prevPage = pages[pages.length - 2]
    prevPage.setData({
      area_city: e.currentTarget.dataset.city,
      location:{}
    })
    prevPage.requestArea_List({})
    wx.navigateBack({
      delta:1
    })
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
  
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  }
})