import { ComponentProps } from 'react';
import Button from './Button';

/**
 * @description
 * Use as a regular \<button type="submit" /\>
 */
export default function Submit(
    props: Omit<ComponentProps<typeof Button>, 'type'>
): ReturnType<typeof Button> {
    return Button({ type: 'submit', ...props });
}
