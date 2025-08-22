# Usar Node 20
FROM node:20-alpine

# Diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências (mais tolerante que npm ci)
RUN npm install --legacy-peer-deps

# Copiar todo o código da aplicação
COPY . .

# Compilar TypeScript
RUN npm run build

# Expor a porta da aplicação
EXPOSE 3001

# Comando para iniciar a aplicação
CMD ["node", "dist/server-express.js"]
