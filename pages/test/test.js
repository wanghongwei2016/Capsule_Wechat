var {
  Message,
  mixins,
} = require("../../utils/common.js")
var request = require("../../utils/request.js").default
Page({
  ...mixins,
  data: {

  },

  onLoad: function(options) {

  },

  test() {
    request({
      url: `/jpi/booking/${788030274}/create_guohang_link`,
      loading: true,
      success: resp => {
        wx.navigateToMiniProgram({
          appId: resp.data.xcx_appid,
          path: resp.data.xcx_path,
          extraData: {
            param: resp.data.param
          },
          success: res => {}
        })
      }
    });
  },
})