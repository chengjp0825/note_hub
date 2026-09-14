---
title: AC 耦合
icon: wave-square
---

```
# ==============================================================================
# 工作流名称：NoteHub 云端构建与自动化部署
# 核心职责：侦听代码提交 -> 在 GitHub 服务器打包 Docker 镜像 -> 自动登录个人服务器更新容器
# ==============================================================================
name: NoteHub Cloud Build & Deploy

# ------------------------------------------------------------------------------
# 触发器 (Triggers)：定义何时启动这个工作流
# ------------------------------------------------------------------------------
on:
  push:
    branches: [ main ] # 仅当代码推送到 main (主分支) 时才会触发自动化流程

# ------------------------------------------------------------------------------
# 全局环境变量 (Environment Variables)
# ------------------------------------------------------------------------------
env:
  REGISTRY: ghcr.io # 指定使用的镜像仓库为 GitHub Container Registry
  IMAGE_NAME: ${{ github.repository }} # 自动获取格式为 "用户名/项目名" (例如: chengjp0825/note_hub)

# ------------------------------------------------------------------------------
# 任务集 (Jobs)：包含 build (构建) 和 deploy (部署) 两个阶段
# ------------------------------------------------------------------------------
jobs:
  # ==========================================
  # 阶段一：构建镜像并推送到云端仓库
  # ==========================================
  build:
    runs-on: ubuntu-latest # 由 GitHub 提供一台临时的、干净的 Ubuntu 虚拟机来执行构建
    
    # 权限配置：赋予临时操作令牌的基础权限
    permissions:
      contents: read     # 允许读取源码
      packages: write    # 允许向 GHCR 写入(推送)镜像

    steps:
      # 步骤 1：拉取代码库到当前的 Ubuntu 虚拟机中
      - name: Checkout repository
        uses: actions/checkout@v4

      # 步骤 2：安装和配置 Docker Buildx
      # Buildx 是 Docker 的高级构建引擎。保留此步骤为后续开启高级缓存 (cache-from/to) 
      # 或多架构编译 (如 ARM+x86) 提供了底层能力支持。
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      # 步骤 3：登录到目标容器镜像仓库 (GHCR)
      # 必须验证身份后，才能将打好的镜像推送到你账户名下的包列表中
      - name: Log in to the Container registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }} # 触发此流的 GitHub 用户名
          password: ${{ secrets.GHCR_TOKEN }} # 使用你在 Secrets 中配置的个人访问令牌 (PAT)

      # 步骤 4：根据 Dockerfile 构建镜像，并推送到 GHCR
      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: . # 上下文路径设为根目录，它会寻找根目录下的 Dockerfile
          push: true # 构建完成后立刻执行 push 动作
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest # 简单粗暴，永远覆盖 latest (最新) 标签

  # ==========================================
  # 阶段二：登录服务器拉取镜像并重启服务
  # ==========================================
  deploy:
    needs: build # 依赖管控：强制要求 build 任务完全成功后，才允许执行 deploy 任务
    runs-on: ubuntu-latest
    
    steps:
      # 使用 SSH 动作插件，模拟管理员通过终端登录你的 Linux 宿主机
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.REMOTE_HOST }} # 服务器 IP 地址
          username: ${{ secrets.REMOTE_USER }} # 登录账号 (如 root)
          key: ${{ secrets.SSH_PRIVATE_KEY }} # SSH 私钥 (免密登录的核心)
          
          # 登录成功后，在你的 Linux 服务器上依次执行以下 Shell 指令：
          script: |
            # 1. 服务器本地登录 GHCR
            # 因为 NoteHub 镜像可能被设为 Private，服务器必须带 Token 才能拉取
            echo "${{ secrets.GHCR_TOKEN }}" | sudo docker login ghcr.io -u ${{ github.actor }} --password-stdin
            
            # 2. 拉取刚才打包好的最新镜像
            # 此时的计算压力在 GitHub，你的服务器只承担网络下载的压力
            sudo docker pull ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest
            
            # 3. 停止并移除正在运行的旧版博客容器
            # "|| true" 是容错设计：如果容器不存在(如首次部署)，命令报错也不会中断整个流程
            sudo docker rm -f vitepress-site || true
            
            # 4. 基于新镜像启动新容器
            # -d: 后台运行
            # -p 127.0.0.1:8080:80: 安全映射，将容器内的 80 端口暴露到宿主机的本地 8080，供 Nginx 代理
            # --restart always: 服务器重启或 Docker 服务崩溃后自动拉起
            sudo docker run -d \
              --name vitepress-site \
              -p 127.0.0.1:8080:80 \
              --restart always \
              ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest
            
            # 5. 磁盘清理
            # 每次部署都会产生被替换掉的无标签(dangling)旧镜像，定期清理能防止服务器硬盘被撑爆
            sudo docker image prune -f
```

---

## 相关文章

- [个人云端极速同步方案（Docker + WebDAV + Obsidian）](../cloud/personal-cloud-sync.md)
