# 导出安卓安装包（诗的诞生 v3）

**项目路径**：`d:\AZKXT\1212\code\0611\shi-de-dansheng-v3`  
**包名**：`com.zhihu.shidedansheng.v3`（可与 v1/v2 同机共存）

---

## 零、Web 与 APK 的区别

| | `npm run dev` | `npm run app:apk` |
|---|---|---|
| 构建 | 普通 Next 服务 | `CAPACITOR=1` 静态导出到 `out/` |
| AI 点评 | 可调 `/api/comment`（配 Key） | 离线包内为**模板点评** |
| 关卡内容 | 164 篇互动 + 课标目录 | 与导出时 `out/` 一致 |

改完网页**必须重新跑** `npm run app:apk`，手机里的旧包不会自动更新。

---

## 一、首次准备（只做一次）

在 **CMD**（建议不用 JDK 28 的终端）：

```cmd
cd /d d:\AZKXT\1212\code\0611\shi-de-dansheng-v3

npm install

npx cap add android
```

若已有 `android` 目录（从 v2 复制来的），可跳过 `cap add`。

配置 Android SDK：

```cmd
copy android-local.properties.example android\local.properties
```

默认 SDK 路径：`C:\Users\Li\AppData\Local\Android\Sdk`  
若不同，用记事本改 `android\local.properties` 里的 `sdk.dir`。

**JDK（重要）**：在 `android\gradle.properties` 中确认：

```properties
org.gradle.java.home=D:\\set\\Java\\jdk-17
org.gradle.java.installations.auto-download=true
```

不要用 **JDK 28** 跑 Gradle（会报 major version 72）。  
若 v3 的 `android` 缺上述配置，从 `shi-de-dansheng` 或 `shi-de-dansheng-v2` 的 `android\gradle.properties`、`settings.gradle`、`build.gradle` 前三段复制过来。

---

## 二、每次改完 v3 后出 debug 包（推荐）

```cmd
cd /d d:\AZKXT\1212\code\0611\shi-de-dansheng-v3

gradlew.bat --stop

npm run app:apk
```

脚本等价于：

```cmd
set CAPACITOR=1
next build
npx cap sync android
cd android
gradlew.bat assembleDebug
```

**成功后的 APK 路径**：

```
d:\AZKXT\1212\code\0611\shi-de-dansheng-v3\android\app\build\outputs\apk\debug\app-debug.apk
```

把 `app-debug.apk` 传到手机安装即可（需允许「未知来源」）。

---

## 三、分步执行（排查失败时用）

```cmd
cd /d d:\AZKXT\1212\code\0611\shi-de-dansheng-v3

npm run app:build
npx cap sync android
cd android
gradlew.bat assembleDebug
```

---

## 四、用 Android Studio 出包（可选）

```cmd
cd /d d:\AZKXT\1212\code\0611\shi-de-dansheng-v3
npm run app:android
```

在 Android Studio 2026.x：

1. 等待 Gradle Sync 完成（右下角无进度条）  
2. **真机调试**：USB 连手机 → 点 ▶ Run  
3. **只出 APK**：菜单 **Build → Build Bundle(s) / APK(s) → Build APK(s)**

若 Studio 启动异常，检查环境变量 `STUDIO_VM_OPTIONS` 是否被劫持；可改为指向正常 `studio64.exe.vmoptions`。

---

## 五、与 v1 / v2 安装包对照

| | v1 | v2 | v3 |
|---|---|---|---|
| 目录 | `shi-de-dansheng` | `shi-de-dansheng-v2` | `shi-de-dansheng-v3` |
| 包名 | `com.zhihu.shidedansheng` | `...v2` | `...v3` |
| 体量 | 20 关 | 20 关+对照 | **164 关**+每日+笺谱+课标 |

三个 apk 可**同时安装**在一台手机上。

---

## 六、常见问题

| 现象 | 处理 |
|------|------|
| SDK not found | 检查 `android\local.properties` |
| Java 21/28 报错 | 用 JDK 17；设 `org.gradle.java.home` |
| 改了网页 apk 没变 | 重新 `npm run app:apk` |
| `next build` 很慢 | 正常；164 关静态页体积较大，首次 3～5 分钟 |
| AI 点评在 apk 里无效 | 预期行为；需联网后端或改回 dev 模式 |

---

## 七、批量更新课标关卡后

```cmd
node scripts\scaffold-poems.mjs
npm run app:apk
```

会刷新 `lib\levels.ts` 与 `data\levels\*.json`，再打进 apk。
