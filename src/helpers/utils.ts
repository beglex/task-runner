export async function sampleTask(id = `${Date.now()}_${crypto.randomUUID()}`, delay = 500) {
    await new Promise(resolve => setTimeout(resolve, Math.random() * delay));
    if (Math.random() > 0.9) {
        throw new Error(`Task ${id} failed`);
    } else {
        return true;
    }
}

export function date(d = new Date()) {
    const options: Partial<Intl.DateTimeFormatOptions> = {
        hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3,
    };

    return new Intl.DateTimeFormat('ru-RU', options).format(d).replace(',', '.');
}
