FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

COPY . .

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3000

# Command to run the application
CMD ["node", "src/server.js"]
