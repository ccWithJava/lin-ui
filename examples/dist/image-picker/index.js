import validator from '../behaviors/validator';

Component({
  /**
   * 组件的属性列表
   */
  externalClasses: ['l-class', 'l-item-class'],
  behaviors: ['wx://form-field', validator],
  properties: {
    urls: {
      type: Array,
      value: []
    },
    // 最多可以选择的图片张数
    count: {
      type: [String, Number],
      value: 9
    },
    // 清除urls
    clear: {
      type: Boolean,
      value: false,
      observer: function (newVal) {
        if (newVal) {
          this.handleClear();
        }
      }
    },
    // 每行可显示的个数
    size: {
      type: [String, Number],
      value: 3,
      options: [3, 4, '3', '4']
    },
    // 所选的图片的尺寸 ['original', 'compressed']
    sizeType: {
      type: String,
      value: 'original',
      options: ['original', 'compressed']
    },
    // 图片裁剪、缩放的模式
    mode: {
      type: String,
      value: 'aspectFit', // 参考微信小程序 image 组件的mode属性列表
      options: ['scaleToFill', 'aspectFit', 'aspectFill', 'widthFix', 'top', 'bottom', 'center', 'left', 'right', 'top left', 'top right', 'bottom left', 'bottom right']
    },
    // 设置是否传入slot
    custom: {
      type: Boolean,
      value: false
    },
    // 是否可以预览
    preview: {
      type: Boolean,
      value: true
    },
    // 所选图片最大限制，单位字节
    maxImageSize: {
      type: Number,
      value: 10000000,
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    showBtn: true,
    tempFilePath: '',
  },

  lifetimes: {
    attached: function () {
      // 在组件实例进入页面节点树时执行
      const newOrOld = this.judgeNewOrOld();
      this.setData({
        newOrOld
      });
      if (newOrOld == 'old') {
        console.warn('image-picker组件已经升级，建议使用最新版本，当前用法会在后续版本中暂停支持');
      }
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleClear() {
      let urls = this.data.urls;
      this.setData({
        urls: [],
        clear: false,
        showBtn: true
      });
      let info = {
        all: urls,
        current: urls,
      };

      let option = {};
      this.triggerEvent('linclear', info, option);
    },

    // 预览 preview
    onPreviewTap(e) {
      const index = e.currentTarget.dataset.index;
      const urls = this.data.urls;
      let tempFilePath = '';
      let previewImageList = [];
      const newOrOld = this.data.newOrOld;

      if (newOrOld == 'old') {
        tempFilePath = this.data.urls[index];
        previewImageList = this.data.urls;

      } else {
        tempFilePath = this.data.urls[index].url;
        for (let i = 0; i < urls.length; i++) {
          previewImageList.push(urls[i].url);
        }
      }


      let detail = {
        index, // 下标
        current: urls[index], // 当前显示图片的http链接
        all: urls // 需要预览的图片http链接列表
      };
      let option = {};
      if (this.data.preview === true) {
        wx.previewImage({
          current: tempFilePath, // 当前显示图片的http链接
          urls: previewImageList // 需要预览的图片http链接列表
        });
      }
      this.triggerEvent('linpreview', detail, option);
    },


    // 增加 add
    onAddTap() {
      const that = this;
      const count = this.data.count - this.data.urls.length;
      if (count === 0) {
        return;
      }
      const newOrOld = this.data.newOrOld;
      wx.chooseImage({
        count,
        sizeType: this.data.sizeType,
        sourceType: ['album', 'camera'],
        success(res) {
          // tempFilePath可以作为img标签的src属性显示图片
          let tempFilePath = [];
          if (newOrOld == 'old') {
            tempFilePath = res.tempFilePaths;
          } else {
            for (let i = 0; i < res.tempFilePaths.length; i++) {
              tempFilePath.push({
                url: res.tempFilePaths[i],
                // key: null
                imageSize: res.tempFiles[i].size
              });
              if (res.tempFiles[i].size > that.data.maxImageSize) {
                tempFilePath[i].overSize = true;
              } else {
                tempFilePath[i].overSize = false;
              }
            }
          }
          const newtempFilePaths = that.data.urls.concat(tempFilePath);
          // 判断是否还能继续添加图片
          if (newtempFilePaths.length === parseInt(that.data.count)) {
            that.setData({
              showBtn: false
            });
          }
          that.setData({
            urls: newtempFilePaths,
            value: newtempFilePaths,
            tempFilePath
          });
          let detail = {
            current: tempFilePath,
            all: newtempFilePaths
          };
          let option = {};

          that.triggerEvent('linchange', detail, option);
          that.triggerEvent('linpush', detail, option);

          // 超过大小的image集合
          let overSizeList = [];
          for (let n = 0; n < newtempFilePaths.length; n++) {
            if (newtempFilePaths[n].overSize) {
              overSizeList.push(newtempFilePaths[n]);
            }
          }

          if (overSizeList.length > 0) {
            let detail = {
              current: tempFilePath,
              all: newtempFilePaths,
              overSizeList: overSizeList,
            };
            that.triggerEvent('linoversize', detail, option);
          }
        }
      });

    },

    // 删除 remove
    onDelTap(e) {
      const index = e.currentTarget.dataset.index;
      const urls = this.data.urls;
      const tempFilePath = urls[index];
      const tempFilePaths = this.handleSplice(urls, tempFilePath);
      // 判断是否还能继续添加图片
      if (tempFilePaths.length < parseInt(this.data.count)) {
        this.setData({
          showBtn: true
        });
      }
      this.setData({
        tempFilePath,
        urls: tempFilePaths,
        value: tempFilePaths,
      });
      let detail = {
        index,
        current: tempFilePath,
        all: tempFilePaths
      };
      let option = {};

      this.triggerEvent('linremove', detail, option);

    },
    handleSplice(arr, current) {
      const newArr = arr.filter(item => item !== current);
      return newArr;
    },

    judgeNewOrOld: function () {
      const urls = this.data.urls;
      if (urls.length != 0) {
        if (typeof (urls[0]) != 'object') {
          return 'old';
        }
        return 'new';
      }
      return 'new';
    }

  },
});
