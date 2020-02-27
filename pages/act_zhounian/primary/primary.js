// pages/act_zhounian/primary/primary.js

const Turntable = require('../../../utils/turntable.js').default;

const {
  openActionLink,
  mixins,
} = require('../../../utils/common.js');

var request = require('../../../utils/request.js').default


var {
  Message
} = require("../../../utils/common.js")
const turntable = new Turntable();


Page({
  ...mixins,

  /**
   * 页面的初始数据
   */
  data: {
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // this.selectComponent('#prizeModal').open();




  },

  load: function () {
    request({
      url: '/api/user/info',
      data: {},
      hand103: () => {
        wx.showModal({
          title: '提示',
          content: '未登录，或登录已超时！',
          confirmText: '去登陆',
          success(res) {
            if (res.confirm) {
              openActionLink('xcx:/pages/login/login');
            } else if (res.cancel) { }
          }
        })
      },
      success: resp => {
        request({
          url: '/api/turn_red_bag',
          method: 'post',
          loading: true,
          data: {},
          success: resp => {
            console.log(resp);
            let dates = (resp.booking_info || []).sort((b1, b2) => b1.create_date - b2.create_date).map(booking => booking.create_date + '');
            let red_bags = (resp.red_bag || []).filter(red_bag => red_bag && red_bag.type == 2 && red_bag.status != 1);
            let prizeRecord = (resp.red_bag || []).filter(red_bag => red_bag && red_bag.type == 2 && red_bag.status == 1);
            prizeRecord.map(prize => {
              prize.receive_time_text = new Date(prize.receive_time * 1000).format('yyyy-MM-dd hh:mm');
            });
            // dates.push(2,34,34,45,46,56,77,78,98989,35,456,7,23);
            this.setData({
              dates,
              red_bags,
              prizeRecord,
              today: new Date().format('yyyyMMdd') - 0,
              week: Math.floor(dates.length / 7),
            });
          }
        });
      }
    });
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
    this.load();
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  getAngle: function (red_bag) {

    // switch (red_bag.price_title) {
    //   case '':
    //   default: break;
    // }

    if (red_bag.price_title == '雨露均沾奖') {
      return 360 / 8 / 2 + 360 * 5 + (360 / 8 * 7)
    } else {
      return 360 / 8 / 2 + 360 * 5 + (360 / 8 * 9)
    }

  },

  turn: function () {
    if (!(this.data.red_bags && this.data.red_bags.length > 0)) {
      if (this.data.dates.length < 7) {
        return Message.msg('你还没有完成7天签到，还不能参加抽奖！');
      } else {
        return Message.msg('抽奖次数为0');
      }
    }
    let red_bag = this.data.red_bags[0];
    request({
      url: '/api/receive/red_bag',
      method: 'post',
      data: {
        red_bag_id: red_bag.id
      },
      success: resp => {
        turntable.turn(this, 'animationData', this.getAngle(red_bag), () => {
          setTimeout(() => {
            this.selectComponent('#prizeModal').open(red_bag.price_title, red_bag.price_title == '雨露均沾奖' ? `${red_bag.cash / 100}元优惠券` : '限时45分钟');
            turntable.reset(this, 'animationData');
            this.load();
          }, 300);
        });
      }
    });
  },

  bindtransitionend: function () {
    turntable.callback();
  },
  showPrizeRecord: function () {
    this.setData({
      showPrizeRecord: true
    });
  },
  hidePrizeRecord: function () {
    this.setData({
      showPrizeRecord: false
    });
  }
})