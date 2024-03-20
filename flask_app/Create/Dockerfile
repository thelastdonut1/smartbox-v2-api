FROM mtconnect/agent:latest

WORKDIR /mtconnect/config

COPY  agents/default .

RUN ls

CMD ["/usr/bin/mtcagent", "run", "/mtconnect/config/agent.cfg"]