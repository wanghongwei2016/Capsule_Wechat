// pages/act_zhounian/saveimg/saveimg.js
const {
  mixins,
  Message
} = require('../../../utils/common.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },

  saveimg: function() {
    wx.getImageInfo({
      src: 'https://s3.cn-north-1.amazonaws.com.cn/areaimgs/2E529E7BD431A7E9B704685880714DB1',
      success: (res) => {
        wx.saveImageToPhotosAlbum({
          filePath: res.path,
          success: (res) => {
            wx.showToast({
              title: '保存成功',
              icon: 'success',
              duration: 2000
            })

          },
          fail: () => {
            Message.msg('保存失败');
          }
        })
      }
    })
  }


})