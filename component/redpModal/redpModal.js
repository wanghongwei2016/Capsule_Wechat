// component/redpModal/redpModal.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show: Boolean,
    title: String,
    sub_title: String,
    footer_text: String,
    unit: String,
    fail_text: String,
    prize_text: String,
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
    hide: function () {
      this.setData({ show: false });
    },
  },

  ready: function () {
  }
})
