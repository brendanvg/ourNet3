Welcome to OurLifeNet

Out of all my "net" apps, this is the one that actually works/ is most polished I believe 



type: 'nvm use 4.4.3' to address the collect Unexpected token > error

type npm install (to automatically install all dependencies from package.json)

use the following when using the forever process pm2 - which will run it for the 4.4.3 version of node:

sudo pm2 start server.js --interpreter=/home/brendan/.nvm/versions/node/v4.4.3/bin/node
sudo pm2 startup systemd --interpreter=/home/brendan/.nvm/versions/node/v4.4.3/bin/node

email: brendanvg10@gmail.com for any questions.
