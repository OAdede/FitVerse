# Use an official Node.js runtime as a parent image
# We use 'alpine' for a smaller image size
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json first
# This takes advantage of Docker's layer caching.
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application's source code into the container
COPY . .

# Make port 5000 available to the world outside this container
EXPOSE 5000

# Define the command to run the app when the container starts
CMD ["node", "server.js"] 