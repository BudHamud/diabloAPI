# Etapa de producción
FROM node:16-alpine

WORKDIR /app

# Copiar los archivos de la etapa de construcción
COPY --from=builder /app ./

# Ejecutar los comandos necesarios
RUN npm i && npx playwright install

# Exponer el puerto necesario para la aplicación
EXPOSE 8080

# Iniciar la aplicación
CMD ["npm", "start"]