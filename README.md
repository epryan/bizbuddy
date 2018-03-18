# BizBuddy

## An express-based homepage and invoicing application developed for BaseByDottie

* **Usage**
  - Clone the repo
  - Create and configure the .env file based on .env.default
  - npm install

  (For Local Database Only)
  - Create database folders (eg. bizbuddy/data/db)
  - Spawn the mongod instance to handle db connections
    - mongod --fork --logpath logs/mongodb.log --dbpath data/db

  - Start the web app!
    - npm run start
    - or
    - DEBUG=bizbuddy:* npm run devstart

  - The server will listen on the port specified in .env (ie. http://localhost:ENVPORT/)
