import socket

import ulid
from fastapi import Request
# このutils.pyファイルは、アプリケーション全体で使う「便利な道具箱」のようなものです。
# よく使う機能をここにまとめておいて、必要なときに取り出して使えるようにしています。

# 重複しない番号」を作る関数
def get_ulid() -> str:
    return ulid.new().str

# ウェブサイトにアクセスしてきた人の「住所」（IPアドレス）を調べる関数
def get_request_info(request: Request) -> str:
    return request.client.host

# インターネット上の「住所」（IPアドレス）から「名前」（ホスト名）を調べる関数
def get_host_by_ip_address(ip_address: str) -> str:
    return socket.gethostbyaddr(ip_address)[0]
