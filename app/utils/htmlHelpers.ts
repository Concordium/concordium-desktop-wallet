import { Rectangle } from 'electron';

export function scaleFieldWidth(el: HTMLElement | null) {
    if (!el) {
        return;
    }

    setTimeout(() => {
        el.style.width = '5px';
        el.style.width = `${el.scrollWidth + 1}px`;
    }, 0);
}

export function scaleFieldHeight(el: HTMLElement | null) {
    if (!el) {
        return;
    }

    setTimeout(() => {
        el.style.height = '5px';
        el.style.height = `${el.scrollHeight}px`;
    }, 0);
}

export function getElementRectangle(
    element: HTMLElement | null
): Rectangle | undefined {
    if (!element) {
        return undefined;
    }
    let { x, y, height, width } = element.getBoundingClientRect();
    x = Math.trunc(x);
    y = Math.trunc(y);
    height = Math.trunc(height);
    width = Math.trunc(width);
    return { x, y, height, width };
}
