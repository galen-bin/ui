// pages/CircleFriends/CircleFriends.js
var app = getApp()
var that

Page({
  /**
   * 页面的初始数据
   */
  data: {
    DataSource: [1],
    push_hidden: false,//发布按钮是否隐藏
    photoWidth: wx.getSystemInfoSync().windowWidth / 4,
    popTop: 0, //弹出点赞评论框的位置
    popWidth: 0, //弹出框宽度
    isShow: false, //控制emoji表情是否显示
    replay_box: true,//评论框是否显示
    is_load: true,//是否加载
    page: 1,//页码
    bootom_style: true,//分页加载完毕 
    msg_list: [],//列表
    host: app.host,//主机地址
    userinfo: wx.getStorageSync('userinfo'),//用户信息
    zan_index: null,//评论点赞索引
    isLoad: true,//解决初试加载时emoji动画执行一次
    content: "",//评论框的内容
    isLoading: true,//是否显示加载数据提示
    disabled: true,
    cfBg: false,
    DiscussShow: true,//是否显示评论
    _index: 0,
    placeholder: '我要评论',
    emojiChar: "🙂-😋-😌-😍-😏-😜-😝-😞-😔-😪-😭-😁-😂-😃-😅-😆-👿-😒-😓-😔-😏-😖-😘-😚-😒-😡-😢-😣-😤-😢-😨-😳-😵-😷-😸-😻-😼-😽-😾-😿-🙊-🙋-🙏-✈-🚇-🚃-🚌-🍄-🍅-🍆-🍇-🍈-🍉-🍑-🍒-🍓-🐔-🐶-🐷-👦-👧-👱-👩-👰-👨-👲-👳-💃-💄-💅-💆-💇-🌹-💑-💓-💘-🚲",
    //0x1f---
    emoji: [
      "60a", "60b", "60c", "60d", "60f",
      "61b", "61d", "61e", "61f",
      "62a", "62c", "62e",
      "602", "603", "605", "606", "608",
      "612", "613", "614", "615", "616", "618", "619", "620", "621", "623", "624", "625", "627", "629", "633", "635", "637",
      "63a", "63b", "63c", "63d", "63e", "63f",
      "64a", "64b", "64f", "681",
      "68a", "68b", "68c",
      "344", "345", "346", "347", "348", "349", "351", "352", "353",
      "414", "415", "416",
      "466", "467", "468", "469", "470", "471", "472", "473",
      "483", "484", "485", "486", "487", "490", "491", "493", "498", "6b4"
    ],
    emojis: [],//qq、微信原始表情
    alipayEmoji: [],//支付宝表情
    actionSheetItems: [
      { bindtap: 'Menu1', txt: '回复', id: '', index: '', parent_index: '' },
      { bindtap: 'Menu2', txt: '删除', id: '', index: '', parent_index: '' }
    ],
    actionSheetHidden: true,
    ReplayType: 0,//回复类型0评论1回复评论
    ReplayUser: null//被回复人信息
  },
  //上拉刷新
  onPullDownRefresh: function () {

    wx.showNavigationBarLoading();//在当前页面显示导航条加载动画。

    this.ActionList(1);//重新加载产品信息

    wx.hideNavigationBarLoading();//隐藏导航条加载动画。

    wx.stopPullDownRefresh();//停止当前页面下拉刷新。

  },
  // 页面触底时执行
  onReachBottom: function () {
    let that = this;
    if (!that.data.is_load) {
      that.setData({
        bootom_style: false
      });
      return;
    }
    let page = that.data.page + 1;
    that.setData({
      page: page
    });
    this.ActionList(page);//重新加载产品信息
    console.log(page);

  },
  //页面滚动监听
  onPageScroll: function (e) {

    let that = this;
    let list = that.data.msg_list;
    let zan_index = that.data.zan_index;

    if (zan_index != null) {
      if (list[zan_index].zan == false) {
        list[zan_index].zan = true;
        that.setData({
          msg_list: list,
        });
      }
    }
    if (that.data.replay_box == false) {
      that.setData({
        //   isShow: false,
        replay_box: true,
      });
    }



  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    //that.ActionList(that.data.page);
    console.log(wx.getStorageSync('userinfo'));
    if (wx.getStorageSync('userinfo').UserType == 2) {
      that.setData({
        push_hidden: false
      });
    }

    let emj = [];
    var em = {}, emChar = that.data.emojiChar.split("-");
    that.data.emoji.forEach(function (v, i) {
      em = {
        char: emChar[i],
        emoji: "0x1f" + v
      };
      emj.push(em)
    });

    that.setData({
      emojis: emj
    });


    wx.showLoading({
      title: '加载中',
    });
    that.GetConfig();
  },
  onReady: function () {

    console.log(this.data.msg_list);

  },
  //页面显示
  onShow: function () {
    wx.hideLoading();


    console.log('show');
    wx.showLoading({
      title: '加载中',
    });

    let that = this;
    that.setData({
      is_load: true,
      page: 1,
      userinfo: wx.getStorageSync('userinfo')
    });
    that.ActionList(1);

  },
  //跳转发布页面
  push: function () {
    wx.navigateTo({
      url: '../push/index'
    });
  },
  //班级动态列表
  ActionList: function (page) {
    let that = this;
    wx.hideLoading();
    
    var datas = [{ "Id": "10109", "GradeId": "445", "UserId": "38111", "Content": "😄 😜 😌 😍 😜 😜 ", "Image": [""], "Address": "", "Location": "", "CreateDate": "2019-10-16 11:45:09", "Ansy": "0", "HeaderImage": "https://wx.qlogo.cn/mmopen/vi_32/vbIHSetkNdwwV5cOea8ZuWf8Vzzrzz0XakUIh28cTdx1Yx98gABlOeibqDAngUp48LaD3ia55TmUlWJ8f6yZSYLQ/132", "UserNamer": "老师1", "ROW_NUMBER": "1", "Praise": [{ "id": "1018", "ActionId": "10109", "UserId": "38112", "CreateDate": "2019-10-16 14:58:49", "uid": "38112", "UserNamer": "李明彰家长", "ROW_NUMBER": "1" }], "Comment": [] }, { "Id": "10105", "GradeId": "445", "UserId": "38111", "Content": "", "Image": ["", "../images/z.jpg", "../images/z.jpg", "../images/z.jpg", "../images/z.jpg", "../images/z.jpg", "../images/z.jpg", "../images/z.jpg", "../images/z.jpg", "../images/z.jpg"], "Address": "", "Location": "", "CreateDate": "2019-10-14 14:13:41", "Ansy": "1", "HeaderImage": "https://wx.qlogo.cn/mmopen/vi_32/vbIHSetkNdwwV5cOea8ZuWf8Vzzrzz0XakUIh28cTdx1Yx98gABlOeibqDAngUp48LaD3ia55TmUlWJ8f6yZSYLQ/132", "UserNamer": "老师1", "ROW_NUMBER": "2", "Praise": [], "Comment": [] }, { "Id": "10103", "GradeId": "445", "UserId": "38111", "Content": "1234", "Image": ["", "../images/z.jpg", "../images/z.jpg"], "Address": "盛大天地源创谷(盛荣路88弄1～16号)", "Location": "{\"longitude\":[\"121\",\"60\"],\"latitude\":[\"31\",\"17\"]}", "CreateDate": "2019-10-10 15:50:04", "Ansy": "1", "HeaderImage": "https://wx.qlogo.cn/mmopen/vi_32/vbIHSetkNdwwV5cOea8ZuWf8Vzzrzz0XakUIh28cTdx1Yx98gABlOeibqDAngUp48LaD3ia55TmUlWJ8f6yZSYLQ/132", "UserNamer": "老师1", "ROW_NUMBER": "3", "Praise": [], "Comment": [] }, { "Id": "10102", "GradeId": "445", "UserId": "38111", "Content": "", "Image": ["", "../images/z.jpg"], "Address": "", "Location": "", "CreateDate": "2019-10-10 14:32:11", "Ansy": "1", "HeaderImage": "https://wx.qlogo.cn/mmopen/vi_32/vbIHSetkNdwwV5cOea8ZuWf8Vzzrzz0XakUIh28cTdx1Yx98gABlOeibqDAngUp48LaD3ia55TmUlWJ8f6yZSYLQ/132", "UserNamer": "老师1", "ROW_NUMBER": "4", "Praise": [], "Comment": [] }, { "Id": "10101", "GradeId": "445", "UserId": "38111", "Content": "", "Image": ["", "../images/z.jpg"], "Address": "", "Location": "", "CreateDate": "2019-10-10 14:31:46", "Ansy": "1", "HeaderImage": "https://wx.qlogo.cn/mmopen/vi_32/vbIHSetkNdwwV5cOea8ZuWf8Vzzrzz0XakUIh28cTdx1Yx98gABlOeibqDAngUp48LaD3ia55TmUlWJ8f6yZSYLQ/132", "UserNamer": "老师1", "ROW_NUMBER": "5", "Praise": [], "Comment": [] }, { "Id": "10100", "GradeId": "445", "UserId": "38111", "Content": "", "Image": ["", "../images/z.jpg"], "Address": "", "Location": "", "CreateDate": "2019-10-10 14:26:31", "Ansy": "1", "HeaderImage": "https://wx.qlogo.cn/mmopen/vi_32/vbIHSetkNdwwV5cOea8ZuWf8Vzzrzz0XakUIh28cTdx1Yx98gABlOeibqDAngUp48LaD3ia55TmUlWJ8f6yZSYLQ/132", "UserNamer": "老师1", "ROW_NUMBER": "6", "Praise": [], "Comment": [] }, { "Id": "10099", "GradeId": "445", "UserId": "38111", "Content": "", "Image": ["", "../images/z.jpg"], "Address": "", "Location": "", "CreateDate": "2019-10-10 14:23:52", "Ansy": "1", "HeaderImage": "https://wx.qlogo.cn/mmopen/vi_32/vbIHSetkNdwwV5cOea8ZuWf8Vzzrzz0XakUIh28cTdx1Yx98gABlOeibqDAngUp48LaD3ia55TmUlWJ8f6yZSYLQ/132", "UserNamer": "老师1", "ROW_NUMBER": "7", "Praise": [], "Comment": [] }, { "Id": "10098", "GradeId": "445", "UserId": "38111", "Content": "111", "Image": ["", "../images/z.jpg", "../images/z.jpg"], "Address": "上海市浦东新区世纪大道世纪公园正门(近杨高路)", "Location": "{\"longitude\":[\"121\",\"54\"],\"latitude\":[\"31\",\"22\"]}", "CreateDate": "2019-10-10 14:23:31", "Ansy": "1", "HeaderImage": "https://wx.qlogo.cn/mmopen/vi_32/vbIHSetkNdwwV5cOea8ZuWf8Vzzrzz0XakUIh28cTdx1Yx98gABlOeibqDAngUp48LaD3ia55TmUlWJ8f6yZSYLQ/132", "UserNamer": "老师1", "ROW_NUMBER": "8", "Praise": [{ "id": "1019", "ActionId": "10098", "UserId": "38111", "CreateDate": "2019-11-22 16:21:42", "uid": "38111", "UserNamer": "老师1", "ROW_NUMBER": "1" }], "Comment": [] }, { "Id": "10096", "GradeId": "445", "UserId": "38111", "Content": "", "Image": ["", "../images/z.jpg"], "Address": "", "Location": "", "CreateDate": "2019-10-09 11:07:06", "Ansy": "1", "HeaderImage": "https://wx.qlogo.cn/mmopen/vi_32/vbIHSetkNdwwV5cOea8ZuWf8Vzzrzz0XakUIh28cTdx1Yx98gABlOeibqDAngUp48LaD3ia55TmUlWJ8f6yZSYLQ/132", "UserNamer": "老师1", "ROW_NUMBER": "9", "Praise": [], "Comment": [] }, { "Id": "10092", "GradeId": "445", "UserId": "38111", "Content": "123", "Image": ["", "../images/z.jpg"], "Address": "", "Location": "", "CreateDate": "2019-10-09 10:50:22", "Ansy": "1", "HeaderImage": "https://wx.qlogo.cn/mmopen/vi_32/vbIHSetkNdwwV5cOea8ZuWf8Vzzrzz0XakUIh28cTdx1Yx98gABlOeibqDAngUp48LaD3ia55TmUlWJ8f6yZSYLQ/132", "UserNamer": "老师1", "ROW_NUMBER": "10", "Praise": [], "Comment": [] },   { "Id": "74", "GradeId": "445", "UserId": "38111", "Content": "wwww", "Image": [""], "Address": "", "Location": "", "CreateDate": "2019-09-25 11:09:53", "Ansy": null, "HeaderImage": "https://wx.qlogo.cn/mmopen/vi_32/vbIHSetkNdwwV5cOea8ZuWf8Vzzrzz0XakUIh28cTdx1Yx98gABlOeibqDAngUp48LaD3ia55TmUlWJ8f6yZSYLQ/132", "UserNamer": "老师1", "ROW_NUMBER": "14", "Praise": [{ "id": "12", "ActionId": "74", "UserId": "38111", "CreateDate": "2019-09-25 18:52:17", "uid": "38111", "UserNamer": "老师1", "ROW_NUMBER": "1" }], "Comment": [] }, { "Id": "73", "GradeId": "445", "UserId": "38111", "Content": "wwww", "Image": [""], "Address": "", "Location": "", "CreateDate": "2019-09-25 11:08:11", "Ansy": null, "HeaderImage": "https://wx.qlogo.cn/mmopen/vi_32/vbIHSetkNdwwV5cOea8ZuWf8Vzzrzz0XakUIh28cTdx1Yx98gABlOeibqDAngUp48LaD3ia55TmUlWJ8f6yZSYLQ/132", "UserNamer": "老师1", "ROW_NUMBER": "15", "Praise": [{ "id": "9", "ActionId": "73", "UserId": "38112", "CreateDate": "2019-09-25 17:45:28", "uid": "38112", "UserNamer": "李明彰家长", "ROW_NUMBER": "1" }], "Comment": [] }, { "Id": "72", "GradeId": "445", "UserId": "38111", "Content": "wwww", "Image": [""], "Address": "", "Location": "", "CreateDate": "2019-09-25 11:07:05", "Ansy": null, "HeaderImage": "https://wx.qlogo.cn/mmopen/vi_32/vbIHSetkNdwwV5cOea8ZuWf8Vzzrzz0XakUIh28cTdx1Yx98gABlOeibqDAngUp48LaD3ia55TmUlWJ8f6yZSYLQ/132", "UserNamer": "老师1", "ROW_NUMBER": "16", "Praise": [{ "id": "13", "ActionId": "72", "UserId": "38111", "CreateDate": "2019-09-25 18:52:32", "uid": "38111", "UserNamer": "老师1", "ROW_NUMBER": "1" }], "Comment": [] }, { "Id": "71", "GradeId": "445", "UserId": "38111", "Content": "wwww", "Image": [""], "Address": "", "Location": "", "CreateDate": "2019-09-25 11:06:13", "Ansy": null, "HeaderImage": "https://wx.qlogo.cn/mmopen/vi_32/vbIHSetkNdwwV5cOea8ZuWf8Vzzrzz0XakUIh28cTdx1Yx98gABlOeibqDAngUp48LaD3ia55TmUlWJ8f6yZSYLQ/132", "UserNamer": "老师1", "ROW_NUMBER": "17", "Praise": [{ "id": "11", "ActionId": "71", "UserId": "38111", "CreateDate": "2019-09-25 17:48:32", "uid": "38111", "UserNamer": "老师1", "ROW_NUMBER": "1" }], "Comment": [] }, { "Id": "70", "GradeId": "445", "UserId": "38111", "Content": "wwww", "Image": [""], "Address": "", "Location": "", "CreateDate": "2019-09-25 11:04:17", "Ansy": null, "HeaderImage": "https://wx.qlogo.cn/mmopen/vi_32/vbIHSetkNdwwV5cOea8ZuWf8Vzzrzz0XakUIh28cTdx1Yx98gABlOeibqDAngUp48LaD3ia55TmUlWJ8f6yZSYLQ/132", "UserNamer": "老师1", "ROW_NUMBER": "18", "Praise": [], "Comment": [] }, { "Id": "69", "GradeId": "445", "UserId": "38111", "Content": "wwww", "Image": [""], "Address": "", "Location": "", "CreateDate": "2019-09-25 11:02:56", "Ansy": null, "HeaderImage": "https://wx.qlogo.cn/mmopen/vi_32/vbIHSetkNdwwV5cOea8ZuWf8Vzzrzz0XakUIh28cTdx1Yx98gABlOeibqDAngUp48LaD3ia55TmUlWJ8f6yZSYLQ/132", "UserNamer": "老师1", "ROW_NUMBER": "19", "Praise": [{ "id": "14", "ActionId": "69", "UserId": "38111", "CreateDate": "2019-09-26 09:00:46", "uid": "38111", "UserNamer": "老师1", "ROW_NUMBER": "1" }], "Comment": [] }, { "Id": "68", "GradeId": "445", "UserId": "38111", "Content": "qwe", "Image": ["", "../images/z.jpg", "../images/z.jpg", "../images/z.jpg", "../images/z.jpg", "../images/z.jpg","../images/z.jpg"],"Address":"","Location":"","CreateDate":"2019-09-25 10:41:05","Ansy":null,"HeaderImage":"https://wx.qlogo.cn/mmopen/vi_32/vbIHSetkNdwwV5cOea8ZuWf8Vzzrzz0XakUIh28cTdx1Yx98gABlOeibqDAngUp48LaD3ia55TmUlWJ8f6yZSYLQ/132","UserNamer":"老师1","ROW_NUMBER":"20","Praise":[],"Comment":[]}];

//这里获取页面请求结果
    let list = that.data.msg_list;
    let res_list = datas;
    //数据小于20
    if (res_list.length < 20) {
      that.setData({
        is_load: false,
        bootom_style: false
      });
      console.log('小于20条');
    }
    //当前没有数据
    if (res_list.length == 0) {
      that.setData({
        is_load: false,
        bootom_style: false
      });
      console.log('当前数据为空');

    }
    //页数大于1
    if (that.data.page > 1) {
      for (var i = 0; i < res_list.length; i++) {
        res_list[i]['zan'] = true;

        //解码评论
        for (var j = 0; j < res_list[i]['Comment'].length; j++) {
          res_list[i]['Comment'][j]['Content'] = decodeURIComponent(res_list[i]['Comment'][j]['Content']);
        }
        list.push(res_list[i]);
      }
      that.setData({
        msg_list: list
      });
      console.log('大于一页');
    }
    else {
      console.log('小于等于一页');
      list = [];
      for (var i = 0; i < res_list.length; i++) {
        res_list[i]['zan'] = true;
        //解码评论
        for (var j = 0; j < res_list[i]['Comment'].length; j++) {
          res_list[i]['Comment'][j]['Content'] = decodeURIComponent(res_list[i]['Comment'][j]['Content']);
        }
        list.push(res_list[i]);
      }
      that.setData({
        msg_list: res_list
      });
    }
    


  },
  //获取服务端配置
  GetConfig: function () {
    let that = this;
    //数据列表
    wx.request({
      url: app.server + "/GetConfig",
      data: {
        system: 'WXXCX',
      },
      method: "GET",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log(res);
        wx.hideLoading();
        if (res.statusCode != 200) {
          wx.showToast({
            title: '网络请求错误，请检查网络',
            icon: 'none',
            duration: 3500
          });
          return;
        }


        //成功
        if (res.data.code == 1) {

          console.log(res.data.data.Comment);
          if (res.data.data.Comment == "False") {
            that.setData({
              DiscussShow: false
            });
          }


          console.log(that.data.DiscussShow);
        }
        else {
          wx.showToast({
            title: '失败' + res.data.msg,
            icon: 'none',
            duration: 3500
          });
        }
      }
    });
  },
  // 点击图片进行大图查看
  LookPhoto: function (e) {
    console.log(e);
    let that = this;
    let _index = e.currentTarget.dataset.index;
    let img_list = that.data.msg_list[_index]['Image'];
    console.log(that.data.msg_list);
    if (img_list[0] == "") {
      img_list.splice(0, 1);
    }


    for (var i = 0; i < img_list.length; i++) {
      if (img_list[i].match(/http/)) {
        continue;
      }
      img_list[i] = app.host + img_list[i];
    }

    wx.previewImage({
      current: e.currentTarget.dataset.photurl,
      urls: img_list,
    })
  },

  // 点击点赞的人删除或回复
  TouchZanUser: function (e) {
    console.log(e);
    let name = e.currentTarget.dataset.name;
    let id = e.currentTarget.dataset.id;
    let uid = e.currentTarget.dataset.uid;
    let index = e.currentTarget.dataset.index;
    let parent_index = e.currentTarget.dataset.parent;

    if (wx.getStorageSync('userinfo').UserType == 2 & wx.getStorageSync('userinfo').Id == uid) {
      this.setData({
        actionSheetHidden: false,
        replay_box: true,
        actionSheetItems: [
          { bindtap: 'Menu2', txt: '删除我的评论', id: id, index: index, parent_index: parent_index, username: name, uid: uid }
        ]
      });
      return;
    }
    if (wx.getStorageSync('userinfo').UserType == 2) {
      this.setData({
        actionSheetHidden: false,
        replay_box: true,
        actionSheetItems: [
          { bindtap: 'Menu1', txt: '回复' + name, id: id, index: index, parent_index: parent_index, username: name, uid: uid },
          { bindtap: 'Menu2', txt: '删除' + name + "的评论", id: id, index: index, parent_index: parent_index, username: name, uid: uid }
        ]
      });
      return;
    }

    if (wx.getStorageSync('userinfo').UserType == 3 & wx.getStorageSync('userinfo').Id == uid) {
      this.setData({
        actionSheetHidden: false,
        replay_box: true,
        actionSheetItems: [
          { bindtap: 'Menu2', txt: '删除我的评论', id: id, index: index, parent_index: parent_index, username: name, uid: uid }
        ]
      });
      return;
    }

    if (wx.getStorageSync('userinfo').UserType == 3) {
      this.setData({
        actionSheetHidden: false,
        replay_box: true,
        actionSheetItems: [
          { bindtap: 'Menu1', txt: '回复' + name, id: id, index: index, parent_index: parent_index, username: name, uid: uid }
        ]
      });
      return;
    }

    /*actionSheetItems: [
      { bindtap: 'Menu1', txt: '回复', id: '', index: '', parent_index: '' },
      { bindtap: 'Menu2', txt: '删除', id: '', index: '', parent_index: '' }
    ]
      this.setData({
        actionSheetHidden: false,
      });*/
  },
  //隐藏选择列表
  actionSheetbindchange: function (e) {
    this.setData({
      actionSheetHidden: true,
    });
  },
  //回复已评论人员
  bindMenu1: function (e) {
    let that = this;
    let id = e.currentTarget.dataset.id;
    let index = e.currentTarget.dataset.index;
    let parent_index = e.currentTarget.dataset.parent_index;
    let name = e.currentTarget.dataset.name;
    let uid = e.currentTarget.dataset.uid;
    that.setData({
      actionSheetHidden: true,
      replay_box: false,
      zan_index: parent_index,
      ReplayType: 1,
      ReplayUser: { name: name, uid: uid },
      placeholder: "回复" + name
    });

  },
  //删除评论信息
  bindMenu2: function (e) {
    let that = this;
    let id = e.currentTarget.dataset.id;
    let index = e.currentTarget.dataset.index;
    let parent_index = e.currentTarget.dataset.parent_index;
    wx.showModal({
      title: '提示',
      content: '确定要删除吗？',
      success: function (sm) {
        if (sm.confirm) {
          wx.showLoading({
            title: '加载中',
          });

          //删除评论
          wx.request({
            url: app.host,
            data: {
              id: id,
              uid: wx.getStorageSync('userinfo').Id,
              usertype: wx.getStorageSync('userinfo').UserType
            },
            method: "POST",
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            success: function (res) {
              that.setData({
                actionSheetHidden: true,
              });
              wx.hideLoading();
              if (res.statusCode != 200) {
                wx.showToast({
                  title: '网络请求错误，请检查网络',
                  icon: 'none',
                  duration: 3500
                });
                return;
              }
              console.log(res);

              //成功
              if (res.data.code == 1) {
                wx.showToast({
                  title: '删除成功',
                });
                let list = that.data.msg_list;
                list[parent_index].Comment.splice(index, 1);
                that.setData({
                  msg_list: list,
                });


              }
              else {

                wx.showToast({
                  title: res.data.msg,
                  icon: 'none',
                  duration: 3500
                });
              }

            },
            fail: function (e) {
              that.setData({
                actionSheetHidden: true,
              });
            }

          });


        }
      }
    });
  },
  // 删除朋友圈
  delete: function (e) {
    let that = this;
    let id = e.target.dataset.id;
    let index = e.target.dataset.index;
    wx.showModal({
      title: '提示',
      content: '确定要删除吗？',
      success: function (sm) {
        if (sm.confirm) {
          wx.showLoading({
            title: '加载中',
          });


          //数据列表
          wx.request({
            url: app.host ,
            data: {
              id: id,
              uid: wx.getStorageSync('userinfo').Id
            },
            method: "POST",
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            success: function (res) {

              wx.hideLoading();
              if (res.statusCode != 200) {
                wx.showToast({
                  title: '网络请求错误，请检查网络',
                  icon: 'none',
                  duration: 3500
                });
                return;
              }
              console.log(res);

              //成功
              if (res.data.code == 1) {

                wx.showToast({
                  title: '删除成功',
                });

                let list = that.data.msg_list;
                list.splice(index, 1);
                that.setData({
                  msg_list: list
                });

                console.log(list);

              }
              else {

                wx.showToast({
                  title: res.data.msg,
                  icon: 'none',
                  duration: 3500
                });
              }

            }

          });


        }

      }
    });



  },
  // 点击了点赞评/论图标
  TouchDiscuss: function (e) {
    let index = e.currentTarget.dataset.index;
    let that = this;
    let list = that.data.msg_list;
    let zan_index = that.data.zan_index;
    list[index].zan = !e.currentTarget.dataset.show;
    console.log(e.currentTarget.dataset.show);
    if (zan_index != null & zan_index != index) {
      list[zan_index].zan = true;
    }

    that.setData({
      msg_list: list,
      zan_index: index
    });
  },
  //开始点赞
  Praise: function (e) {
    wx.showLoading({
      title: '加载中',
    });
    console.log(e);
    let that = this;
    let chose_index = e.currentTarget.dataset.index;
    let list = that.data.msg_list;
    let PraiseList = list[chose_index].Praise;
    let userid = wx.getStorageSync('userinfo').Id;
    console.log(PraiseList);
    let datas = "msg_list[" + chose_index + "].zan";
    let res = PraiseList.some(function (item) {
      if (item.uid == userid) {
        return true;
      }
    });

    if (res) {
      wx.hideLoading();
      wx.showToast({
        icon: 'none',
        title: '重复点赞',
      });


      that.setData({
        [datas]: true
      });
      return;
    }

    //提交点赞
    wx.request({
      url: app.host ,
      data: {
        id: e.currentTarget.dataset.id,
        uid: userid
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        that.setData({
          [datas]: true
        });
        wx.hideLoading();
        if (res.statusCode != 200) {
          wx.showToast({
            title: '网络请求错误，请检查网络',
            icon: 'none',
            duration: 3500
          });
          return;
        }
        //成功
        if (res.data.code == 1) {
          console.log(res.data.data);
          wx.showToast({
            title: '点赞成功',
          });
          PraiseList.push({ UserNamer: wx.getStorageSync('userinfo').UserNamer, uid: userid });
          list[chose_index].Praise = PraiseList;
          that.setData({
            msg_list: list
          });
        }
        else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 3500
          });
        }

      }

    });
  },
  //解决滑动穿透问题
  emojiScroll: function (e) {
    console.log(e)
  },
  //文本域失去焦点时 事件处理
  textAreaBlur: function (e) {
    //获取此时文本域值
    console.log(e.detail.value)
    this.setData({
      content: e.detail.value
    });
  },
  //文本域键盘输入时
  inputtext: function (e) {
    console.log(e.detail.value)
    this.setData({
      content: e.detail.value
    });
  },
  //文本域获得焦点事件处理
  textAreaFocus: function () {
    this.setData({
      // isShow: false,
      cfBg: false
    })
  },
  //点击表情显示隐藏表情盒子
  emojiShowHide: function () {
    this.setData({
      isShow: !this.data.isShow,
      isLoad: false,
      cfBg: !this.data.false
    })
  },
  //表情选择
  emojiChoose: function (e) {
    //当前输入内容和表情合并
    this.setData({
      content: this.data.content + e.currentTarget.dataset.emoji
    })
  },
  //点击emoji背景遮罩隐藏emoji盒子
  cemojiCfBg: function () {
    this.setData({
      isShow: false,
      cfBg: false
    })
  },
  //评论弹出框
  Replay: function (e) {
    let that = this;
    let chose_index = e.currentTarget.dataset.index;
    let list = that.data.msg_list;
    let PraiseList = list[chose_index].Praise;

    let datas = "msg_list[" + chose_index + "].zan";
    that.setData({
      replay_box: false,
      [datas]: true,
      ReplayType: 0
    });
  },
  //敏感词检测
  replay_check: function () {
    let that = this;
    let content = that.data.content;
    let _index = that.data.zan_index;
    if (_index != 0 & _index.length == 0) {
      wx.showToast({
        title: '索引获取失败，请重新点击评论',
        icon: 'none',
        duration: 1500
      });
      return;
    }

    if (content == "" || content == null) {
      wx.showToast({
        title: '内容不能为空',
        icon: 'none',
        duration: 1500
      });
      return;
    }

    //检测是否包含敏感词
    wx.request({
      url: app.host ,
      data: { content: content },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {

        wx.hideLoading();
        if (res.statusCode != 200) {
          wx.showToast({
            title: '网络请求错误，请检查网络',
            icon: 'none',
            duration: 3500
          });
          return;
        }
        console.log(res.data);
        console.log(res.data.errcode);
        if (res.data.errcode == 40001) {
          wx.showToast({
            title: '令牌过期',
            icon: 'none',
            duration: 1500
          });
          return;
        }
        if (res.data.errcode != 0) {
          wx.showToast({
            title: '内容含有敏感或违法词',
            icon: 'none',
            duration: 1500
          });
          return;
        }

        //回复请求-start


        that.send_msg();


        //回复请求-end
      }

    });



  },
  //发送评论回复
  send_msg: function (e) {
    let that = this;
    let _index = that.data.zan_index;
    let ReplayType = that.data.ReplayType;
    let content = that.data.content;
    let info = that.data.ReplayUser;


    let userid = wx.getStorageSync('userinfo').Id;
    let list = that.data.msg_list;
    let id = list[_index].Id;

    if (userid == "" || id == "") {
      wx.showToast({
        title: '动态id获取失败',
        icon: 'none',
        duration: 1500
      });
      return;
    }


    //编辑回复信息
    content = encodeURIComponent(content);
    let url = "", parse = null;
    if (ReplayType == 0) {
      url = "comment";
      parse = {
        id: id,
        uid: userid,
        content: content
      };
    }
    else {

      if (info == "" || info == null) {
        wx.showToast({
          title: '回复用户信息获取失败',
          icon: 'none',
          duration: 1500
        });
        return;
      }
      url = "ReplayComment";
      parse = {
        id: id,
        uid: userid,
        content: content,
        Repaler: info.uid
      };
    }
    wx.showLoading({
      title: '加载中',
      duration: 30000
    });
    //提交评论
    wx.request({
      url: app.host ,
      data: parse,
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        that.setData({
          replay_box: true,
        });
        wx.hideLoading();
        if (res.statusCode != 200) {
          wx.showToast({
            title: '网络请求错误，请检查网络',
            icon: 'none',
            duration: 3500
          });
          return;
        }
        //成功
        if (res.data.code == 1) {
          wx.showToast({
            title: '评论成功',
          });
          if (ReplayType == 0) {
            list[_index].Comment.push({ UserNamer: wx.getStorageSync('userinfo').UserNamer, uid: userid, Content: decodeURIComponent(content), Id: res.data.data.id });
          }
          else {
            list[_index].Comment.push({ UserNamer: wx.getStorageSync('userinfo').UserNamer, uid: userid, Content: decodeURIComponent(content), Id: res.data.data.id, RepalyUser: info.uid, ReplayName: info.name });
          }

          that.setData({
            msg_list: list,
            content: '',
            Repaler: null,
            placeholder: '我要评论'
          });
        }
        else {

          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 3500
          });
        }

      }

    });

  }
})