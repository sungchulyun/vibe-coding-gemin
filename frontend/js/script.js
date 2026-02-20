document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText');
    const outputText = document.getElementById('outputText');
    const convertButton = document.getElementById('convertButton');
    const copyButton = document.getElementById('copyButton');
    const personaButtons = document.querySelectorAll('.persona-btn');
    const currentCharSpan = document.getElementById('currentChar');

    let selectedPersona = '상사'; // Default persona

    // --- Event Listeners ---

    // Persona selection
    personaButtons.forEach(button => {
        button.addEventListener('click', () => {
            personaButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            selectedPersona = button.dataset.persona;
        });
    });

    // Character counter
    inputText.addEventListener('input', () => {
        const currentLength = inputText.value.length;
        currentCharSpan.textContent = currentLength;
        if (currentLength > 500) {
            // Optionally, add a visual indicator for exceeding the limit
            currentCharSpan.style.color = 'var(--error-color)';
        } else {
            currentCharSpan.style.color = ''; // Reset color
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
        const text = inputText.value;

        if (!text.trim()) {
            alert('변환할 텍스트를 입력해주세요.');
            return;
        }

        if (text.length > 500) {
            alert('입력 가능한 글자 수를 초과했습니다. (최대 500자)');
            return;
        }

        // Show loading state
        convertButton.disabled = true;
        convertButton.textContent = '변환 중...';
        outputText.textContent = 'AI가 열심히 문장을 다듬고 있어요...';

        try {
            const response = await fetch('/api/convert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    target: selectedPersona,
                }),
            });

            if (!response.ok) {
                throw new Error('서버에서 오류가 발생했습니다.');
            }

            const data = await response.json();
            outputText.textContent = data.converted_text;

        } catch (error) {
            console.error('Error during conversion:', error);
            outputText.textContent = '오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
            alert(error.message);
        } finally {
            // Reset loading state
            convertButton.disabled = false;
            convertButton.textContent = '변환하기';
        }
    }

    /**
     * Copies the content of the output text area to the clipboard.
     */
    function copyToClipboard() {
        const textToCopy = outputText.textContent;
        if (!textToCopy) {
            alert('복사할 내용이 없습니다.');
            return;
        }
        
        navigator.clipboard.writeText(textToCopy).then(() => {
            // Visual feedback
            const originalText = copyButton.textContent;
            copyButton.textContent = '복사 완료!';
            copyButton.style.backgroundColor = 'var(--success-color)';
            setTimeout(() => {
                copyButton.textContent = originalText;
                copyButton.style.backgroundColor = ''; // Reset to original
            }, 1500);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert('클립보드 복사에 실패했습니다.');
        });
    }
});
