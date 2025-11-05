#!/bin/bash
# Ручная установка Docker для Ubuntu/Debian

echo "🚀 Установка Docker..."

# Обновляем пакеты
sudo apt-get update

# Устанавливаем зависимости
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Добавляем официальный GPG ключ Docker
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Настраиваем репозиторий
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Устанавливаем Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Проверяем установку
sudo docker --version

# Добавляем пользователя в группу docker
sudo usermod -aG docker $USER

echo "✅ Docker установлен!"
echo "⚠️  ВАЖНО: Перезапусти SSH сессию или выполни 'newgrp docker'"
echo "После этого проверь: docker --version"

