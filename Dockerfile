# Etapa de producción
FROM node:16-alpine

WORKDIR /app

# Copiar los archivos de la aplicación
COPY package.json package-lock.json ./

# Instalar las dependencias de producción
RUN npm ci --only=production

# Copiar el resto de los archivos de la aplicación
COPY . .

# Ejecutar los comandos necesarios
RUN npx playwright install

# Exponer el puerto necesario para la aplicación
EXPOSE 8080

# Iniciar la aplicación
CMD ["npm", "start"]