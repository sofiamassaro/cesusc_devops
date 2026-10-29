# Imagem base leve (Alpine), como recomendado na aula
FROM node:20.19.5-alpine3.22

# Diretório de trabalho dentro do container
WORKDIR /opt/projeto-devops

# Copia primeiro só os arquivos de dependências para aproveitar o cache de camadas:
# se o package.json não mudar, o npm install não roda de novo no próximo build
COPY package*.json ./
RUN npm install --omit=dev

# Copia o código da aplicação
COPY src/ src/

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
