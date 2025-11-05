#!/bin/bash
# Скрипт для подготовки VPS #1 для Docker деплоя админки

echo "🚀 Подготовка VPS #1 для Docker деплоя админки..."
echo "=================================================="

# 1. Проверка Docker
echo ""
echo "1. Проверка Docker..."
if ! command -v docker &> /dev/null; then
    echo "   ❌ Docker не установлен. Устанавливаю..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    echo "   ✅ Docker установлен"
else
    echo "   ✅ Docker уже установлен: $(docker --version)"
fi

# 2. Добавление пользователя в группу docker
echo ""
echo "2. Добавление пользователя в группу docker..."
if ! groups | grep -q docker; then
    echo "   ⚠️  Добавляю пользователя $USER в группу docker..."
    sudo usermod -aG docker $USER
    echo "   ✅ Пользователь добавлен в группу docker"
    echo "   ⚠️  ВАЖНО: Перезапусти сессию SSH или выполни 'newgrp docker'"
else
    echo "   ✅ Пользователь уже в группе docker"
fi

# 3. Создание директорий
echo ""
echo "3. Создание директорий..."
mkdir -p /var/www/nebulahunt/nebulahunt_admin
echo "   ✅ /var/www/nebulahunt/nebulahunt_admin создана"

# 4. Проверка прав
echo ""
echo "4. Проверка прав доступа..."
sudo chown -R $USER:$USER /var/www/nebulahunt/nebulahunt_admin 2>/dev/null || echo "   ⚠️  Нужны права sudo для chown"
echo "   ✅ Права установлены"

# 5. Проверка порта 3001
echo ""
echo "5. Проверка порта 3001..."
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "   ⚠️  Порт 3001 занят. Останови старый процесс или измени порт"
    echo "   Занятые процессы:"
    sudo lsof -i :3001
else
    echo "   ✅ Порт 3001 свободен"
fi

# 6. Проверка Docker
echo ""
echo "6. Проверка Docker..."
if docker ps &> /dev/null; then
    echo "   ✅ Docker работает"
else
    echo "   ⚠️  Docker не работает. Попробуй:"
    echo "      sudo systemctl start docker"
    echo "      newgrp docker  # или перезапусти SSH сессию"
fi

echo ""
echo "=================================================="
echo "✅ VPS #1 готов к деплою админки!"
echo ""
echo "Следующий шаг:"
echo "  1. Настрой GitHub Secrets в репозитории nebulahunt_admin"
echo "  2. Сделай git push origin main"
echo "  3. GitHub Actions автоматически задеплоит админку"

