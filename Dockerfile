# Etapa de construcción
FROM node:16-alpine AS builder

WORKDIR /app

# Copiar los archivos de la aplicación
COPY package.json package-lock.json ./

# Instalar las dependencias de la aplicación
RUN npm ci

# Copiar el resto de los archivos de la aplicación
COPY . .

# Compilar la aplicación, si es necesario
RUN npm run build

# Etapa de producción
FROM node:16-alpine

WORKDIR /app

# Copiar los archivos de la etapa de construcción
COPY --from=builder /app ./

# Ejecutar los comandos necesarios
RUN npm ci && npx playwright install

# Exponer el puerto necesario para la aplicación
EXPOSE 3000

# Iniciar la aplicación
CMD ["npm", "start"]