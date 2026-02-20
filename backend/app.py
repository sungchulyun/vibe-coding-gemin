import logging
from flask import Flask, send_from_directory, request, jsonify
import os
from groq import Groq
from dotenv import load_dotenv
from flask_cors import CORS # CORS 임포트 추가

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# .env 파일에서 환경 변수를 로드합니다.
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Groq 클라이언트를 초기화합니다. API 키가 없으면 오류가 발생할 수 있습니다.
if not GROQ_API_KEY:
    logging.warning("GROQ_API_KEY not found. Groq API calls will fail.")
    client = None
else:
    client = Groq(api_key=GROQ_API_KEY)

# 현재 app.py 파일이 있는 디렉토리 경로를 가져옵니다.
basedir = os.path.abspath(os.path.dirname(__file__))
# frontend 디렉토리의 절대 경로를 계산합니다.
# 'frontend' 디렉토리가 'backend' 디렉토리의 상위 디렉토리에 있다고 가정합니다.
frontend_dir = os.path.join(basedir, '..', 'frontend')

app = Flask(__name__)
CORS(app) # CORS 초기화 추가

@app.route('/')
def index():
    """메인 HTML 파일을 제공합니다."""
    # frontend 디렉토리에서 index.html 파일을 찾아 반환합니다.
    return send_from_directory(frontend_dir, 'index.html')

@app.route('/health')
def health_check():
    """상태 확인 엔드포인트입니다."""
    return jsonify({"status": "healthy"}), 200

@app.route('/<path:filename>')
def serve_static_files(filename):
    """CSS, JS, 이미지 등 정적 파일들을 제공합니다."""
    # frontend 디렉토리 내의 파일만 제공하도록 합니다.
    # 예를 들어, 사용자가 '/backend/app.py' 와 같이 잘못된 경로를 요청하는 것을 방지합니다.
    return send_from_directory(frontend_dir, filename)

@app.route('/api/convert', methods=['POST'])
def convert_message():
    """
    프론트엔드로부터 키워드와 페르소나를 받아 Groq AI를 호출하고,
    변환된 메시지를 JSON 형식으로 반환합니다.
    """
    if not client:
        return jsonify({"error": "Groq API client not initialized. API key might be missing."}), 500

    data = request.get_json()
    logging.info(f"Received data: {data}")
    keywords = data.get('keywords')
    persona = data.get('persona')
    logging.info(f"Extracted keywords: {keywords}, persona: {persona}")

    if not keywords or not persona:
        return jsonify({"error": "Missing keywords or persona in request."}), 400

    # 페르소나별 시스템 프롬프트 정의 (PRD 요구사항 반영)
    persona_instructions = {
        "상사": "당신은 비즈니스 커뮤니케이션 전문가입니다. 입력된 메시지를 '상사'에게 보고하는 상황에 맞춰 변환하세요. 정중한 격식체(하십시오체)를 사용하고, 결론부터 명확하게 제시하는 보고 형식을 갖춰야 합니다. 보고의 명확성과 신뢰성을 강조하세요.",
        "동료": "당신은 비즈니스 커뮤니케이션 전문가입니다. 입력된 메시지를 '타팀 동료'에게 협업을 요청하는 상황에 맞춰 변환하세요. 친절하고 상호 존중하는 어투를 사용하되, 요청 사항과 마감 기한을 명확히 전달하는 협조 요청 형식을 갖춰야 합니다.",
        "고객": "당신은 비즈니스 커뮤니케이션 전문가입니다. 입력된 메시지를 '고객'에게 안내하는 상황에 맞춰 변환하세요. 극존칭을 사용하며, 전문성과 서비스 마인드를 강조하는 정중한 비즈니스 어투를 사용하세요. 안내, 공지, 사과 등의 목적에 부합해야 합니다."
    }

    # 프론트엔드에서 보낸 persona 값(상사, 동료, 고객)에 따라 프롬프트 선택
    system_prompt = persona_instructions.get(persona, persona_instructions["동료"])

    # 사용자 메시지 구성
    user_message = f"다음 문장을 지정된 대상에 맞게 변환해주세요: '{keywords}'"

    try:
        # Groq API 호출
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": user_message,
                }
            ],
            model="meta-llama/llama-4-scout-17b-16e-instruct", # model명은 변경하지 말아 줘  
            temperature=0.5, # 조금 더 일관된 결과를 위해 temperature 하향 조정
            max_tokens=500,
            top_p=1,
            stop=None,
            stream=False,
        )

        converted_message = chat_completion.choices[0].message.content
        logging.info(f"Groq API returned converted_message: {converted_message}")

        return jsonify({"converted_message": converted_message})

    except Exception as e:
        logging.error(f"Error calling Groq API: {e}")
        return jsonify({"error": f"An error occurred while processing your request: {e}"}), 500

@app.route('/api/feedback', methods=['POST'])
def feedback():
    """사용자 피드백을 수집하여 로그에 기록합니다."""
    data = request.get_json()
    feedback_value = data.get('feedback')
    original_text = data.get('original')
    converted_text = data.get('converted')
    persona = data.get('persona')

    logging.info(f"USER FEEDBACK: [{feedback_value}] Persona: {persona} | Original: {original_text} | Converted: {converted_text}")
    
    return jsonify({"status": "success", "message": "Feedback received."}), 200

if __name__ == '__main__':
    # Flask 개발 서버를 포트 5000번으로 실행합니다.
    app.run(debug=True, port=5000)
