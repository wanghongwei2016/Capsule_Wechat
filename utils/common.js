

var request = require("./request.js").default

const UUID = {
  cs: '012346789abcdef'.toUpperCase().split(''),
  get: function (n) {
    n = n || 32;
    let _uuid = "";
    for (let i = 0; i < n; i++) {
      let index = Math.floor(Math.random() * this.cs.length);
      _uuid += this.cs[index];
    }
    return _uuid;
  }
};

function type(o, t) {
  if (t === undefined) {
    if (o !== o) return 'NaN';
    let typeStr = Object.prototype.toString.call(o);
    return typeStr.substring(8, typeStr.length - 1);
  } else {
    return type(o) === t;
  }
}

function typeValue(o, t, d) {
  return type(o, t) ? o : (d || null);
}

Date.prototype.format = function (fmt) {
  if (!fmt) fmt = "yyyy-MM-dd hh:mm:ss";
  let o = {
    "M+": this.getMonth() + 1, //月份
    "W": (function (date) {
      switch (date.getDay()) {
        case 0:
          return "日";
        case 1:
          return "一";
        case 2:
          return "二";
        case 3:
          return "三";
        case 4:
          return "四";
        case 5:
          return "五";
        case 6:
          return "六";
        default:
          return "";
      }
    })(this), //星期
    "d+": this.getDate(), //日
    "h+": this.getHours(), //小时
    "m+": this.getMinutes(), //分
    "s+": this.getSeconds(), //秒
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度
    "S": this.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (let k in o)
    if (new RegExp("(" + k + ")").test(fmt))
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
};

class ListOptions {
  constructor() {
    this.optionList = [];
  }

  getId(option) {
    return option.id;
  }

  insertOption(option) {
    if (this.getOptionById(this.getId(option)) == null) {
      this.optionList.push(option);
    }
  }

  deleteOption(option) {
    let id = this.getId(option);
    this.removeOptionById(id);
  }

  deleteOptionById(id) {
    for (let i = 0; i < this.optionList.length; i++) {
      if (this.getId(this.optionList[i]) == id) {
        this.optionList.splice(i, 1);
        break;
      }
    }
  }

  updateOption(option) {
    let id = this.getId(option);
    for (let i = 0; i < this.optionList.length; i++) {
      if (this.getId(this.optionList[i]) == id) {
        this.optionList[i] = option;
        return;
      }
    }
  }

  saveOption(option) {
    let id = this.getId(option);
    for (let i = 0; i < this.optionList.length; i++) {
      if (this.getId(this.optionList[i]) == id) {
        this.optionList[i] = option;
        return;
      }
    }
    this.optionList.push(option);
  }

  selectOptionById(id) {
    for (let i = 0; i < this.optionList.length; i++) {
      let option = this.optionList[i];
      if (this.getId(option) == id) {
        return option;
      }
    }
  }
}

class MapOptions {
  constructor(options) {
    this.optionMap = {};
    this.putAll(options);
  }

  getIdByOption(option) {
    return option ? option.id || null : null;
  }

  put(option) {
    let id = this.getIdByOption(option);
    if (id || id === 0 || id === false) {
      this.optionMap[id] = option;
    }
  }

  putAll(options) {
    if (options && options.length > 0) {
      for (let i = 0; i < options.length; i++) {
        this.put(options[i]);
      }
    }
  }

  removeById(id) {
    delete this.optionMap[id];
  }

  removeByOption(option) {
    let id = this.getIdByOption(option);
    this.removeById(id);
  }

  get(id) {
    return this.optionMap[id];
  }
}

class StringMapOptions extends MapOptions {
  constructor(options) {
    super(options);
  }

  getIdByOption(option) {
    return option || null;
  }
}

function queryString(json) {
  return Object.keys(json).map(function (key) {
    return `${encodeURIComponent(key)}=${encodeURIComponent(json[key])}`;
  }).join("&");
}


function getBigFactor(a, b) {
  if (b == 0) {
    return a;
  }
  return getBigFactor(b, a % b)
}


class LocalDate {
  constructor(year, month, day) {
    this.year = year;
    this.month = month;
    this.day = day;
    this.check();
  }

  check() {
    let now = new Date();
    this.year = this.year || now.getFullYear();
    this.month = this.month || now.getMonth() + 1;
    this.day = this.day || now.getDate();
    if (this.month < 1) {
      this.month = 1;
    } else if (this.month > 12) {
      this.month = 12;
    }
    if (this.day < 1) {
      this.day = 1;
    } else if (this.day > this.getMaxDay(this.year, this.month)) {
      this.day = this.getMaxDay(this.year, this.month);
    }
    return this;
  }

  getMaxDay(year, month) {
    switch (month) {
      case 1:
      case 3:
      case 5:
      case 7:
      case 8:
      case 10:
      case 12:
        return 31;
      case 4:
      case 6:
      case 9:
      case 11:
        return 30;
      case 2:
        if (this.year % 4 === 0) {
          return 29;
        } else {
          return 28;
        }
      default:
        return;
    }
  }

  getYear() {
    return this.year;
  }

  getMonth() {
    return this.month;
  }

  getDay() {
    return this.day;
  }

  withDay(day) {
    this.day = day;
    this.check();
    return this;
  }

  withMonth(month) {
    this.month = month;
    this.check();
    return this;
  }

  withYear(year) {
    this.year = year;
    this.check();
    return this;
  }

  plusYears(n, uncheck) {
    if (n > 0) {
      this.year++;
    }
    if (!uncheck) this.check();
    return this;
  }

  minusYears(n, uncheck) {
    if (n > 0) {
      this.year--;
    }
    if (!uncheck) this.check();
    return this;
  }

  plusMonths(n, uncheck) {
    if (n > 0) {
      if (this.month === 12) {
        this.plusYears(1, true);
        this.month = 1;
      } else {
        this.month++;
      }
    }
    if (!uncheck) this.check();
    return this;
  }

  minusMonths(n, uncheck) {
    if (n > 0) {
      if (this.month === 1) {
        this.minusYears(1, true);
        this.month = 12;
      } else {
        this.month--;
      }
    }
    if (!uncheck) this.check();
    return this;
  }

  plusDays(n) {
    if (n > 0) {
      while (n-- >= 1) {
        if (this.day >= this.getMaxDay(this.year, this.month)) {
          this.plusMonths(1, true);
          this.day = 1;
        } else {
          this.day++;
        }
      }
    }
    this.check();
    return this;
  }

  minusDays(n) {
    if (n > 0) {
      while (n-- >= 1) {
        if (this.day === 1) {
          this.minusMonths(1, true);
          this.day = this.getMaxDay(this.year, this.month);
        } else {
          this.day--;
        }
      }
    }
    this.check();
    return this;
  }

  toDate() {
    return new Date(this.year, this.month - 1, this.day);
  }

  format(fmt) {
    return this.toDate().format(fmt);
  }

  getTime() {
    return this.toDate().getTime();
  }

  toString() {
    return this.format('yyyy-MM-dd');
  }

  clone() {
    return new LocalDate(this.year, this.month, this.day);
  }
}
class LocalTime {
  constructor(hour, minute, second) {
    this.hour = hour;
    this.minute = minute;
    this.second = minute;
    this.check();
  }

  check() {
    let now = new Date();
    this.hour = typeValue(this.hour, 'Number', now.getHours());
    this.minute = typeValue(this.minute, 'Number', now.getMinutes());
    this.second = typeValue(this.second, 'Number', now.getSeconds());
    if (this.hour < 0) {
      this.hour = 0;
    } else if (this.hour > 23) {
      this.hour = 23;
    }
    if (this.minute < 0) {
      this.minute = 0;
    } else if (this.minute > 59) {
      this.minute = 59;
    }
    if (this.second < 0) {
      this.second = 0
    } else if (this.second > 59) {
      this.second = 59;
    }
    return this;
  }

  getHour() {
    return this.hour;
  }

  getMinute() {
    return this.minute;
  }

  getSecond() {
    return this.second;
  }

  withHour(hour) {
    this.hour = hour;
    this.check();
    return this;
  }

  withMinute(minute) {
    this.minute = minute;
    this.check();
    return this;
  }

  withSecond(second) {
    this.second = second;
    this.check();
    return this;
  }

  plusHours(n, uncheck) {
    if (n > 0) {
      if (this.hour === 23) {
        this.hour = 0;
      } else {
        this.hour++;
      }
    }
    if (!uncheck) this.check();
    return this;
  }

  minusHours(n, uncheck) {
    if (n > 0) {
      if (this.hour === 0) {
        this.hour = 23;
      } else {
        this.hour--;
      }
    }
    if (!uncheck) this.check();
    return this;
  }

  plusMinutes(n, uncheck) {
    if (n > 0) {
      if (this.minute === 59) {
        this.plusHours(1, true);
        this.minute = 0;
      } else {
        this.minute++;
      }
    }
    if (!uncheck) this.check();
    return this;
  }

  minusMinutes(n, uncheck) {
    if (n > 0) {
      if (this.minute === 0) {
        this.minusHours(1, true);
        this.minute = 59;
      } else {
        this.minute--;
      }
    }
    if (!uncheck) this.check();
    return this;
  }

  plusSeconds(n) {
    if (n > 0) {
      if (this.second === 59) {
        this.plusMinutes(1, true);
        this.second = 0;
      } else {
        this.second++;
      }
    }
    this.check();
    return this;
  }

  minusSeconds(n) {
    if (n > 0) {
      if (this.second === 0) {
        this.minusMinutes(1, true);
        this.second = 59;
      } else {
        this.second--;
      }
    }
    this.check();
    return this;
  }

  toDate() {
    let now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDay(), this.hour, this.minute, this.second);
  }

  format(fmt) {
    return this.toDate().format(fmt);
  }

  toString() {
    return this.format('hh:mm:ss');
  }

  clone() {
    return new LocalTime(this.hour, this.minute, this.second);
  }
}


function openActionLink(link, page_id) {
  console.log('openActionLink', link);
  if (type(page_id, 'Number')) {
    clickSum(page_id);
  }
  if (!link) return;
  if (/^xcx:.+$/.test(link)) {
    wx.navigateTo({
      url: link.substring('xcx:'.length),
    })
  } else if (/^xiangshui:.+$/.test(link)) {
    wx.navigateTo({
      url: link.substring('xiangshui:'.length),
    })
  } else if (/^https:.+$/.test(link)) {
    wx.navigateTo({
      url: `/pages/activity/activity?web_view_url=${link}`
    })
  }
}

function bindOpenActionLink(event) {
  openActionLink(event.currentTarget.dataset.link, event.currentTarget.dataset.pageid);
  return false;
}

function makePhoneCall(phone) {
  wx.makePhoneCall({
    phoneNumber: phone
  })
}

function bindMakePhoneCall(event) {
  wx.makePhoneCall({
    phoneNumber: event.currentTarget.dataset.phone
  });
  return false;
}

function checkPhone(phone) {
  return phone && /^1\d{10}$/.test(phone);
}
const Message = {
  msg: function (text, ms = 2000) {
    wx.showToast({
      title: text,
      icon: 'none',
      duration: ms,
    });
  },
  error: function (text, ms = 3000) {
    this.msg(text, ms);
  },
};

function bindInputValue(event) {
  console.log(event);
  let data = {};
  data[event.currentTarget.dataset.field] = event.detail.value;
  this.setData(data);
}

function goHome() {
  wx.reLaunch({
    url: '/pages/scanCode/scanCode'
  })
}

function goBack(delta = 1) {
  wx.navigateBack({
    delta
  })
}


function bindSetValue(event) {
  console.log(event);
  let data = {};
  if (event.currentTarget.dataset.object) {
    data.object = this.data[object] || {};
    data.object[event.currentTarget.dataset.field] = event.currentTarget.dataset.value;
  } else {
    data[event.currentTarget.dataset.field] = event.currentTarget.dataset.value;
  }
  this.setData(data);
}


function clickSum(page_id) {
  try {
    request({
      url: `/api/statistics/click_sum`,
      method: 'post',
      data: {
        page_id
      }
    });
  } catch (e) {
    console.error(e.message);
  }
}

module.exports = {
  UUID,
  type,
  typeValue,
  ListOptions,
  MapOptions,
  queryString,
  LocalDate,
  LocalTime,
  Message,
  checkPhone,
  makePhoneCall,
  openActionLink,
  goHome,
  goBack,
  clickSum,
  mixins: {
    bindMakePhoneCall,
    bindOpenActionLink,
    bindInputValue,
    bindSetValue,
    goHome,
    goBack,
  },
}