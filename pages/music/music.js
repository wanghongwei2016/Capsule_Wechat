//loginPage.js
var network = require('../../utils/network.js')
var utils = require("../../utils/util.js")
var app = getApp()
var pageData = {
  data: {
    musicOriginId: '',
    isDefault: true,
    isPlay: false,
    duration: '00:00',
    currentTime: '00:00',
    totalProgress: 430,
    musicPage: 1,
    endFlag: true,
    pageHide: false,
    showHead: false//展示顶部文案
  },
  showActModal: function () {
    this.setData({
      showActModal: true,
    });
  },
  hideActModal: function () {
    this.setData({
      showActModal: false,
    });
  },
  onLoad: function () {
    console.log('onload========')
    var that = this
    // toast组件实例
    new app.ToastPannel();
  },
  onUnload: function () {
    this.setData({
      musicPage: 0
    })
    this.stopRotate()
  },
  onShow: function (e) {
    console.log('onshow==============')
    var that = this;
    that.setData({
      pageHide: false
    })
    if (that.data.music_list && that.data.music_list.length > 0) {
      that.watchOtherPageComeIn()
    } else {
      that.getMusicList(function () {
        that.watchOtherPageComeIn()
      })
    }
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.stopRotate()
    this.setData({
      pageHide: true
    })
  },
  updateHealthReportCache: function () {
    // 如果用户使用了冥想音乐，存储健康数据标记
    wx.getStorage({
      key: 'healthReportCache',
      success: function (res) {
        console.log(res.data)
        var healthReport = Object.assign(res.data, { muse_flag: 1 })
        wx.setStorage({
          key: 'healthReportCache',
          data: healthReport,
          complete: function (res) {
            console.log(res)
          }
        })
      }
    })
  },
  //获取音乐列表
  getMusicList: function (callBack) {
    var that = this;
    network.shareSleepNetwork('music/get_list_info', {}, "GET", function complete(res) {
      console.log(res);
      if (res.statusCode == 200 && res.data.ret == 0) {
        var music_list = res.data.music_list;
        if (music_list.length > 0) {
          for (var i = 0; i < music_list.length; i++) {
            music_list[i].play = false
            music_list[i].music_time = utils.timeMS(music_list[i].music_time)
          }
          that.setData({
            music_list,
            music_head: res.data.music_head ? res.data.music_head : '美国顶级正念冥想大师制作',
            music_end: res.data.music_end ? res.data.music_end : '本冥想内容由@睿心提供'
          })
          // wx.setNavigationBarTitle({
          //   title: that.data.music_head
          // })
          if (callBack) {
            callBack()
          }
        }
      } else {
        that.show(res.data.err)
      }
    }, that)
  },
  //监听从其他页面进来时判断有无背景音乐播放
  watchOtherPageComeIn: function () {
    var that = this;
    var music_list = that.data.music_list;
    //从其他页面进来时判断有无背景音乐播放
    const backgroundAudioManager = wx.getBackgroundAudioManager()
    if (backgroundAudioManager.src) {
      console.log('has src==========')
      if (app.globalData.rotateOrigin) {
        that.setData({
          rotate: app.globalData.rotateOrigin
        })
      }
      for (var i = 0; i < music_list.length; i++) {
        if (i == app.globalData.musicPlayId) {
          music_list[i].play = true;
        } else {
          music_list[i].play = false;
        }
      }
      // wx.setNavigationBarTitle({
      //   title: music_list[app.globalData.musicPlayId].music_title,
      // })
      var currentTime = backgroundAudioManager.currentTime;
      var duration = backgroundAudioManager.duration;
      that.setData({
        currentTimeSeconds: currentTime,
        durationSeconds: duration,
        currentTime: utils.timeMS(currentTime),
        musicProgressWidth: that.data.totalProgress * currentTime / duration + 'rpx',
        duration: utils.timeMS(duration),
        isDefault: false,
        isPlay: true,
        music_list,
        showHead: app.globalData.musicPlayId < 9 ? true : false,
        musicOriginId: app.globalData.musicPlayId
      })
      console.log('watchOtherPageComeIn=========' + utils.timeMS(currentTime))
      console.log(backgroundAudioManager)
      if (!backgroundAudioManager.paused) {
        that.animationRotate()
        that.setData({
          isPlay: true
        })
      } else {
        that.setData({
          isPlay: false
        })
      }
    }
    that.watchMusic();
  },
  //音乐选择
  chooseMusic: function (event) {
    if (wx.showLoading) {
      wx.showLoading({
        title: "正在加载音乐"
      })
    }
    var that = this;
    var musicId = event.currentTarget.dataset.music;
    var music_list = this.data.music_list;
    for (var i = 0; i < music_list.length; i++) {
      if (i == musicId) {
        music_list[i].play = true;
      } else {
        music_list[i].play = false;
      }
    }
    this.setData({
      music_list,
      isDefault: false
    })
    if (this.data.musicOriginId !== musicId) {
      this.openMusicAction(musicId, that.data.music_list[musicId].music_url, that.data.music_list[musicId].music_title, function () {
        that.setData({
          musicOriginId: musicId,
          isPlay: true,
          duration: '00:00',
          currentTime: '00:00',
          rotate: 0
        })
      })
    }
  },
  //启动后台播放音乐
  openMusicAction: function (musicPlayId, dataUrl, title, complete) {
    var that = this;
    that.watchMusic();
    if (that.data.musicPage === 1) {
      // wx.setNavigationBarTitle({
      //   title: title,
      // })
    }
    that.setData({
      showHead: musicPlayId < 9 ? true : false
    })
    app.globalData.musicPlayId = musicPlayId
    const backgroundAudioManager = wx.getBackgroundAudioManager()
    backgroundAudioManager.src = dataUrl;
    backgroundAudioManager.title = title;
    backgroundAudioManager.coverImgUrl = 'http://s3.cn-north-1.amazonaws.com.cn/capsuleimgs/90a1d2fa-d98d-11e7-8bbf-02224fba0f98.c_750';
    if (complete) {
      complete()
    }
  },
  //音乐暂停、开始播放
  playButtonAction: function () {
    console.log('音乐暂停、开始播放')
    var that = this;
    //判断是否是首次进入该页面，此时点击暂停按钮默认播放第一首歌
    if (this.data.isDefault) {
      this.openMusicAction(0, this.data.music_list[0].music_url, this.data.music_list[0].music_title, function () {
        var music_list = that.data.music_list;
        music_list[0].play = true;
        that.setData({
          isDefault: false,
          music_list: music_list,
          musicOriginId: 0
        })
      })
      return
    }
    const backgroundAudioManager = wx.getBackgroundAudioManager()
    if (!backgroundAudioManager.paused) {
      backgroundAudioManager.pause();
    } else {
      backgroundAudioManager.play();
    }
  },
  //监听音乐播放
  watchMusic: function () {
    const backgroundAudioManager = wx.getBackgroundAudioManager();
    //背景音频播放进度更新事件
    backgroundAudioManager.onTimeUpdate(() => {
      if (this.data.beginDrag) return
      var currentTime = backgroundAudioManager.currentTime;
      var duration = backgroundAudioManager.duration;
      this.setData({
        currentTimeSeconds: currentTime,
        durationSeconds: duration,
        currentTime: utils.timeMS(currentTime),
        musicProgressWidth: this.data.totalProgress * currentTime / duration + 'rpx',
        duration: utils.timeMS(duration)
      })
    })
    //背景音频自然播放结束事件
    backgroundAudioManager.onEnded(() => {
      console.log('onEnd===============')
      if (!this.data.endFlag) {
        this.stopRotate()
        // this.setData({
        //   rotate: 0
        // });
        var that = this;
        var musicOriginId = parseInt(this.data.musicOriginId);
        var music_list = this.data.music_list;
        var nextMusicId = (musicOriginId + 1) % music_list.length;
        console.log('nextMusicId=====' + nextMusicId)
        this.openMusicAction(nextMusicId, music_list[nextMusicId].music_url, music_list[nextMusicId].music_title, function () {
          for (var i = 0; i < music_list.length; i++) {
            if (i == nextMusicId) {
              music_list[i].play = true;
            } else {
              music_list[i].play = false;
            }
          }
          that.setData({
            music_list,
            musicOriginId: nextMusicId,
            isPlay: true,
            endFlag: true
          })
        })
      }
    })
    //背景音频暂停事件
    backgroundAudioManager.onPause(() => {
      console.log('pause=====================')
      this.stopRotate()
      this.setData({
        isPlay: false
      })
    })
    //背景音频播放事件
    backgroundAudioManager.onPlay(() => {
      console.log('play=====================')
      this.animationRotate()
      this.updateHealthReportCache()
      this.setData({
        isPlay: true,
        showHead: this.data.musicOriginId < 9 ? true : false,
        endFlag: false
      })
      setTimeout(() => {
        if (wx.hideLoading) {
          wx.hideLoading()
        }
      }, 500)
    })
    //背景音频播放错误事件
    backgroundAudioManager.onError((err) => {
      console.log('error======================')
      console.log(err)
      this.show('音频播放错误');
      this.stopRotate()
      this.setData({
        isPlay: false,
        musicProgressWidth: '0rpx'
      })
    })
    //背景音频停止事件
    backgroundAudioManager.onStop(() => {
      console.log('stop===============')
      this.stopRotate()
      var music_list = this.data.music_list;
      for (var i = 0; i < music_list.length; i++) {
        music_list[i].play = false;
      }
      this.setData({
        musicOriginId: '',
        isDefault: true,
        isPlay: false,
        duration: '00:00',
        currentTime: '00:00',
        music_list,
        rotate: 0,
        showHead: false,
        musicProgressWidth: '0rpx'
      })
    })
    //用户在系统音乐播放面板点击下一曲事件（iOS only）
    backgroundAudioManager.onNext(() => {
      console.log('next===============')
      var that = this;
      var musicOriginId = parseInt(this.data.musicOriginId);
      var music_list = this.data.music_list;
      var nextMusicId = (musicOriginId + 1) % music_list.length;
      this.openMusicAction(nextMusicId, music_list[nextMusicId].music_url, music_list[nextMusicId].music_title, function () {
        for (var i = 0; i < music_list.length; i++) {
          if (i == nextMusicId) {
            music_list[i].play = true;
          } else {
            music_list[i].play = false;
          }
        }
        that.setData({
          music_list,
          musicOriginId: nextMusicId,
          isPlay: true
        })
      })
    })
    //用户在系统音乐播放面板点击上一曲事件（iOS only）
    backgroundAudioManager.onPrev(() => {
      console.log('prev===============')
      var that = this;
      var musicOriginId = parseInt(this.data.musicOriginId);
      var music_list = this.data.music_list;
      var prevMusicId
      if (musicOriginId == 0) {
        prevMusicId = music_list.length - 1
      } else {
        prevMusicId = (musicOriginId - 1) % music_list.length;
      }
      this.openMusicAction(prevMusicId, music_list[prevMusicId].music_url, music_list[prevMusicId].music_title, function () {
        for (var i = 0; i < music_list.length; i++) {
          if (i == prevMusicId) {
            music_list[i].play = true;
          } else {
            music_list[i].play = false;
          }
        }
        that.setData({
          music_list,
          musicOriginId: prevMusicId,
          isPlay: true
        })
      })
    })
    //音频加载中事件，当音频因为数据不足，需要停下来加载时会触发
    backgroundAudioManager.onWaiting(() => {
      if (wx.showLoading) {
        wx.showLoading({
          title: "正在加载音乐"
        })
      }
    })
  },
  //监听控制条的滑动
  moveAction: function (e) {
    this.setData({
      beginDrag: true
    });
    let moveHandler = this.data.moveHandler;
    const backgroundAudioManager = wx.getBackgroundAudioManager()
    if (!backgroundAudioManager.src) {
      return;
    }
    var that = this;
    let rate = app.globalData.rate
    let totalOffset = (750 - this.data.totalProgress) / 2 / rate
    let currentOffset = e.touches[0].pageX
    let offset = currentOffset - totalOffset
    let percent = offset / (this.data.totalProgress / rate)
    percent = percent > 1 ? 1 : percent
    var musicProgressWidthOrigin = this.data.totalProgress * percent
    var seekTime = (musicProgressWidthOrigin * that.data.durationSeconds) / this.data.totalProgress >= 0 ? (musicProgressWidthOrigin * that.data.durationSeconds) / this.data.totalProgress : 0
    this.setData({
      musicProgressWidthOrigin,
      musicProgressWidth: this.data.totalProgress * percent + 'rpx',
      currentTimeSeconds: seekTime,
      currentTime: utils.timeMS(seekTime)
    })
    if (moveHandler) clearTimeout(moveHandler)
    moveHandler = setTimeout(() => {
      backgroundAudioManager.seek(seekTime - 1)
      if (backgroundAudioManager.pause) {
        backgroundAudioManager.play();
      }
      this.setData({
        beginDrag: false
      })
    }, 600);
    this.setData({
      moveHandler
    })
  },
  //动画
  animationRotate: function () {
    if (!this.data.pageHide) {
      let handler = this.data.handler || 0;
      let speed = 0.4;
      let rotate = this.data.rotate || 0
      this.stopRotate()
      handler = setInterval(() => {
        let tempRotate = this.data.rotate;
        tempRotate += speed;
        if (tempRotate > 360) tempRotate = 0;
        this.setData({
          rotate: tempRotate
        });
        app.globalData.rotateOrigin = tempRotate
      }, 1000 / 60);
      this.setData({
        rotate,
        handler
      });
    }
  },
  //停止动画
  stopRotate: function () {
    if (this.data.handler) clearInterval(this.data.handler)
  }
}
Page(pageData)

