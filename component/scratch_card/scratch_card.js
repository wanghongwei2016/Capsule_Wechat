// component/scratch_card/scratch_card.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    width: Number,
    height: Number,
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

    init: function (page) {
      const ctx = wx.createCanvasContext('myCanvas', this)
      console.log(this);
      console.log(ctx);
      ctx.setFillStyle('red')
      ctx.fillRect(10, 10, 150, 75)
      ctx.draw()
    }

  },
  created: function () {
   
  },
})
