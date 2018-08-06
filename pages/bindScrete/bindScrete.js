
var network = require("../../utils/network")
Page({
    data: {
        bindNumber: 0,
        bindBtnDisabled: false
    },
    inputBindNumber: function (e) {
        var num = e.detail.value

        console.log(num)
        this.setData({
            bindNumber: num
        })
    },
    bindScreteAction: function () {
        var that = this
        if (wx.showLoading) {
            wx.showLoading({
                title: "入住码绑定中",
                icon: '',
                duration: 2000
            })
        } else {
            that.setData({
                bindBtnDisabled: true
            })
        }
        network.shareSleepNetwork("booking/bind", { "token": this.data.bindNumber }, "POST", function complete(res) {
            if (wx.hideLoading) {
                wx.hideLoading()
            } else {
                that.setData({
                    bindBtnDisabled: false
                })
            }
            if (parseInt(res.data.ret) == 0) {
                wx.showModal({
                    content: "入住码绑定成功，你只需在入住时间内扫描指定太空舱号就可以直接打开舱门，享受高品质睡眠",
                    showCancel: false,
                    confirmText: "知道了",
                    success: function (resp) {
                        wx.navigateBack({
                            delta: 1
                        })
                    }
                })
            }
        },that)
    }
})