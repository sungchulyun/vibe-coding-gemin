document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText');
    const outputText = document.getElementById('outputText');
    const convertButton = document.getElementById('convertButton');
    const copyButton = document.getElementById('copyButton');
    const personaButtons = document.querySelectorAll('.persona-btn');
    const currentCharSpan = document.getElementById('currentChar');
    const feedbackSection = document.getElementById('feedbackSection');
    const feedbackButtons = document.querySelectorAll('.feedback-btn');
    const maxChar = 500; // PRD: 최대 500자

    let selectedPersona = '상사'; // Default persona, should match the active button on load
    let lastOriginalText = ''; // To store the original text for feedback

    // --- 초기 설정 ---
    // 초기 로드 시 '상사' 버튼 활성화
    document.querySelector('.persona-btn[data-persona="상사"]').classList.add('active');
    // 초기 출력 메시지 설정
    outputText.textContent = '변환하기 버튼을 누르면 여기에 결과가 나타납니다.';
    outputText.style.color = 'var(--text-color-light)'; // PRD에 따라 회색 텍스트로 표시

    // --- Event Listeners ---

    // Persona selection
    personaButtons.forEach(button => {
        button.addEventListener('click', () => {
            personaButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            selectedPersona = button.dataset.persona;
        });
    });

    // Feedback buttons
    feedbackButtons.forEach(button => {
        button.addEventListener('click', () => {
            const feedbackValue = button.dataset.value;
            handleFeedback(feedbackValue);
        });
    });

    // Character counter
    inputText.addEventListener('input', () => {
        const currentLength = inputText.value.length;
        currentCharSpan.textContent = currentLength;
        if (currentLength > maxChar) {
            currentCharSpan.classList.add('char-counter-error'); // Define this class in custom.css for red color
            convertButton.disabled = true; // Disable convert button if over limit
        } else {
            currentCharSpan.classList.remove('char-counter-error');
            convertButton.disabled = false; // Enable convert button
        }
    });

    // Convert button click
    convertButton.addEventListener('click', handleConvert);

    // Copy button click
    copyButton.addEventListener('click', copyToClipboard);


    // --- Functions ---

    /**
     * Handles the conversion process by calling the backend API.
     */
    async function handleConvert() {
        const text = inputText.value.trim();
        lastOriginalText = text; // Store for feedback

        if (!text) {
            alert('변환할 텍스트를 입력해주세요.');
            return;
        }

        if (text.length > maxChar) {
            alert(`입력 가능한 글자 수를 초과했습니다. (최대 ${maxChar}자)`);
            return;
        }

        // Show loading state
        convertButton.disabled = true;
        const originalConvertButtonText = convertButton.textContent;
        convertButton.textContent = '변환 중...';
        convertButton.classList.add('opacity-75', 'cursor-not-allowed');

        outputText.textContent = 'AI가 열심히 문장을 다듬고 있어요...';
        outputText.style.color = 'var(--text-color)'; // 로딩 중에는 일반 텍스트 색상
        feedbackSection.classList.add('hidden'); // Hide feedback section during loading

        try {
            const response = await fetch('/api/convert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    keywords: text,
                    persona: selectedPersona,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '서버에서 오류가 발생했습니다.');
            }

            const data = await response.json();
            if (data.converted_message) {
                outputText.textContent = data.converted_message;
                outputText.style.color = 'var(--text-color)'; // 변환 완료 후 일반 텍스트 색상
                feedbackSection.classList.remove('hidden'); // Show feedback section
            } else {
                throw new Error('변환 결과가 비어 있습니다.');
            }

        } catch (error) {
            console.error('Error during conversion:', error);
            outputText.textContent = `오류 발생: ${error.message}. 잠시 후 다시 시도해주세요.`;
            outputText.style.color = 'var(--error-color)'; // 오류 시 오류 색상
            alert(error.message);
        } finally {
            // Reset loading state
            convertButton.disabled = false;
            convertButton.textContent = originalConvertButtonText;
            convertButton.classList.remove('opacity-75', 'cursor-not-allowed');
        }
    }

    /**
     * Sends user feedback to the backend.
     */
    async function handleFeedback(value) {
        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    feedback: value,
                    original: lastOriginalText,
                    converted: outputText.textContent,
                    persona: selectedPersona,
                }),
            });

            if (response.ok) {
                // Give visual feedback and disable buttons
                feedbackSection.innerHTML = `<span class="text-sm text-green-600 font-bold w-full text-center">피드백이 전달되었습니다. 감사합니다!</span>`;
            }
        } catch (error) {
            console.error('Error sending feedback:', error);
        }
    }

    /**
     * Copies the content of the output text area to the clipboard.
     */
    function copyToClipboard() {
        const textToCopy = outputText.textContent;
        // Placeholder text가 아닐 때만 복사 가능
        if (!textToCopy || textToCopy === '변환하기 버튼을 누르면 여기에 결과가 나타납니다.' || textToCopy.startsWith('AI가 열심히 문장을 다듬고 있어요...')) {
            alert('복사할 내용이 없습니다.');
            return;
        }
        
        navigator.clipboard.writeText(textToCopy).then(() => {
            // Visual feedback
            const originalText = copyButton.textContent;
            copyButton.textContent = '복사 완료!';
            copyButton.classList.remove('btn-primary');
            copyButton.classList.add('btn-success'); // Use success color for feedback

            setTimeout(() => {
                copyButton.textContent = originalText;
                copyButton.classList.remove('btn-success');
                copyButton.classList.add('btn-primary');
            }, 1500);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert('클립보드 복사에 실패했습니다.');
        });
    }
});
