import React from 'react';
import { PropsOf } from '~/utils/types';
import TransactionListElement from '../TransactionListElement';

type ElementProps = PropsOf<typeof TransactionListElement>;
type StoryProps = Pick<ElementProps, 'showDate'> & ElementProps['transaction'];
// eslint-disable-next-line import/prefer-default-export
export const ElementStoryComponent = (p: StoryProps) => <>{p}</>;
