import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
# from groq import Groq

# .env 파일에서 환경 변수 로드
load_dotenv()

app = Flask(__name__)
# CORS 설정: 모든 도메인에서 오는 요청을 허용합니다. 
# 실제 프로덕션 환경에서는 특정 도메인만 허용하도록 수정해야 합니다.
CORS(app)

# Groq 클라이언트 초기화 (API 키는 환경 변수에서 가져옵니다)
# client = Groq(
#     api_key=os.environ.get("GROQ_API_KEY"),
# )

@app.route('/api/convert', methods=['POST'])
def convert_tone():
    """
    사용자로부터 텍스트와 변환 대상을 받아, 더미 응답을 반환하는 API 엔드포인트입니다.
    Sprint 1 목표에 따라 초기 API 연동을 테스트하기 위한 구현입니다.
    """
    # if not request.json or 'text' not in request.json or 'target' not in request.json:
    #     return jsonify({"error": "Invalid request. 'text' and 'target' are required."}), 400

    # data = request.json
    # user_text = data['text']
    # target_persona = data['target']

    # Sprint 1: 실제 Groq API 호출 대신 더미 응답 반환
    dummy_response = {
        "original_text": "user_text",
        "converted_text": f"이것은 '{'target_persona'}' 대상을 위한 변환된 텍스트의 더미 응답입니다.",
        "target": "target_persona"
    }
    
    return jsonify(dummy_response)

if __name__ == '__main__':
    # 디버그 모드로 Flask 앱을 실행합니다.
    app.run(debug=True, port=5001)
