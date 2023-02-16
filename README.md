# tzcloud-micro-app

#### 介绍
团子云微前端（框架）解决方案

#### 框架思路

基于 `Web Components` 自定义一个 `MicroAppElement` 元素类，通过 `window.customElements` 方法进行注册。同时定义一个抽象类 `MicroApp` 每当 `MicroAppElement` 实例化时，随之实例化一个 `MicroApp` 实例，管理微应用整个生命周期的处理，`MicroAppElement` 只负责 DOM 相关操作，作为 `MicroApp` 和浏览器之间的桥梁。

- `MicroAppElement`：微应用载体元素，负责渲染、挂载子应用，通过其生命周期连接 `MicroApp` 和浏览器之间的通信；
- `MicroApp`：与 `MicroAppElement` 元素同步创建的实例，负责整个微应用的生命周期管理，以及沙箱等工作；

#### 软件架构
软件架构说明


#### 安装教程

1.  xxxx
2.  xxxx
3.  xxxx

#### 使用说明

1.  xxxx
2.  xxxx
3.  xxxx

#### 参与贡献

1.  Fork 本仓库
2.  新建 Feat_xxx 分支
3.  提交代码
4.  新建 Pull Request


#### 特技

1.  使用 Readme\_XXX.md 来支持不同的语言，例如 Readme\_en.md, Readme\_zh.md
2.  Gitee 官方博客 [blog.gitee.com](https://blog.gitee.com)
3.  你可以 [https://gitee.com/explore](https://gitee.com/explore) 这个地址来了解 Gitee 上的优秀开源项目
4.  [GVP](https://gitee.com/gvp) 全称是 Gitee 最有价值开源项目，是综合评定出的优秀开源项目
5.  Gitee 官方提供的使用手册 [https://gitee.com/help](https://gitee.com/help)
6.  Gitee 封面人物是一档用来展示 Gitee 会员风采的栏目 [https://gitee.com/gitee-stars/](https://gitee.com/gitee-stars/)