// Создание анимированных падающих элементов (долларов/фишек)
function createFallingElements() {
    const bg = document.getElementById('fallingBackground');
    if (!bg) return;
    
    const symbols = ['$', '₽', '♦', '♠', '♣', '♥', 'K', 'A'];
    const numberOfElements = 40;

    for (let i = 0; i < numberOfElements; i++) {
        const element = document.createElement('div');
        element.className = 'falling-element';
        element.textContent = symbols[Math.floor(Math.random() * symbols.length)];

        const leftPos = Math.random() * 100;
        const duration = 10 + Math.random() * 20;
        const delay = Math.random() * 5;
        const size = 16 + Math.random() * 20;

        element.style.left = `${leftPos}vw`;
        element.style.fontSize = `${size}px`;
        element.style.animationDuration = `${duration}s`;
        element.style.animationDelay = `${delay}s`;

        const colors = ['#40E0D0', '#2ECC71', '#F1C40F', '#E74C3C', '#9B59B6'];
        element.style.color = colors[Math.floor(Math.random() * colors.length)];

        bg.appendChild(element);
    }
}

// Универсальная функция для копирования текста (работает на всех устройствах)
function copyToClipboard(text) {
    // Создаем временный текстовый элемент
    const tempInput = document.createElement('input');
    tempInput.style.position = 'absolute';
    tempInput.style.left = '-9999px';
    tempInput.value = text;
    document.body.appendChild(tempInput);
    
    // Выделяем текст
    tempInput.select();
    tempInput.setSelectionRange(0, 99999); // Для мобильных устройств
    
    try {
        // Пробуем современный API
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text)
                .then(() => {
                    document.body.removeChild(tempInput);
                    return true;
                })
                .catch(() => {
                    // Если modern API не работает, используем старый метод
                    return execCommandCopy(tempInput);
                });
        } else {
            // Используем старый метод execCommand
            return execCommandCopy(tempInput);
        }
    } catch (err) {
        // В крайнем случае показываем текст для ручного копирования
        document.body.removeChild(tempInput);
        showManualCopyPrompt(text);
        return Promise.resolve(false);
    }
}

// Старый метод копирования через execCommand
function execCommandCopy(inputElement) {
    try {
        const successful = document.execCommand('copy');
        document.body.removeChild(inputElement);
        return Promise.resolve(successful);
    } catch (err) {
        document.body.removeChild(inputElement);
        return Promise.resolve(false);
    }
}

// Показывает текст для ручного копирования (запасной вариант)
function showManualCopyPrompt(text) {
    const promptDiv = document.createElement('div');
    promptDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(19, 28, 46, 0.95);
        color: white;
        padding: 20px;
        border-radius: 10px;
        border: 2px solid #40e0d0;
        z-index: 10000;
        max-width: 90%;
        text-align: center;
        box-shadow: 0 5px 15px rgba(0,0,0,0.5);
    `;
    
    promptDiv.innerHTML = `
        <h3 style="margin-bottom: 15px; color: #40e0d0;">Скопируйте промокод:</h3>
        <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 5px; margin-bottom: 15px; font-size: 1.5rem; font-weight: bold; letter-spacing: 2px; color: #40e0d0;">
            ${text}
        </div>
        <p style="margin-bottom: 15px; font-size: 0.9rem;">Выделите текст выше и нажмите "Копировать"</p>
        <button id="closePrompt" style="background: #40e0d0; color: #0a0e17; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold;">
            Закрыть
        </button>
    `;
    
    document.body.appendChild(promptDiv);
    
    // Фокус на тексте для легкого копирования на мобильных
    setTimeout(() => {
        const textElement = promptDiv.querySelector('div');
        const range = document.createRange();
        range.selectNodeContents(textElement);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }, 100);
    
    document.getElementById('closePrompt').addEventListener('click', () => {
        document.body.removeChild(promptDiv);
        window.getSelection().removeAllRanges();
    });
}

// Функция для настройки копирования промокода
function setupPromoCopy() {
    const copyBtn = document.getElementById('copyBtn');
    const promoCodeInput = document.getElementById('promoCode');
    
    if (!copyBtn || !promoCodeInput) return;
    
    copyBtn.addEventListener('click', () => {
        const promoCode = promoCodeInput.value;
        
        // Сохраняем оригинальный текст кнопки
        const originalHTML = copyBtn.innerHTML;
        const originalBackground = copyBtn.style.background;
        const originalColor = copyBtn.style.color;
        const originalBorderColor = copyBtn.style.borderColor;
        
        // Показываем состояние загрузки
        copyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Копирование...';
        copyBtn.disabled = true;
        
        copyToClipboard(promoCode)
            .then(success => {
                if (success) {
                    // Успешное копирование
                    copyBtn.innerHTML = '<i class="fas fa-check"></i> Промокод скопирован!';
                    copyBtn.style.background = 'rgba(46, 204, 113, 0.3)';
                    copyBtn.style.color = '#2ecc71';
                    copyBtn.style.borderColor = '#2ecc71';
                    
                    // Также копируем в буфер обмена на мобильных через вибрацию
                    if (navigator.vibrate) {
                        navigator.vibrate(200);
                    }
                    
                    // Показываем уведомление на мобильных
                    showMobileNotification('Промокод скопирован!');
                } else {
                    // Не удалось скопировать автоматически
                    copyBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Нажмите для копирования';
                    copyBtn.style.background = 'rgba(231, 76, 60, 0.3)';
                    copyBtn.style.color = '#e74c3c';
                    copyBtn.style.borderColor = '#e74c3c';
                    
                    // Показываем текст для ручного копирования
                    setTimeout(() => {
                        showManualCopyPrompt(promoCode);
                    }, 300);
                }
                
                // Возвращаем оригинальный вид через 3 секунды
                setTimeout(() => {
                    copyBtn.innerHTML = originalHTML;
                    copyBtn.style.background = originalBackground;
                    copyBtn.style.color = originalColor;
                    copyBtn.style.borderColor = originalBorderColor;
                    copyBtn.disabled = false;
                }, 3000);
            })
            .catch(() => {
                // Ошибка при копировании
                copyBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Ошибка копирования';
                copyBtn.style.background = 'rgba(231, 76, 60, 0.3)';
                copyBtn.style.color = '#e74c3c';
                copyBtn.style.borderColor = '#e74c3c';
                
                setTimeout(() => {
                    copyBtn.innerHTML = originalHTML;
                    copyBtn.style.background = originalBackground;
                    copyBtn.style.color = originalColor;
                    copyBtn.style.borderColor = originalBorderColor;
                    copyBtn.disabled = false;
                }, 3000);
            });
    });
    
    // Также добавляем обработчик долгого нажатия на само поле ввода
    promoCodeInput.addEventListener('click', function() {
        this.select();
        this.setSelectionRange(0, 99999);
        
        // Показываем подсказку на мобильных
        if (window.innerWidth <= 768) {
            showMobileNotification('Нажмите и удерживайте для копирования');
        }
    });
    
    // Обработчик долгого нажатия (для мобильных)
    let pressTimer;
    promoCodeInput.addEventListener('touchstart', function(e) {
        pressTimer = setTimeout(() => {
            this.select();
            this.setSelectionRange(0, 99999);
            showMobileNotification('Текст выделен. Нажмите "Копировать"');
        }, 500);
        
        e.preventDefault();
    });
    
    promoCodeInput.addEventListener('touchend', function() {
        clearTimeout(pressTimer);
    });
}

// Показывает уведомление на мобильных устройствах
function showMobileNotification(message) {
    // Создаем уведомление
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(30, 40, 62, 0.95);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        border: 1px solid #40e0d0;
        z-index: 10000;
        font-weight: 500;
        text-align: center;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        animation: slideDown 0.3s ease, fadeOut 0.3s ease 2.7s;
        animation-fill-mode: forwards;
        max-width: 90%;
    `;
    
    notification.innerHTML = `
        <i class="fas fa-info-circle" style="margin-right: 8px; color: #40e0d0;"></i>
        ${message}
    `;
    
    document.body.appendChild(notification);
    
    // Удаляем уведомление через 3 секунды
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// Установка текущего года в подвале
function setCurrentYear() {
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    createFallingElements();
    setupPromoCopy();
    setCurrentYear();
    
    // Добавляем стили для анимации уведомлений
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from {
                top: -50px;
                opacity: 0;
            }
            to {
                top: 20px;
                opacity: 1;
            }
        }
        
        @keyframes fadeOut {
            from {
                opacity: 1;
            }
            to {
                opacity: 0;
            }
        }
        
        /* Улучшение для мобильного выделения текста */
        #promoCode {
            -webkit-user-select: text !important;
            user-select: text !important;
        }
        
        /* Стиль для кнопки при нажатии на мобильных */
        .touch-optimized:active {
            transform: scale(0.98);
            transition: transform 0.1s;
        }
    `;
    document.head.appendChild(style);
});

// Обработчик для всех кнопок копирования на странице
document.addEventListener('click', function(e) {
    if (e.target.closest('.btn-copy') || e.target.closest('.copy-promo-btn')) {
        // Предотвращаем повторную обработку, если уже обрабатывается
        if (e.target.closest('#copyBtn')) return;
        
        const btn = e.target.closest('.btn-copy') || e.target.closest('.copy-promo-btn');
        const promoCode = document.getElementById('promoCode')?.value || 'POKER2026';
        
        copyToClipboard(promoCode)
            .then(success => {
                if (success) {
                    const originalHTML = btn.innerHTML;
                    btn.innerHTML = '<i class="fas fa-check"></i> Скопировано!';
                    btn.style.opacity = '0.8';
                    
                    setTimeout(() => {
                        btn.innerHTML = originalHTML;
                        btn.style.opacity = '1';
                    }, 2000);
                }
            });
    }
});