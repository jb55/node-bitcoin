# Dockerfile for running node-bitcoin tests
FROM freewil/bitcoin-testnet-box
MAINTAINER Sean Lavine <lavis88@gmail.com>

# install node.js
USER root
RUN apt-get install --yes curl
RUN curl --silent --location https://deb.nodesource.com/setup_0.12 | bash -
RUN apt-get install --yes nodejs

# set permissions for tester user on project
ADD . /home/tester/node-bitcoin
RUN chown --recursive tester:tester /home/tester/node-bitcoin

# install module dependencies
USER tester
WORKDIR /home/tester/node-bitcoin
RUN npm install

# run test suite
CMD ["npm", "test"]
