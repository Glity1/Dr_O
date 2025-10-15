# test_gemini.py
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
print(f"API 키: {api_key[:10]}...")

genai.configure(api_key=api_key)

# 사용 가능한 모델 확인
for model in genai.list_models():
    if 'generateContent' in model.supported_generation_methods:
        print(f"✓ {model.name}")

# 간단한 테스트
model = genai.GenerativeModel('models/gemini-2.5-flash-lite')
response = model.generate_content("안녕하세요!")
print(f"\n테스트 응답: {response.text}")