import React, {
    useState,
    useCallback,
    useEffect,
    useMemo,
    Dispatch,
    SetStateAction,
    ComponentType,
} from 'react';

import CogIcon from '@resources/svg/settings.svg';
import Button from '~/cross-app-components/Button';
import { NotificationLevel } from '~/features/NotificationSlice';
import Notification from '../Notification';

enum UpdateStatus {
    Available,
    Downloading,
    Verifying,
    Success,
    Error,
}
interface Props {
    onUpdate(): void;
    onPostpone(): void;
}

interface State {
    status: UpdateStatus;
    message?: string;
}
type ChildProps = Props &
    Pick<State, 'message'> & {
        setState: Dispatch<SetStateAction<State>>;
    };

const AvailableChild = ({ onUpdate, setState, onPostpone }: ChildProps) => {
    const update = useCallback(() => {
        onUpdate();
        setState({ status: UpdateStatus.Downloading });
    }, [onUpdate, setState]);

    return (
        <>
            <div className="flex alignCenter">
                <CogIcon width="21" height="22" />
                <span className="mL5">New updates are available</span>
            </div>
            <div className="inlineFlexColumn mT20">
                <Button size="tiny" onClick={update}>
                    Restart & install
                </Button>
                <Button className="mT10" size="tiny" onClick={onPostpone}>
                    Remind me
                </Button>
            </div>
        </>
    );
};

const updateStatusMap: {
    [k in UpdateStatus]: ComponentType<ChildProps>;
} = {
    [UpdateStatus.Available]: AvailableChild,
    [UpdateStatus.Downloading]: AvailableChild,
    [UpdateStatus.Verifying]: AvailableChild,
    [UpdateStatus.Success]: AvailableChild,
    [UpdateStatus.Error]: AvailableChild,
};

export default function AppUpdateNotification(props: Props) {
    const { onPostpone } = props;
    const [{ status, message }, setState] = useState<State>({
        status: UpdateStatus.Available,
    });
    const disableClose = useMemo(
        () => ![UpdateStatus.Available, UpdateStatus.Error].includes(status),
        [status]
    );

    useEffect(() => {
        const unsubs = [
            window.autoUpdate.onUpdateDownloaded(() =>
                setState({ status: UpdateStatus.Verifying })
            ),
            window.autoUpdate.onVerificationSuccess(() =>
                setState({ status: UpdateStatus.Success })
            ),
            window.autoUpdate.onError((e: string) =>
                setState({
                    status: UpdateStatus.Error,
                    message: JSON.parse(e).message,
                })
            ),
        ];

        return () => unsubs.forEach((f) => f());
    }, []);

    const Child = updateStatusMap[status];

    return (
        <Notification
            className="flexColumn alignCenter"
            level={NotificationLevel.Update}
            disableClose={disableClose}
            onCloseClick={onPostpone}
        >
            <Child {...props} message={message} setState={setState} />
        </Notification>
    );
}
