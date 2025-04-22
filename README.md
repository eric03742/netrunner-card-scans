# netrunner-card-scans

*《矩阵潜袭》卡牌图片资源下载工具*

## 简介

`netrunner-card-scans` 用于将 [NetrunnerDB](https://netrunnerdb.com/) 上的卡图下载至本地。

卡图文件共有 `large`、`medium`、`small`、`tiny` 四种尺寸，适用于不同的场景下。

## 使用

使用以下命令运行工具：

```shell
npx @eric03742/netrunner-card-scans \
    --host={HOST} \
    --port={PORT} \
    --username={USERNAME} \
    --password={PASSWORD} \
    --database={DATABASE} \
    --output={OUTPUT_DIR}
```

程序本身对下载速率进行了限制，每秒钟最多下载10张卡图，防止对NRDB服务器造成影响。

**参数说明**

* `--host`：数据库地址
* `--port`：端口
* `--username`：用户名
* `--password`：密码
* `--database`：数据库名
* `--output`：导出目录

## 数据源

卡图文件均来自 [NetrunnerDB](https://netrunnerdb.com/) 的公开数据，本仓库只作收集、整理之用，对这些卡图均无版权。

本仓库及其开发者与 Fantasy Flight Games、Wizards of the Coast、Null Signal Games、NetrunnerDB 均无关联。

## 许可证

[MIT](./LICENSE)

## 作者

[Eric03742](https://github.com/eric03742)
