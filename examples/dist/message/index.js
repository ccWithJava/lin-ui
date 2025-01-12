import zIndex from '../behaviors/zIndex';
import watchShow from '../behaviors/watchShow';
import validator from '../behaviors/validator';

Component({
  behaviors: [zIndex, watchShow, validator],
  externalClasses: ['l-class', 'l-image-class'],
  properties: {
    show: Boolean,
    icon: String,
    iconColor: {
      type: String,
      value: '#fff'
    },
    iconSize: {
      type: String,
      value: '28'
    },
    image: String,
    content: String,
    type: {
      type: String,
      value: 'primary',
      options: ['primary', 'warning', 'success', 'error']
    },
    duration: {
      type: Number,
      value: 1500
    },
    openApi: {
      type: Boolean,
      value: true
    }
  },

  data: {
    status: false
  },

  // 解决 addListener undefined 的错误
  observers: {
    'icon': function () { }
  },

  attached() {
    this.initMessage();
  },

  pageLifetimes: {
    show() {
      this.initMessage();
    },
  },

  methods: {
    initMessage() {
      wx.lin = wx.lin || {};
      wx.lin.showMessage = (options = {}) => {
        const {
          content = '',
          icon = '',
          image = '',
          type = 'primary',
          duration = 1500,
          success = null
        } = options;
        this.data.success = success;
        this.setData({
          content,
          icon,
          image,
          duration,
          type
        });
        this.changeStatus();
        return this;
      };
      wx.lin.hideMessage = () => {
        this.setData({
          status: false
        });
      };
    }
  }
});