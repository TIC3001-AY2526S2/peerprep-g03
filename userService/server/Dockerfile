# Define the image you want to build from.
# In this case, we are using the latest LTS (long term support) version of Node.
FROM node:24

# Create app directory to hold application code inside the image.
WORKDIR /usr/src/app/userService/server

# The image comes with Node.js and NPM already installed.
# We just need to install the rest of our dependencies.
# Copy the service manifest and the local auth package before installing.
COPY userService/server/package*.json ./
COPY packages/auth /usr/src/app/packages/auth

# Install dependencies.
RUN cd /usr/src/app/packages/auth && npm install
RUN npm install

# Uncomment the following line if you are building code for production.
# RUN npm ci --omit=dev

# Bundle the app's source code inside the Docker image.
COPY userService/server ./

# Expose port 3001 so it can be mapped by Docker daemon.
EXPOSE 3001

# Define the command to run your app using CMD which defines your runtime.
CMD ["npm", "run","dev"]
