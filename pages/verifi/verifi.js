// verifi.js
var network = require('../../utils/network.js')
var utils = require("../../utils/util.js")
var storageService = require('../../utils/storageService.js').default
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: "",
    card: "",
    verifDisable: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      setScanCodeCmd: options.setScanCodeCmd,
      openCapsuleCmd: options.openCapsuleCmd,
    });
    // toast组件实例
    new app.ToastPannel();
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
  /***
   * 验证身份证
   */
  verifAction: function () {
    var that = this
    if (wx.showLoading) {
      wx.showLoading({
        title: '身份验证中',
        mask: true
      })
    } else {
      that.setData({
        verifDisable: true
      })
    }
    network.shareSleepNetwork("user/idverify", { real_name: that.data.name, id_number: that.data.card }, "POST", function complete(res) {
      if (wx.hideLoading) {
        wx.hideLoading()
      } else {
        that.setData({
          verifDisable: false
        })
      }
      if (res.data && res.data.ret == 0) {
        that.show('身份证验证通过');
        // wx.showToast({
        //   title: '身份证验证通过',
        // })
        that.getLocalUserInfo();
      } else if (res.data && res.data.ret == -1053) {
        wx.showModal({
          content: res.data.err,
          confirmText: "拨打电话",
          success: (res) => {
            if (res.confirm) {
              utils.callService("400-688-9960")
            }
          }
        });
      } else {
        that.show(res.data.err);
        // wx.showToast({
        //   title: res.data.err,
        // })
      }
    }, that)
  },
  /**
   * 姓名输入
   */
  inputName: function (e) {
    var nameValue = e.detail.value
    var that = this
    console.log(nameValue)
    this.setData({
      name: nameValue
    })
    if (nameValue.length > 0 && this.data.card.length == 18 || this.data.card.length == 15) {
      that.setData({
        verifDisable: false
      })
    } else {
      that.setData({
        verifDisable: true
      })
    }
  },
  /**
   * 身份证号输入
   */
  inputCard: function (e) {
    var cardValue = e.detail.value
    var that = this
    this.setData({
      card: cardValue
    })
    console.log(cardValue.length + "->" + this.data.name.length)

    if (this.data.name.length > 0 && cardValue.length == 18 || cardValue.length == 15) {
      that.setData({
        verifDisable: false
      })
    } else {
      that.setData({
        verifDisable: true
      })
    }
  },
  /**
   * 获取用户信息
   */
  getLocalUserInfo: function (callBack) {
    var that = this
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
        // wx.showToast({
        //   title: '用户信息更新失败，请重试',
        // })
      }


      if (that.data.openCapsuleCmd) {
        storageService.setOpenCapsuleCmd(that.data.openCapsuleCmd);
        wx.navigateBack({ delta: 1 })
        return;
      }




      // if (is_deposit == false && app.globalData.localUserInfo.uin != 100000) {
      //   wx.redirectTo({
      //     url: '/pages/depositPay/depositPay?deposit=' + (that.data.deposit_total - that.data.deposit) / 100 + '&back_deposit=' + that.data.back_deposit,
      //   })
      // } else {
      // setTimeout(function () {
      //   wx.navigateBack({
      //     delta: 1
      //   })
      // }, 2000)

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
      // }
    }, that)
  }
})