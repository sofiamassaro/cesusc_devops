#!/usr/bin/env bash
# Preparação da instância EC2 (Ubuntu) - rodar UMA vez, conectado via SSH:
#   ssh -i sua-chave.pem ubuntu@SEU_IP
#   bash setup-ec2.sh
set -e

echo ">> 1. Atualizando os repositórios do sistema"
sudo apt-get update -y && sudo apt-get upgrade -y

echo ">> 2. Instalando o Docker Engine (script oficial)"
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
rm get-docker.sh

echo ">> 3. Adicionando o usuário ubuntu ao grupo docker (docker sem sudo)"
sudo usermod -aG docker ubuntu

echo ">> 4. Habilitando o Docker no boot do sistema"
sudo systemctl enable docker
sudo systemctl start docker

echo ">> 5. Instalando o Nginx (proxy reverso)"
sudo apt-get install -y nginx
sudo cp "$(dirname "$0")/nginx-projeto-devops.conf" /etc/nginx/sites-available/projeto-devops
sudo ln -sf /etc/nginx/sites-available/projeto-devops /etc/nginx/sites-enabled/projeto-devops
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

echo ">> 6. Criando a pasta do projeto e ajustando dono e permissões"
sudo mkdir -p /opt/projeto-devops
sudo chown -R ubuntu:ubuntu /opt/projeto-devops
sudo chmod -R 755 /opt/projeto-devops

echo ""
echo "Pronto. Saia e entre de novo no SSH para o grupo docker valer (exit e ssh novamente)."
echo "Teste com: docker run hello-world"
