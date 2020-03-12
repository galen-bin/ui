// Packages/Action/Push/index.js
var util = require('../../../../utils/util.js');
var formatLocation = util.formatLocation
const app = getApp();
Page({
  data: {
    imageList: [],
    count: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    hasLocation: false,
    actionSheetItems: [
      { bindtap: 'Menu1', txt: '预览' },
      { bindtap: 'Menu2', txt: '编辑' },
      { bindtap: 'Menu3', txt: '删除' }
    ],
    chose_index: null,
    actionSheetHidden: true,
    text: null,//内容
    locationAddress: "",//位置地址
    progress_show: true,//是否显示进度
    progress: 0,//进度
    work_number: 0,//已上传图片数量
    is_upsh: false,
  },
  onLoad: function (e) {
    console.log(wx.getStorageSync("chose_class"));
  },

  //选择图片
  chooseImage: function () {
    var that = this
    let img_list = that.data.imageList;
    if (img_list.length == 9) {
      wx.showToast({
        title: '最多上传9张图片',
        icon: 'none',
        duration: 1500
      });
      return;
    }
    wx.chooseImage({
      sizeType: ['original'],
      sourceType: ['album', 'camera'],
      count: 9 - that.data.imageList.length,
      success: function (res) {

        let img_list = that.data.imageList;
        for (var j = 0; j < res.tempFilePaths.length; j++) {
          wx.getImageInfo({
            src: res.tempFiles[j].path,
            success(result) {
              console.log(result);
              if (result.type.match(/bmp|jpeg|jpg|gif|png|tif|pcx|tga|exif|svg|webp|JPEG|psd/)) {
                img_list.push(result.path);
                that.setData({
                  imageList: img_list
                });
              }
              else {
                wx.showToast({
                  title: '不支持' + result.type + '图片格式',
                  icon: 'none',
                  duration: 1500
                });
              }


            }
          });

        }
      }
    });
  },
  //编辑图片
  bindMenu2: function () {
    let that = this;
    wx.chooseImage({
      sizeType: ['original'],
      sourceType: ['album', 'camera'],
      count: 1,
      success: function (res) {
        let img_list = that.data.imageList;
        img_list[that.data.chose_index] = res.tempFiles[0].path;
        that.setData({
          imageList: img_list,
          actionSheetHidden: true,
        });

      }
    });
  },
  //预览图片
  bindMenu1: function (e) {
    console.log(e);
    let that = this;
    let img_list = that.data.imageList;
    let _index = that.data.chose_index;
    if (_index == null) {
      wx.showToast({
        title: '选取失败',
        icon: 'none',
        duration: 1500
      });

      that.setData({
        actionSheetHidden: true,
      });

      return;
    }
    wx.previewImage({
      current: img_list[_index],
      urls: img_list
    });
  },
  //删除图片
  bindMenu3: function () {
    let that = this;
    let img_list = that.data.imageList;
    img_list.splice(that.data.chose_index, 1);
    that.setData({
      imageList: img_list,
      actionSheetHidden: true,
    });
  },
  actionSheetbindchange: function (e) {
    this.setData({
      actionSheetHidden: true,
    });
  },
  //选择图片
  tapimg: function (e) {

    this.setData({
      actionSheetHidden: false,
      chose_index: e.target.dataset.index
    });
  },
  //位置
  chooseLocation: function () {
    wx.showLoading({
      title: '定位中',
      duration: 30000
    });
    var that = this
    wx.chooseLocation({
      success: function (res) {
        wx.hideLoading();
        console.log(res)
        that.setData({
          hasLocation: true,
          location: formatLocation(res.longitude, res.latitude),
          locationAddress: res.address
        })
      },
      fail: function (e) {
        console.log(e);
        wx.hideLoading();
        if (e.errMsg.match("cancel")) {
          wx.showToast({
            title: '取消定位',
            icon: 'none',
            duration: 1500
          });
          return
        }
        wx.showToast({
          title: '定位失败',
          icon: 'none',
          duration: 1500
        });
      }
    });
  },
  clear: function () {
    this.setData({
      hasLocation: false
    })
  },
  //表单提交
  formSubmit: function (e) {
    let that = this;
    let progress = that.data.progress;
    if (progress > 0) {
      wx.showToast({
        title: '内容正在发布中',
        icon: 'none',
        duration: 1500
      });
      return;
    }

    let location = "";
    //是否获取定位 
    if (that.data.hasLocation) {
      location = JSON.stringify(that.data.location);
    }
    var formid = e.detail.formId;
    let text = e.detail.value.textarea;
    //获取formid
    if (formid.indexOf('formId') == -1) {
      app.FormIdRecord({ Openid: wx.getStorageSync('openid'), Userid: wx.getStorageSync('userinfo').Id, Form_id: formid });
    }

    if (text == "" & that.data.imageList.length == 0) {
      wx.showToast({
        title: '请填写内容或上传图片',
        icon: 'none',
        duration: 1500
      });
      return;
    }
    let send_data = {
      GradeId: wx.getStorageSync("chose_class").Id,
      UserId: wx.getStorageSync("userinfo").Id,
      Text: text,
      Address: that.data.locationAddress,
      Location: location
    };

    wx.showLoading({
      title: '加载中',
      duration: 30000
    });
    wx.request({
      url: app.host ,
      data: send_data,
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        wx.hideLoading();
        console.log(res);
        if (res.statusCode != 200) {
          wx.showToast({
            title: '网络请求错误，请检查网络',
            icon: 'none',
            duration: 3500
          });
          return;
        }


        if (res.data.code != 1) {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 3500
          });
          return;
        }

        if (that.data.imageList.length > 0) {
          //上传图片
          wx.showLoading({
            title: '图片上传中',
          });
          that.setData({
            progress_show: false
          });

          //循环上传图片
          let img_list = that.data.imageList;
          for (var j = 0; j < img_list.length; j++) {
            that.image_up_list(res.data.data.id, img_list[j]);
          }

          return;

        }
        else {
          wx.showToast({
            title: '发布成功',
            icon: 'success',
            duration: 3500
          });
          var pages = getCurrentPages();
          if (pages.length > 1) {
            //上一个页面实例对象
            var prePage = pages[pages.length - 2];//is_load
            prePage.setData({
              is_load: true,
              bootom_style: true
            }, function () {
              wx.navigateBack()
            });
          }


        }
      },
      fail: function (e) {
        wx.hideLoading();
        wx.showToast({
          title: '网络请求错误，请检查网络',
          icon: 'none',
          duration: 3500
        });
      }
    });
  },
  //图片上传操作
  image_up_list: function (id, path) {
    var that = this;
    that.setData({
      is_upload: false
    });

    wx.uploadFile({
      url: app.host ,
      filePath: path,
      name: 'file',
      method: 'post',
      formData: {
        id: id,
        KinId: wx.getStorageSync("chose_class").KinId
      },
      success(result) {


        if (result.statusCode != 200) {
          wx.showToast({
            title: '网络请求错误，请检查网络',
            icon: 'none',
            duration: 3500
          });
          return;
        }
        result = JSON.parse(result.data);

        console.log(result);
        //账号已绑定
        if (result.code == 1) {

          let count = that.data.work_number;
          count = parseInt(count) + 1;
          let progress = (count / that.data.imageList.length).toFixed(2);
          console.log(count);
          console.log(progress);
          that.setData({
            work_number: count,
            progress: progress * 100
          });
          console.log(that.data.imageList);

          if (count == that.data.imageList.length & progress == 1) {
            console.log("计量");
            console.log(that.data.imageList.length);
            console.log(count);
            console.log(progress);
            var pages = getCurrentPages();
            if (pages.length > 1) {
              //上一个页面实例对象
              var prePage = pages[pages.length - 2];//is_load
              prePage.setData({
                is_load: true,
                bootom_style: true
              }, function () {
                wx.navigateBack()
              });
            }


          }

        }
        else {
          wx.showToast({
            title: result.msg,
            icon: 'none',
            duration: 3500
          });
        }


      },
      fail(res) {
        wx.hideLoading();

        wx.showToast({
          title: "图片上传失败",
          icon: 'none',
          duration: 3500
        });
      },
      complete() {
        wx.hideLoading();
      }
    });

  }

})