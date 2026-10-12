---
title: 个人云端极速同步方案
icon: cloud
---

<script setup>
import KnowledgeGraph from '../../.vitepress/components/KnowledgeGraph.vue'
</script>

#  个人云端极速同步方案：Docker + WebDAV + Obsidian

这篇文章将介绍一套适合个人开发者的云端极速同步方案。

## Obsidian 是什么

Obsidian 是一款基于本地 Markdown 文件的强大知识库与笔记软件。 它以“双向链接”为核心，能够像大脑神经元一样将离散的知识点连接成网。由于它所有的文件都是普通的 `.md` 文本格式，不需要依赖任何专有数据库，因此它具备极高的灵活性、极快的启动速度，以及极其繁荣的第三方插件生态（如下文提及用于同步的 Remotely Save 插件）。

## 为什么要有 Obsidian（本地笔记）

市面上有那么多云笔记应用（Notion、印象笔记等），为什么还要坚持使用 Obsidian 这种“本地优先”的笔记？

1. 你的数据，永远属于你（数据主权）
	
	绝大多数云笔记的本质是：**你把数据租借给了一家商业公司**。如果这家公司改变了收费策略、服务器宕机，甚至公司倒闭，你的知识库就会随之消亡或被锁死。**Obsidian**没有自己的数据库格式，所有的笔记都是你电脑硬盘里最普通的 `.md`（Markdown 纯文本）文件。这意味着，哪怕几十年后 Obsidian 这个软件不复存在了，你依然可以用任何一个文本编辑器（甚至是 Windows 自带的记事本）打开并阅读你一生的积累。
    
2. 极其脆弱，又极其坚固
	
	因为它是纯文本，所以它不依赖任何特定的环境，这就是它的“坚固”。 你刚才部署的 **WebDAV + 云服务器** 就是最好的例子：你不需要向官方交每月的订阅费，凭借你自己的技术，就能用完全属于你的服务器、按你自己的规则，把数据同步到世界的每一个角落。它是完全开源生态的受益者。
	
3. 从“树状文件柜”到“网状大脑”（双向链接）
	
	传统的文件夹系统是“树状”的（比如：`工作/2026/项目A/会议记录.docx`）。但人类的大脑不是这么工作的，大脑的神经元是呈**网状交织**的。 Obsidian 引入了强大的 `[[双向链接]]`。当你在 A 笔记里打出 `[[B笔记]]` 时，它们之间就产生了一条“神经突触”。随着笔记的增多，你的知识库会长出一张属于你自己的**星空图谱**。

### 实时关系图谱（Canvas）

下面这个图谱基于原生 Vue `canvas` 实现，由 GPT-5.3 创作并持续维护。

<KnowledgeGraph :height="420" />

::: tip 交互说明
- 拖拽单个节点：调整节点位置
- 鼠标滚轮：缩放画布
- 按住空白区域拖动：平移视图
- 点击节点：直接跳转到对应文章
- 双击空白区域：重置视图到初始状态
:::
    

---

## 事前准备

- 一台具有公网 IP 的 Linux 云服务器，并已安装 Docker Compose。
- 一个属于你的域名，例如 `dav.example.com`。
- 域名的 A 或 AAAA 记录已经指向云服务器。
- 云安全组和系统防火墙放行 TCP 80、443；SSH 端口只允许可信来源地址。
- 电脑或手机已经安装 Obsidian 与 `Remotely Save` 插件。

本方案使用 rclone 提供 WebDAV 服务，使用 Caddy 自动申请和续期 HTTPS 证书。WebDAV 容器只连接内部 Docker 网络，公网入口只有 HTTPS。

## 创建部署目录和秘密配置

```bash
mkdir -p ~/obsidian-webdav
cd ~/obsidian-webdav
umask 077
printf 'WEBDAV_DOMAIN=dav.example.com\nWEBDAV_USER=obsidian\nWEBDAV_PASSWORD=%s\n' "$(openssl rand -base64 32)" > .env
chmod 600 .env
```

将 `dav.example.com` 改成你的域名。`.env` 保存访问凭据，文件权限只允许当前用户读取。

创建 `compose.yaml`：

```yaml
services:
  webdav:
    image: rclone/rclone@sha256:2687085f718d3c628f7fdfb77c52a1d344332aed543110bb88088f2c70d43eb5
    command:
      - serve
      - webdav
      - /data
      - --addr=:8080
      - --user=${WEBDAV_USER}
      - --pass=${WEBDAV_PASSWORD}
    restart: unless-stopped
    read_only: true
    tmpfs:
      - /tmp
    cap_drop:
      - ALL
    security_opt:
      - no-new-privileges:true
    volumes:
      - webdav-data:/data
    networks:
      - internal

  caddy:
    image: caddy@sha256:d8542f48d34a9cf4e4c11a478865229840e87e4c96ea3f439101f31a5d35f75f
    restart: unless-stopped
    environment:
      WEBDAV_DOMAIN: ${WEBDAV_DOMAIN}
    ports:
      - 80:80
      - 443:443
      - 443:443/udp
    security_opt:
      - no-new-privileges:true
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy-data:/data
      - caddy-config:/config
    networks:
      - internal

networks:
  internal:

volumes:
  webdav-data:
  caddy-data:
  caddy-config:
```

镜像使用内容摘要固定。升级镜像时应先读取发布说明，在测试环境验证同步与恢复，再更新摘要。

创建 `Caddyfile`：

```text
{$WEBDAV_DOMAIN} {
  encode zstd gzip
  reverse_proxy webdav:8080

  header {
    Strict-Transport-Security "max-age=31536000; includeSubDomains"
    X-Content-Type-Options "nosniff"
    Referrer-Policy "no-referrer"
  }
}
```

启动服务：

```bash
docker compose config
docker compose up -d
docker compose ps
curl --fail --silent --show-error --head "https://$(sed -n 's/^WEBDAV_DOMAIN=//p' .env)/"
```

最后一条命令收到 `401 Unauthorized` 表示 HTTPS、域名和 WebDAV 身份验证均已工作。

## 配置防火墙

云安全组与系统防火墙只开放以下入口：

- TCP 80：证书签发和 HTTPS 跳转。
- TCP 443、UDP 443：HTTPS 与 HTTP/3。
- SSH：限制为管理者的固定来源地址。

WebDAV 的 8080 端口只存在于内部 Docker 网络，无需加入公网安全组。

## Obsidian 配置

打开 `Remotely Save` 设置页面并填写：

1. 远程服务：`WebDAV`
2. 服务器地址：`https://dav.example.com/`
3. 用户名：读取 `.env` 中的 `WEBDAV_USER`
4. 密码：读取 `.env` 中的 `WEBDAV_PASSWORD`
5. 身份验证：`Basic`

点击“检查”确认连接。首次同步以前，先复制一份本地笔记目录作为离线备份。

## 备份与恢复验证

WebDAV 同步无法代替备份。定期导出命名卷，并实际验证恢复过程：

```bash
docker run --rm \
  -v obsidian-webdav_webdav-data:/source:ro \
  -v "$PWD/backups:/backup" \
  alpine@sha256:5291449c3df73caf6ed85e649dec1b9e818b39a5d8c871e97afc13e9cd5e8fa8 \
  tar -czf "/backup/obsidian-$(date +%F).tar.gz" -C /source .
```

备份目录应继续复制到另一台设备或独立对象存储，并设置独立的访问凭据。

## 故障检查

- `docker compose ps`：确认两个容器处于运行状态。
- `docker compose logs caddy`：检查域名解析和证书签发。
- `docker compose logs webdav`：检查身份验证和文件访问错误。
- `curl -I https://dav.example.com/`：确认公网入口返回 HTTPS 响应。
- `docker volume inspect obsidian-webdav_webdav-data`：确认数据卷存在。

---

## 相关文章

- [GitHub Actions 自动化部署（实战工作流）](../git/github-action.md)
- [AC 耦合：高速链路里的“隔直通交”基础能力](../si-pi/ac-coupling.md)
