#!/usr/bin/env python
#coding:utf-8
import web
from web.httpserver import StaticMiddleware
from ws4py.client.threadedclient import WebSocketClient
urls = (
    '/', 'IndexHandler',  # 返回首页
    '/topic', 'TopicHandler',
    '/topic/(\d+)', 'TopicHandler',
    '/message', 'MessageHandler',
    '/user', 'UserHandler',
    '/user/(\d+)', 'UserHandler',
    '/login', 'LoginHandler',
    '/logout', 'LogoutHandler',
)

app = web.application(urls, globals())
application = app.wsgifunc(StaticMiddleware)

if web.config.get('_session') is None:
    session = web.session.Session(
        app,
        web.session.DiskStore('sessions'),
        initializer={'login': False, 'user': None}
    )
    web.config._session = session

from handlers import (  # NOQA
    IndexHandler, 
    # RegisteHandler,
    UserHandler,
    LoginHandler, LogoutHandler,
    TopicHandler, MessageHandler
)

class EchoClient(WebSocketClient):
    def opened(self):
        def data_provider():
            for i in range(1, 200, 25):
                yield "#" * i
                
        self.send(data_provider())

        for i in range(0, 200, 25):
            print(i)
            self.send("*" * i)

    def closed(self, code, reason):
        print(("Closed down", code, reason))

    def received_message(self, m):
        if len(m) == 175:
            self.close(reason='Bye bye')

def main():
    app.run()

if __name__ == "__main__":
    main()
    try:
        ws = EchoClient('ws://localhost:10086/ws', protocols=['http-only', 'chat'])
        ws.daemon = False
        ws.connect()
    except KeyboardInterrupt:
        ws.close()