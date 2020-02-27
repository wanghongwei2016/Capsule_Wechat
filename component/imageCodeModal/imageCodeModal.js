// component/imageCodeModal/imageCodeModal.js

var request = require('../../utils/request.js').default

const {
  mixins,
  checkPhone,
  Message,
} = require('../../utils/common.js')

Component({

  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    ...mixins,
    update: function() {
      request({
        url: '/api/user/send_img_code',
        method: 'post',
        success: resp => {
          console.log('image', `data:image/png;base64,${resp.image}`);
          this.setData({
            noncestr: resp.noncestr || null,
            timestamp: resp.timestamp || null,
            sign: resp.sign || null,
            image: resp.image || null,
          });
        }
      })
    },

    close: function () {
      this.setData({
        show: false,
      });
    },
    open: function(callback) {
      this.callback = callback;
      this.setData({
        show: true,
      });
      this.update();
    },
    ok: function() {
      console.log(this.data);
      if (!/^.{4,8}$/.test(this.data.code)) {
        return Message.msg('验证码输入有误！');
      }
      this.callback(this.data.noncestr, this.data.timestamp, this.data.sign, (this.data.code || '').toUpperCase());
    },
    cancel: function() {
      this.close();
    }
  }
})