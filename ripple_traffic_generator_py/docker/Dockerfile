FROM node:12

MAINTAINER Antonios Inglezakis <inglezakis.a@unic.ac.cy>

RUN apt update && apt-get install -y python3 jq sed python3-dev python3-pip

ADD ./scripts /scripts
RUN chmod + /scripts/*.sh

WORKDIR /home/node/rtg

ENTRYPOINT /scripts/init.sh
CMD /bin/bash
