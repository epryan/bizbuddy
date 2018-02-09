# BizBuddy

## An express-based homepage and invoicing application developed for BaseByDottie

* **Usage**
  - Clone the repo
  - Create database folders (eg. meanbase/data/db)
  - Configure the .env files based on .env.default

  - npm install

  - Spawn the mongod instance to handle db connections
    - mongod --fork --logpath /var/log/mongodb.log --dbpath data/db

  - Start the web app!
    - npm run start
    - or
    - DEBUG=meanbase:* npm run devstart

  - The default config listens on port 3000 (ie. http://localhost:3000/)
