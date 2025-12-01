FROM node:20-alpine
WORKDIR /usr/src/app

# Prevent Angular CLI from watching via fs events only (helps inside containers)
ENV CHOKIDAR_USEPOLLING=true \
    NG_CLI_ANALYTICS=false \
    HOST=0.0.0.0 \
    PORT=4200

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy application sources
COPY . .

# Expose Angular dev server port
EXPOSE 4200

# Start Angular dev server accessible from other containers
CMD ["npm", "run", "start", "--", "--host", "0.0.0.0", "--port", "4200"]

