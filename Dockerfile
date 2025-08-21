# Usar Node 20
FROM node:20-alpine

# Diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci --legacy-peer-deps

# Copiar todo o código
COPY . .

# Compilar TypeScript
RUN npm run build

# Expor porta
EXPOSE 3001

# Comando para iniciar
CMD ["node", "dist/server-express.js"]
