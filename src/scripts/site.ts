import { createIcons, icons } from 'lucide';

createIcons({ icons });

const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
const mobileMenuPanel = document.getElementById('mobile-menu-panel');
const mobileMenuOpenIcon = document.getElementById('mobile-menu-open-icon');
const mobileMenuCloseIcon = document.getElementById('mobile-menu-close-icon');
const mobileMenuLinks = document.querySelectorAll('[data-mobile-menu-link]');
let mobileMenuOpen = false;

const setMobileMenuState = (isOpen: boolean) => {
    if (!mobileMenuToggle || !mobileMenuOverlay || !mobileMenuPanel || !mobileMenuOpenIcon || !mobileMenuCloseIcon) {
        return;
    }

    mobileMenuOpen = isOpen;
    mobileMenuToggle.setAttribute('aria-expanded', String(isOpen));

    if (isOpen) {
        mobileMenuOverlay.classList.remove('opacity-0', 'pointer-events-none');
        mobileMenuOverlay.classList.add('opacity-100');
        mobileMenuPanel.classList.remove('translate-x-full');
        mobileMenuOpenIcon.classList.add('hidden');
        mobileMenuCloseIcon.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
    } else {
        mobileMenuOverlay.classList.remove('opacity-100');
        mobileMenuOverlay.classList.add('opacity-0', 'pointer-events-none');
        mobileMenuPanel.classList.add('translate-x-full');
        mobileMenuOpenIcon.classList.remove('hidden');
        mobileMenuCloseIcon.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
    }
};

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        setMobileMenuState(!mobileMenuOpen);
    });
}

if (mobileMenuOverlay) {
    mobileMenuOverlay.addEventListener('click', () => {
        setMobileMenuState(false);
    });
}

mobileMenuLinks.forEach((link) => {
    link.addEventListener('click', () => {
        setMobileMenuState(false);
    });
});

if (window.matchMedia) {
    const desktopMediaQuery = window.matchMedia('(min-width: 1024px)');
    desktopMediaQuery.addEventListener('change', (event) => {
        if (event.matches) {
            setMobileMenuState(false);
        }
    });
}

const showErrorMes = (form: HTMLFormElement | null, selector: string, message: string) => {
    if (!form) {
        return;
    }

    let errorElement: Element | null = null;
    try {
        errorElement = form.querySelector(selector);
    } catch (error) {
        return;
    }

    if (!errorElement) {
        return;
    }

    errorElement.textContent = message;
    errorElement.classList.toggle('hidden', !message);
};

const noValidPhone = (phoneValue: string) => {
    const digits = phoneValue.replace(/^(\+7)/g, '').replace(/\D/g, '');
    return digits.length > 0 && [...new Set(digits)].length === 1;
};

const maskphone = (event: Event) => {
    const input = event.currentTarget as HTMLInputElement | null;
    if (!input) {
        return;
    }

    let num = input.value.replace(/^(\+7|8|7)/g, '').replace(/\D/g, '').split(/(?=.)/);
    const i = num.length;

    if (input.value !== '' && input.value !== '+') {
        if (0 <= i) num.unshift('+7');
        if (1 <= i) num.splice(1, 0, ' ');
        if (4 <= i) num.splice(5, 0, ' ');
        if (7 <= i) num.splice(9, 0, '-');
        if (9 <= i) num.splice(12, 0, '-');
        input.value = num.join('');
    }
};

const phoneChecker = (phoneInput: HTMLInputElement | null, options: { silent?: boolean } = {}) => {
    const { silent = false } = options;
    const form = phoneInput ? phoneInput.closest('form') : null;

    if (!phoneInput || !phoneInput.value.length) {
        if (!silent && form) {
            showErrorMes(form, '.error-message.phone', 'Телефон является обязательным полем');
        }
        return false;
    }

    const phoneValue = phoneInput.value.trim();
    const phoneRe = /^\+7 [0-9]{3} [0-9]{3}-[0-9]{2}-[0-9]{2}$/;
    if (!phoneRe.test(phoneValue) || noValidPhone(phoneValue)) {
        if (!silent && form) {
            showErrorMes(form, '.error-message.phone', 'Введен некорректный номер телефона');
        }
        return false;
    }

    if (form) {
        showErrorMes(form, '.error-message.phone', '');
    }
    return true;
};

document.querySelectorAll<HTMLInputElement>('input[name="phone"]').forEach((element) => {
    element.addEventListener('input', (event) => {
        maskphone(event);
        const form = element.closest('form');
        if (form) {
            showErrorMes(form, '.error-message.phone', '');
        }
    });
    element.addEventListener('change', () => phoneChecker(element));
});

const SERVICE_PRESET_BY_KEY: Record<string, string> = {
    'digital-uv-3d': 'Цифровая, УФ и 3D печать',
    'milling-laser': 'Фрезеровка и лазерная резка',
    'outdoor-ad': 'Изготовление наружной рекламы',
    'interior-ad': 'Интерьерная реклама',
    'merch': 'Сувенирная продукция (мерч)',
    'awards': 'Наградная продукция',
    'russian-style': 'Программа «Русский стиль»',
    'calculate-project': 'Рассчитать проект',
    'ask-about-project': 'Обсудить проект',
    'other': 'Другое',
};

const applyServicePresetFromLink = (link: Element) => {
    const key = link && link.getAttribute('data-form-service');
    if (!key) {
        return;
    }
    const targetValue = SERVICE_PRESET_BY_KEY[key];
    if (!targetValue) {
        return;
    }
    const formEl = document.getElementById('contacts-form') as HTMLFormElement | null;
    const serviceSelect = formEl && formEl.querySelector<HTMLSelectElement>('select[name="service"]');
    if (!serviceSelect) {
        return;
    }
    const hasOption = Array.from(serviceSelect.options).some((opt) => opt.value === targetValue);
    if (hasOption) {
        serviceSelect.value = targetValue;
    }
};

document.querySelectorAll('a[href="#contacts-form"]').forEach((anchor) => {
    anchor.addEventListener('click', () => {
        applyServicePresetFromLink(anchor);
    });
});

const contactForm = document.getElementById('contacts-form') as HTMLFormElement | null;
const contactFormStatus = document.getElementById('contact-form-status');

if (contactForm && contactFormStatus) {
    const setFormStatus = (message: string, status: 'error' | 'success' = 'error') => {
        contactFormStatus.textContent = message;
        contactFormStatus.className = status === 'success'
            ? 'mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700'
            : 'mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700';
    };

    contactForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const submitButton = contactForm.querySelector<HTMLButtonElement>('button[type="submit"]');
        const initialButtonText = submitButton ? submitButton.textContent : '';
        const phoneInput = contactForm.querySelector<HTMLInputElement>('input[name="phone"]');

        contactFormStatus.className = 'hidden mb-6 rounded-xl border px-4 py-3 text-sm font-medium';
        contactFormStatus.textContent = '';
        showErrorMes(contactForm, '.error-message.phone', '');

        if (phoneInput && !phoneChecker(phoneInput)) {
            setFormStatus('Ошибка в отправке формы, попробуйте ещё раз. Введите телефон в формате +7 ___ ___-__-__');
            return;
        }

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Отправка...';
        }

        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: new FormData(contactForm),
            });

            let payload: { answer?: string; message?: string; field?: string } | null = null;
            try {
                payload = await response.json();
            } catch (jsonError) {
                payload = null;
            }

            if (response.ok && payload && payload.answer === 'ok') {
                setFormStatus('Ваша заявка успешно отправлена', 'success');
                contactForm.reset();
                showErrorMes(contactForm, '.error-message.phone', '');
            } else {
                const serverMessage = payload && typeof payload.message === 'string' ? payload.message.trim() : '';
                const fullErrorMessage = serverMessage
                    ? `Ошибка в отправке формы, попробуйте ещё раз. ${serverMessage}`
                    : 'Ошибка в отправке формы, попробуйте ещё раз';
                setFormStatus(fullErrorMessage);

                if (payload && payload.field && serverMessage) {
                    showErrorMes(contactForm, payload.field, serverMessage);
                }
            }
        } catch (error) {
            console.error('Form submit error:', error);
            setFormStatus('Ошибка в отправке формы, попробуйте ещё раз');
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = initialButtonText;
            }
        }
    });
}
