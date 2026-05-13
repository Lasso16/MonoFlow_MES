FROM node:20-alpine as build
WORKDIR /app

# Declarar el ARG y pasarlo a ENV para que Vite lo detecte en la compilación
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# Nginx
CMD ["nginx", "-g", "daemon off;"]