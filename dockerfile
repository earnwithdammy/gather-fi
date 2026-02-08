FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install
RUN npm install --legacy-peer-deps

# Copy app
COPY . .

# Build
RUN npm run build

# Railway sets PORT environment variable automatically
ENV PORT=3000
EXPOSE $PORT

# Start on Railway's assigned port
CMD ["sh", "-c", "next start -p $PORT"]
