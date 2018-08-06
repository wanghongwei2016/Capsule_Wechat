/** 
 * 时间戳格式化函数 
 * @param  {string} format    格式 
 * @param  {int}    timestamp 要格式化的时间 默认为当前时间 
 * @return {string}           格式化的时间字符串 
 */
var app = getApp()
function date(format, timestamp) {
  var a, jsdate = ((timestamp) ? new Date(timestamp * 1000) : new Date());
  var pad = function (n, c) {
    if ((n = n + "").length < c) {
      return new Array(++c - n.length).join("0") + n;
    } else {
      return n;
    }
  };
  var txt_weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var txt_ordin = { 1: "st", 2: "nd", 3: "rd", 21: "st", 22: "nd", 23: "rd", 31: "st" };
  var txt_months = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var f = {
    // Day 
    d: function () { return pad(f.j(), 2) },
    D: function () { return f.l().substr(0, 3) },
    j: function () { return jsdate.getDate() },
    l: function () { return txt_weekdays[f.w()] },
    N: function () { return f.w() + 1 },
    S: function () { return txt_ordin[f.j()] ? txt_ordin[f.j()] : 'th' },
    w: function () { return jsdate.getDay() },
    z: function () { return (jsdate - new Date(jsdate.getFullYear() + "/1/1")) / 864e5 >> 0 },

    // Week 
    W: function () {
      var a = f.z(), b = 364 + f.L() - a;
      var nd2, nd = (new Date(jsdate.getFullYear() + "/1/1").getDay() || 7) - 1;
      if (b <= 2 && ((jsdate.getDay() || 7) - 1) <= 2 - b) {
        return 1;
      } else {
        if (a <= 2 && nd >= 4 && a >= (6 - nd)) {
          nd2 = new Date(jsdate.getFullYear() - 1 + "/12/31");
          return date("W", Math.round(nd2.getTime() / 1000));
        } else {
          return (1 + (nd <= 3 ? ((a + nd) / 7) : (a - (7 - nd)) / 7) >> 0);
        }
      }
    },

    // Month 
    F: function () { return txt_months[f.n()] },
    m: function () { return pad(f.n(), 2) },
    M: function () { return f.F().substr(0, 3) },
    n: function () { return jsdate.getMonth() + 1 },
    t: function () {
      var n;
      if ((n = jsdate.getMonth() + 1) == 2) {
        return 28 + f.L();
      } else {
        if (n & 1 && n < 8 || !(n & 1) && n > 7) {
          return 31;
        } else {
          return 30;
        }
      }
    },

    // Year 
    L: function () { var y = f.Y(); return (!(y & 3) && (y % 1e2 || !(y % 4e2))) ? 1 : 0 },
    //o not supported yet 
    Y: function () { return jsdate.getFullYear() },
    y: function () { return (jsdate.getFullYear() + "").slice(2) },

    // Time 
    a: function () { return jsdate.getHours() > 11 ? "pm" : "am" },
    A: function () { return f.a().toUpperCase() },
    B: function () {
      // peter paul koch: 
      var off = (jsdate.getTimezoneOffset() + 60) * 60;
      var theSeconds = (jsdate.getHours() * 3600) + (jsdate.getMinutes() * 60) + jsdate.getSeconds() + off;
      var beat = Math.floor(theSeconds / 86.4);
      if (beat > 1000) beat -= 1000;
      if (beat < 0) beat += 1000;
      if ((String(beat)).length == 1) beat = "00" + beat;
      if ((String(beat)).length == 2) beat = "0" + beat;
      return beat;
    },
    g: function () { return jsdate.getHours() % 24 || '00' },
    G: function () { return jsdate.getHours() },
    h: function () { return pad(f.g(), 2) },
    H: function () { return pad(jsdate.getHours(), 2) },
    i: function () { return pad(jsdate.getMinutes(), 2) },
    s: function () { return pad(jsdate.getSeconds(), 2) },
    //u not supported yet 

    // Timezone 
    //e not supported yet 
    //I not supported yet 
    O: function () {
      var t = pad(Math.abs(jsdate.getTimezoneOffset() / 60 * 100), 4);
      if (jsdate.getTimezoneOffset() > 0) t = "-" + t; else t = "+" + t;
      return t;
    },
    P: function () { var O = f.O(); return (O.substr(0, 3) + ":" + O.substr(3, 2)) },
    //T not supported yet 
    //Z not supported yet 

    // Full Date/Time 
    c: function () { return f.Y() + "-" + f.m() + "-" + f.d() + "T" + f.h() + ":" + f.i() + ":" + f.s() + f.P() },
    //r not supported yet 
    U: function () { return Math.round(jsdate.getTime() / 1000) }
  };

  var ret = 0
  return format.replace(/[\\]?([a-zA-Z])/g, function (t, s) {
    if (t != s) {
      // escaped 
      ret = s;
    } else if (f[s]) {
      // a date function exists 
      ret = f[s]();
    } else {
      // nothing special 
      ret = s;
    }
    return ret;
  });
}
function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

/**
 * 格式化Number输出
 */
function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/**
 * 时间戳转 时分秒
 */
function timeShowString(timeCount) {
  if (timeCount <= 0) {
    return "00:00:00"
  }
  var seconds = Math.floor(timeCount%60)
  var minutes = Math.floor(timeCount/60%60)
  var hours = Math.floor(timeCount/60/60)
  hours = hours < 10? ("0"+String(hours)):hours
  minutes = minutes < 10? ("0"+minutes):minutes
  seconds = seconds < 10? ("0"+seconds):seconds
  return hours+":"+minutes+":"+seconds
}

/**
 * 时间戳转 时分秒
 */
function timeMS(timeCount) {
  if (timeCount < 0) {
    return "00:00"
  }
  var seconds = Math.floor(timeCount % 60)
  var minutes = Math.floor(timeCount / 60 % 60)
  minutes = minutes < 10 ? ("0" + minutes) : minutes
  seconds = seconds < 10 ? ("0" + seconds) : seconds
  return  minutes + ":" + seconds
}

/**
 * 拨打电话
 */
function callService(num) {
  console.log(num)
  var phone = "400-688-9960"
  if (num && num.length > 0){
     phone = num
  }
  var isIOS;
  wx.getSystemInfo({
    success: function (res) {
      // success
      console.log(res)
      isIOS = res.system.toUpperCase().indexOf('IOS') > -1 ? 1 : 0
    }
  })
  if (isIOS == 0){
    wx.showModal({
      content: phone,
      confirmText: "呼叫",
      success: function (res) {
        if (res.confirm) {
          //拨打客服电话
          wx.makePhoneCall({
            phoneNumber: phone,
            success: function (res) {
            }
          })
        }
      }
    })
  }else{
    //拨打客服电话
    wx.makePhoneCall({
      phoneNumber: phone,
      success: function (res) {
      }
    })
  }
  
}
/**
 * 从URL中读取capsule_id
 */
function getCapsuleIdFromUrl(url){
    var q = decodeURIComponent(url)
    console.log(q)
    q = q.split('?id=')[1]
    return  parseInt(q)
}
/**
 * 从URL中读取邀请人的uin
 */
function getUinFromUrl(url) {
  var q = decodeURIComponent(url)
  var arr = q.split('/')
  return parseInt(arr[arr.length-1])
}

/**
 * 腾讯经纬度(中国经纬度)转百度经纬度
 */
function convert_GCJ02_To_BD09(latitude,longitude) {
  var x_pi = 2.14159265358979324 * 3000.0 / 180.0
  var x = longitude
  var y = latitude
  var z = Math.sqrt(x*x+y*y) + 0.00002 * Math.sin(y*x_pi)
  var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x*x_pi)
  longitude = z * Math.cos(theta) + 0.0065
  latitude = z * Math.sin(theta) + 0.006
  return {'latitude':latitude,'longitude':longitude}
}

/**
 * 百度经纬度转腾讯经纬度(中国经纬度)
 */

function convert_BD09_To_GCJ02(latitude,longitude) {
  var x = longitude - 0.0065
  var y = latitude - 0.006
  var x_pi = 3.14159265358979324 * 3000.0 / 180.0
  var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi) 
  var theta = Math.atan2(y,x) - 0.000003 * Math.cos(x*x_pi)
  longitude = z*Math.cos(theta)
  latitude = z*Math.sin(theta)
  return { 'latitude': latitude, 'longitude': longitude }
}

/**
 * 计算两个经纬度之间的距离
 */
function getRad(d) {
  return d * Math.PI / 180.0;
}
function getDistance(lat1, lng1, lat2, lng2) {
  var EARTH_RADIUS = 6378137.0;
  var f = getRad((lat1 + lat2) / 2);
  var g = getRad((lat1 - lat2) / 2);
  var l = getRad((lng1 - lng2) / 2);

  var sg = Math.sin(g);
  var sl = Math.sin(l);
  var sf = Math.sin(f);

  var s, c, w, r, d, h1, h2;
  var a = EARTH_RADIUS;
  var fl = 1 / 298.257;

  sg = sg * sg;
  sl = sl * sl;
  sf = sf * sf;

  s = sg * (1 - sl) + (1 - sf) * sl;
  c = (1 - sg) * (1 - sl) + sf * sl;

  w = Math.atan(Math.sqrt(s / c));
  r = Math.sqrt(s * c) / w;
  d = 2 * w * a;
  h1 = (3 * r - 1) / 2 / c;
  h2 = (3 * r + 1) / 2 / s;

  return d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg));
}
/**
 * websocket
 */
function initWebsocket(uin){
  
}
/**
 * 微信版本
 */
function lowerVersion(standardVersion) {
  var baseVersion = ''
  var sysVersion = ''
  wx.getSystemInfo({
    success: function (res) {
      // success
      console.log(res)
      baseVersion = res.SDKVersion
      sysVersion = res.version
    }
  })
  var [MAJOR, MINOR, PATCH] = decodeURI(baseVersion).split('.')
  var [SYS_MAJOR, SYS_MINOR, SYS_PATCH] = decodeURI(sysVersion).split('.')
  var [BASE_MAJOR, BASE_MINOR, BASE_PATCH] = standardVersion.split('.')
  console.log(sysVersion)
  console.log(SYS_MAJOR, SYS_MINOR, SYS_PATCH)
  console.log(BASE_MAJOR, BASE_MINOR, BASE_PATCH)

  if (parseInt(SYS_MAJOR) <= parseInt(BASE_MAJOR) && parseInt(SYS_MINOR) <= parseInt(BASE_MINOR) && parseInt(SYS_PATCH) < parseInt(BASE_PATCH)) {
    return true;
  }
  return false
}

/** 
 *  获取指定元素的高度
 */

function getClassHeight(name,callback) {
  wx.createSelectorQuery().select('#'+name).boundingClientRect(
    function(rect){
      if(callback){
        callback(rect.height)
      }
    }).exec()
}
module.exports = {
  formatTime: formatTime,
  timeShowString: timeShowString,
  callService: callService,
  getCapsuleId:getCapsuleIdFromUrl,
  convert_BD09_To_GCJ02: convert_BD09_To_GCJ02,
  convert_GCJ02_To_BD09: convert_GCJ02_To_BD09,
  date: date,
  getDistance: getDistance,
  getUinFromUrl: getUinFromUrl,
  initWebsocket: initWebsocket,
  timeMS,
  lowerVersion
}
