

export default {

  //计时页面冥想音乐活动弹框控制
  setMusicActModal: function (booking_id) {
    wx.setStorageSync(`MusicActModal:${booking_id}`, true);
  },
  hadMusicActModal: function (booking_id) {
    return !!wx.getStorageSync(`MusicActModal:${booking_id}`);
  },
  delMusicActModal: function (booking_id) {
    wx.removeStorageSync(`MusicActModal:${booking_id}`);
  },
  //计时页面月卡购买活过期提醒弹框控制
  setMonthCardModal: function (booking_id) {
    wx.setStorageSync(`MonthCardModal:${booking_id}`, true);
  },
  hadMonthCardModal: function (booking_id) {
    return !!wx.getStorageSync(`MonthCardModal:${booking_id}`);
  },
  delMonthCardModal: function (booking_id) {
    wx.removeStorageSync(`MonthCardModal:${booking_id}`);
  },


  setScanCodeCmd: function () {
    wx.setStorageSync('ScanCodeCmd', Date.now());
  },

  tryScanCodeCmd: function () {
    let ms = wx.getStorageSync('ScanCodeCmd');
    wx.removeStorageSync('ScanCodeCmd');
    if (ms && Date.now() - ms < 1000 * 15) {
      return true;
    }
    return false;
  },

  setOpenCapsuleCmd: function (cpasule_id) {
    wx.setStorageSync('OpenCapsuleCmd', {
      cpasule_id, ms: Date.now()
    });
  },

  tryOpenCapsuleCmd: function () {
    let openCapsuleCmd = wx.getStorageSync('OpenCapsuleCmd');
    wx.removeStorageSync('OpenCapsuleCmd');
    if (openCapsuleCmd && Date.now() - openCapsuleCmd.ms < 1000 * 60) {
      return openCapsuleCmd.cpasule_id;
    }
  },






}