from fastapi import FastAPI
from router import routes

server = FastAPI()
server.include_router(routes)