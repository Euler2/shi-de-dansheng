# 诗的诞生 v4

在 **v3** 基础上独立迭代，**未修改** `shi-de-dansheng-v3` 及更早版本。

## v4 相对 v3 新增

| 功能 | 说明 |
|------|------|
| **诗 + 互动史一体** | 同一应用、同一引擎；浏览 Tab 分「诗文 / 故事」 |
| **每日双卡** | 今日诗篇 + 今日故事，各按日轮转 |
| **互动史扩充** | 由 8 篇增至 **20 篇**（课标文言 + 经典正史） |
| **互动史 Tab** | 六则每日推荐 + 初/高中文言目录对接 playable 按钮 |

### 20 篇互动史

**v3 已有（8）**：荆轲刺秦、鸿门宴、商鞅立木、屈原投江、苏武牧羊、完璧归赵、文天祥就义、卧薪尝胆

**v4 新增（12）**：曹刿论战、邹忌讽齐王、出师表、桃花源记、三峡、马说、岳阳楼记、醉翁亭记、过秦论、陈情表、种树郭橐驼传、谏逐客书

课标索引：`data/scaffold/stories-junior-prose.json`（初中 41～60）、`stories-senior-prose.json`（高中文言 32）。

## v3 功能（v4 保留）

- 每日一篇 / 笺谱金银印 / 猜真句 / AI 点评试点 / 课标目录 / ~164 篇诗词关卡

## 本地运行

```bash
cd shi-de-dansheng-v4
npm install
npm run dev
```

浏览器打开 http://localhost:3000

### Android APK

```bash
npm run app:apk
```

包名：`com.zhihu.shidedansheng.v4`

## 投稿合集

开发完成后可同步至 `renwenji/shi-de-dansheng/`（见 `renwenji/sync-from-dev.ps1`）。
