/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ElementType, PropsWithChildren, Ref } from 'react';
import { ClassName, PolymorphicComponentProps } from '../../utils/types';
import { useDetectClickOutside } from '../util/eventHooks';

interface Props extends ClassName {
    onClickOutside(): void;
}

type DetectClickOutsideProps<C extends ElementType> = PolymorphicComponentProps<
    C,
    Props
>;

export default function DetectClickOutside<
    C extends ElementType<{ ref?: Ref<any> }> = 'div'
>({
    onClickOutside,
    as,
    ...props
}: PropsWithChildren<DetectClickOutsideProps<C>>): JSX.Element {
    const ref = useDetectClickOutside(onClickOutside);
    const Element = (as || 'div') as any;

    return <Element ref={ref} {...props} />;
}
