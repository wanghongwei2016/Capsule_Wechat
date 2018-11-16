// component/zqPrizeModal/zqPrizeModal.js
var request = require('../../utils/request.js').default
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
    hide: function () {
      this.setData({ show: false });
    },
    exchange: function () {
      request({
        url: '/api/acitvity/get_mid_autumn_cash', loading: true,
        success: resp => {
          this.hide();
          if (this.data.redpModalNode) {
            this.data.redpModalNode.setData({
              show: true,
              title: '中秋集卡赢大奖',
              sub_title: '恭喜您获得红包',
              footer_text: '红包将在五分钟内自动放入「我的-钱包」',
              unit: '',
              prize_text: resp.cash / 100,
              fail: false,
            });
          }
        }
      });

    },
  }
})
