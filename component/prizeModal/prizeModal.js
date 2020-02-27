// component/prizeModal/prizeModal.js
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
    open: function (title,sub_title) {
      this.setData({
        show: true,
        title,sub_title,
      });
    },
    close: function () {
      this.setData({
        show: false
      });
    },
  }
})
