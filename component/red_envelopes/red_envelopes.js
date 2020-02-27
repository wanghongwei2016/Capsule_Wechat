
var request = require("../../utils/request.js").default


module.exports = {
  mixins: {
    closeRedEnvelopes: function () {
      this.setData({
        red_envelopes: null
      });
    },
    openRedEnvelopes: function (opt) {
      const red_envelopes = {
        title: opt.title,
        sub_title: opt.sub_title,
        prize_text: opt.prize_text,
        prize_text_small: opt.prize_text_small,
        footer_text: opt.footer_text,
      };
      this.setData({
        red_envelopes
      });
    },
    checkPrizeQuota:function(booking_id, success, fail) {
      request({
        url: `/jpi/booking/${booking_id}/checkPrizeQuota`,
        method: 'post',
        success: resp => {
          if (resp.data && resp.data.quota) {
            if (success) {
              success(resp.data.quota);
            } else {
              this.openRedEnvelopes({
                title: '恭喜获得红包',
                sub_title: '红包已自动放入 「我的-钱包」',
                prize_text: resp.data.quota.price/100,
                prize_text_small: '元',
                footer_text: '',
              });
            }
          } else {
            if (fail) fail();
          }

        }
      });
    }
  }
}