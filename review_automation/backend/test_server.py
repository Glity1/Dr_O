# backend/test_server.py
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World", "status": "환경 설정 완료!"}

# 실행: uvicorn test_server:app --reload