// pages/booking_flow/booking_flow.js
const {
  openActionLink,
  mixins,
} = require('../../utils/common.js');
var request = require('../../utils/request.js').default
Page({
  ...mixins,
  /**
   * 页面的初始数据
   */
  data: {

  },

  load: function() {
    request({
      url: `/api/booking/bookingid/${this.data.booking_id}`,
      loading: true,
      success: resp => {
        this.setData({
          loaded: true,
          booking: resp.booking_info,
          load_time: Math.floor(Date.now() / 1000),
          server_time: resp.server_time,
        });
        this.setInterval();
      }
    });
  },


  checkTimeText: function(end_time) {
    const now = Math.floor(Date.now() / 1000);

    const {
      load_time,
      server_time,
      booking
    } = this.data;
    if (!booking || !load_time || !server_time) {
      this.setData({
        time_text: '00:00:00'
      });
    } else {
      let t = now - booking.create_time - load_time + server_time;
      let h = Math.floor(t / (60 * 60));
      h = h >= 10 ? h : '0' + h;
      let m = Math.floor(t % (60 * 60) / 60);
      m = m >= 10 ? m : '0' + m;
      let s = t % 60;
      s = s >= 10 ? s : '0' + s;
      this.setData({
        time_text: `${h}:${m}:${s}`
      });
    }
  },

  setInterval: function() {
    this.clearInterval();
    this.checkTimeText();
    this.interval = setInterval(this.checkTimeText, 1000);
  },

  clearInterval: function() {
    clearInterval(this.interval);
  },


  showActModal: function() {
    request({
      url: '/api/booking/get_booking_advertising',
      success: resp => {
        this.setData({
          showActModal: true,
          act_img_url: resp.img_url,
          act_action_link: resp.action_link,
        });
      }
    });
  },
  loadRadio: function() {
    request({
      url: '/api/booking/get_activity_list',
      success: resp => {
        this.setData({
          radioList: resp.activity_list || null
        });
      }
    });
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const booking_id = options.booking_id;
    this.setData({
      booking_id
    });

    this.loadRadio();

  },



  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.load();
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



})