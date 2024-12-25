FROM logstash:8.1.3

USER root
RUN apt-get update && apt-get install -y gcc libpq-dev curl

USER logstash
RUN rm -rf /usr/share/logstash/pipeline
COPY ./pipeline pipeline
RUN curl -o postgresql-42.3.3.jar -L https://jdbc.postgresql.org/download/postgresql-42.3.3.jar