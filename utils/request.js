const storageService = require('./storageService.js').default

const app = getApp();

const urlDomain = app.globalData.debug ? 'http://dev.xiangshuispace.com:18083' : 'https://www.xiangshuispace.com';

export default function (opt = {}) {
  let localUserCache = storageService.getLocalUserCache();
  let url = `${urlDomain}${opt.url}`;
  let method = opt.method ? opt.method.toUpperCase() : 'GET';
  let header = {
    'content-type': 'application/json',
    'User-Uin': localUserCache && localUserCache.uin ? localUserCache.uin : 100000,
    'Req-From': 'wx-app',
    'Client-Token': localUserCache && localUserCache.token ? localUserCache.token : undefined,
    ...opt.header
  };
  let data = opt.data;
  if (opt.loading) {
    wx.showLoading({
      title: opt.loadingTitle || '加载中',
      mask: !!opt.loadingMask,
      success: opt.loadingSuccess,
      fail: opt.loadingFail,
      complete: opt.loadingComplete,
    });
  }

  console.log('request', { url, method, header, data, });
  let requestTask = wx.request({
    url, method, header, data,
    dataType: opt.dataType || 'json', responseType: opt.responseType || 'text',
    success: function (response) {
      if (opt.loading) {
        wx.hideLoading();
      }
      if (response.statusCode == 200) {
        let resp = response.data;
        if (resp.ret == 0) {
          console.log('response', resp);
          if (opt.success) {
            opt.success(resp);
          }
        } else {
          console.warn('response', resp);
          wx.showToast({
            title: resp.err || '系统错误',
            icon: 'none',
          });
        }

      } else {
        console.error('response', response);
      }
    },
    fail: function (error) {
      if (opt.loading) {
        wx.hideLoading();
      }
    },
    complete: function () {
      if (opt.complete) {
        opt.complete();
      }
    },
  });
  return {
    abort: function () {
      if (opt.loading) {
        wx.hideLoading();
      }
      requestTask.abort();
    }
  };
}