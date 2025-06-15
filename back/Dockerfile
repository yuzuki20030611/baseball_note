FROM python:3.11-bookworm AS development

ENV LANG=ja_JP.UTF-8
ENV TZ=Asia/Tokyo
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/backend/app:/backend
ENV TERM=xterm-256color

RUN apt-get update && apt-get install -y \
    git \
    gcc \
    libpq-dev \
    curl

WORKDIR /backend

ADD requirements.txt /backend/
RUN pip3 install --upgrade pip && pip3 install -r requirements.txt

COPY . /backend/

RUN chmod +x /backend/init-db.sh

FROM python:3.11-bookworm AS production

ENV LANG=ja_JP.UTF-8
ENV TZ=Asia/Tokyo
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/backend/app:/backend
ENV TERM=xterm-256color

WORKDIR /backend

COPY --from=development /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=development /usr/local/bin /usr/local/bin
COPY --from=development /backend /backend

RUN apt-get update && apt-get install -y \
    git \
    gcc \
    libpq-dev \
    curl

COPY entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["entrypoint.sh"]
# CMD ["/bin/sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
