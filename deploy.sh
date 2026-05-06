#!/usr/bin/env bash
set -euo pipefail

# 确保在脚本所在目录运行
cd "$(dirname "$0")"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}================================${NC}"
echo -e "${CYAN}  Mailcow 安全部署脚本${NC}"
echo -e "${CYAN}================================${NC}"
echo ""

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}错误: 未安装 Docker${NC}"
    exit 1
fi

if ! docker compose version &> /dev/null; then
    echo -e "${RED}错误: 未安装 Docker Compose${NC}"
    exit 1
fi

# 检查 mailcow.conf 是否存在
if [ ! -f mailcow.conf ]; then
    echo -e "${RED}错误: mailcow.conf 不存在，请先运行 generate_config.sh${NC}"
    exit 1
fi

# 检查 MAILCOW_HOSTNAME 配置项是否存在
if ! grep -q '^MAILCOW_HOSTNAME=' mailcow.conf; then
    echo -e "${RED}错误: mailcow.conf 中未找到 MAILCOW_HOSTNAME 配置项${NC}"
    exit 1
fi

echo -e "${YELLOW}请输入你的邮件服务器域名 (FQDN)${NC}"
echo -e "${CYAN}例如: mail.example.com${NC}"
echo ""

DOMAIN_REGEX='^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$'
while true; do
    read -p "域名: " DOMAIN
    if [[ -z "$DOMAIN" ]]; then
        echo -e "${RED}域名不能为空！${NC}"
        continue
    fi
    if [[ ! "$DOMAIN" =~ $DOMAIN_REGEX ]]; then
        echo -e "${RED}请输入有效的域名 (如 mail.example.com)${NC}"
        continue
    fi
    break
done

echo ""
echo -e "${GREEN}你输入的域名: ${CYAN}${DOMAIN}${NC}"
read -p "确认? [Y/n] " confirm
if [[ "$confirm" =~ ^[nN] ]]; then
    echo "已取消"
    exit 0
fi

# 转义域名中的特殊字符，防止 sed 注入
ESCAPED_DOMAIN=$(printf '%s\n' "$DOMAIN" | sed 's/[&/\]/\\&/g')

# 替换 mailcow.conf 中的域名（匹配 KEY= 并替换整行的值）
echo -e "${YELLOW}正在配置 mailcow.conf...${NC}"
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s|^MAILCOW_HOSTNAME=.*|MAILCOW_HOSTNAME=${ESCAPED_DOMAIN}|g" mailcow.conf
else
    sed -i "s|^MAILCOW_HOSTNAME=.*|MAILCOW_HOSTNAME=${ESCAPED_DOMAIN}|g" mailcow.conf
fi

# 同步 .env
if ! cp mailcow.conf .env; then
    echo -e "${RED}警告: 无法将 mailcow.conf 复制为 .env，请手动复制${NC}"
    echo -e "${YELLOW}运行: cp mailcow.conf .env${NC}"
fi

echo -e "${GREEN}配置完成！${NC}"
echo ""
echo -e "${CYAN}================================${NC}"
echo -e "${CYAN}  配置摘要${NC}"
echo -e "${CYAN}================================${NC}"
echo -e "  主机名: ${GREEN}${DOMAIN}${NC}"
echo -e "  HTTPS:  ${GREEN}https://${DOMAIN}:443${NC}"
echo -e "  Admin:  ${GREEN}admin${NC} / ${CYAN}moohoo${NC}"
echo -e "  ${YELLOW}(首次登录后请立即修改默认密码!)${NC}"
echo ""

read -p "是否现在启动 Mailcow? [Y/n] " start
if [[ ! "$start" =~ ^[nN] ]]; then
    echo -e "${YELLOW}正在启动 Mailcow...${NC}"
    docker compose up -d
    echo ""
    echo -e "${GREEN}Mailcow 已启动！${NC}"
    echo -e "访问 ${CYAN}https://${DOMAIN}${NC} 进行管理"
else
    echo -e "${YELLOW}稍后手动启动: docker compose up -d${NC}"
fi
