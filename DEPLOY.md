# Mailcow 部署指南

## 1. 配置 mailcow.conf

编辑 `mailcow.conf`，**必须修改**以下项：

```
MAILCOW_HOSTNAME=MAIL.YOURDOMAIN.COM    # 改为你的真实主机名，如 mail.example.com
```

可选修改：
- `ADDITIONAL_SAN` — 额外的 SSL 证书域名
- `WATCHDOG_NOTIFY_EMAIL` — 监控告警邮箱
- `ACME_ACCOUNT_EMAIL` — Let's Encrypt 证书邮箱
- `SPAMHAUS_DQS_KEY` — Spamhaus DQS 密钥（如果用 OVH/AWS 等被封 ASN）

## 2. 部署

```bash
cd /path/to/mailcow-dockerized
docker compose up -d
```

## 3. 首次登录

- 地址: `https://MAIL.YOURDOMAIN.COM:443`（或你配置的 HTTPS_PORT）
- 用户: `admin`
- 密码: `moohoo`
- **首次登录后立即修改密码！**

## 4. 添加域名和邮箱

登录后在 "域名设置" 中添加你的邮件域名，然后创建邮箱账户。

## 5. DNS 记录

确保为你的域名配置以下 DNS 记录：

| 类型 | 名称 | 值 |
|------|------|-----|
| A | mail | 你的服务器 IP |
| MX | @ | mail.yourdomain.com (优先级 10) |
| TXT | @ | `v=spf1 mx a ~all` |
| TXT | _dmarc | `v=DMARC1; p=reject; rua=mailto:admin@yourdomain.com` |

## 6. 安全加固已完成

以下安全措施已在 `docker-compose.yml` 中配置：

- 14 个容器添加了 `no-new-privileges` 安全限制
- MySQL/Redis 默认绑定 `127.0.0.1`
- SOGo 加密密钥已随机生成
- 所有数据库密码已随机生成 (28 字符)
- HTTP 自动重定向到 HTTPS
- Watchdog 监控已启用

**未添加安全限制的容器**（需要特权）：
- `netfilter-mailcow` — 防火墙功能需要特权模式
- `dockerapi-mailcow` — 需要 Docker socket 访问
- `ofelia-mailcow` — 需要 Docker socket 访问

## 7. 日常维护

```bash
# 更新 mailcow
cd /path/to/mailcow-dockerized
./update.sh

# 查看容器状态
docker compose ps

# 查看日志
docker compose logs -f [服务名]

# 重启所有服务
docker compose restart

# 停止所有服务
docker compose down
```

## 8. 备份

重要数据目录：
- `data/assets/ssl/` — SSL 证书
- `data/conf/` — 所有配置文件
- Docker volumes: `vmail-vol-1` (邮件), `mysql-vol-1` (数据库)

建议定期备份数据库：
```bash
docker compose exec mysql-mailcow mysqldump -u root -p"$DBROOT" mailcow > backup.sql
```
