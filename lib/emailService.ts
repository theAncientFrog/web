// 💡 --- ВИПРАВЛЕННЯ ---
// Ви НЕ МОЖЕТЕ надсилати пошту з @gmail.com.
// Використовуйте 'onboarding@resend.dev' доки ви не верифікуєте
// свій власний домен (наприклад, @nazva.com) в налаштуваннях Resend.
const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
// --- КІНЕЦЬ ВИПРАВЛЕННЯ ---

// Леніва ініціалізація Resend - використовуємо динамічний імпорт
// щоб уникнути проблем під час build
let resendInstance: any = null;

async function getResend(): Promise<any | null> {
    // Перевіряємо, чи не під час build
    if (process.env.NEXT_PHASE === 'phase-production-build') {
        return null;
    }
    
    if (!process.env.RESEND_API_KEY) {
        console.warn('[EmailService] RESEND_API_KEY не встановлено. Email не буде надіслано.');
        return null;
    }
    
    if (!resendInstance) {
        try {
            // Динамічний імпорт Resend тільки коли потрібно
            const { Resend } = await import('resend');
            resendInstance = new Resend(process.env.RESEND_API_KEY);
        } catch (error) {
            console.error('[EmailService] Помилка імпорту Resend:', error);
            return null;
        }
    }
    
    return resendInstance;
}


/**
 * Надсилає email з 6-значним кодом верифікації.
 * @param email - Пошта, куди надсилаємо.
 * @param code - 6-значний код.
 */
export async function sendVerificationEmail(email: string, code: string) {
    const resend = await getResend();
    
    if (!resend) {
        console.warn(`[EmailService] Пропущено надсилання email до ${email} - RESEND_API_KEY не налаштовано або під час build`);
        return;
    }
    
    try {
        await resend.emails.send({
            from: `NAZVA <${fromEmail}>`, // Тепер тут буде 'onboarding@resend.dev'
            to: [email],
            subject: 'Ваш код верифікації',
            // Використовуємо простий HTML для листа
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="text-align: center; color: #333;">Підтвердження вашої пошти</h2>
          <p style="font-size: 16px;">
            Дякуємо за реєстрацію! Будь ласка, використайте цей код, щоб завершити реєстрацію:
          </p>
          <div style="text-align: center; margin: 25px 0;">
            <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; padding: 10px 20px; background-color: #f4f4f4; border-radius: 5px;">
              ${code}
            </span>
          </div>
          <p style="font-size: 14px; color: #777;">
            Цей код дійсний протягом 1 години. Якщо ви не реєструвалися, просто проігноруйте цей лист.
          </p>
        </div>
      `,
        });
        console.log(`Verification email sent to ${email}`);
    } catch (error) {
        console.error('Error sending verification email:', error);
        // Не кидаємо помилку далі, щоб не блокувати реєстрацію,
        // але ви можете змінити цю логіку
    }
}


