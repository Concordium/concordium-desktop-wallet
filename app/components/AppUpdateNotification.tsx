/* eslint-disable react/no-unused-prop-types */
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
import ErrorIcon from '@resources/svg/logo-error.svg';
import CheckmarkIcon from '@resources/svg/logo-checkmark.svg';
import Button from '~/cross-app-components/Button';
import { NotificationLevel } from '~/features/NotificationSlice';
import Loading from '~/cross-app-components/Loading';

import Notification from './Notification';
import Countdown from './Countdown';

enum UpdateStatus {
    Available,
    Downloading,
    Verifying,
    Success,
    Error,
}
interface Props {
    version: string;
    onUpdate(): void;
    onClose(): void;
}

interface UpdateState {
    status: UpdateStatus;
    message?: string;
}

interface ChildProps extends Props, UpdateState {
    setState: Dispatch<SetStateAction<UpdateState>>;
}

const AvailableChild = ({
    onUpdate,
    setState,
    onClose,
    version,
}: ChildProps) => {
    const update = useCallback(() => {
        onUpdate();
        setState({ status: UpdateStatus.Downloading });
    }, [onUpdate, setState]);

    return (
        <>
            <div className="flex alignCenter">
                <CogIcon width="21" height="22" />
                <span className="mL5">Version {version} is available.</span>
            </div>
            <div className="inlineFlexColumn mT20">
                <Button size="tiny" onClick={update}>
                    Restart & install
                </Button>
                <Button className="mT10" size="tiny" onClick={onClose}>
                    Remind me
                </Button>
            </div>
        </>
    );
};

const iconWidth = 60;

const ProcessChild = ({ status }: ChildProps) => (
    <>
        <Loading inline iconWidth={iconWidth} />
        <div className="mT10 textCenter">
            {status === UpdateStatus.Downloading && 'Downloading update'}
            {status === UpdateStatus.Verifying && 'Verifying update'}
        </div>
    </>
);

const SuccessChild = ({ onClose }: ChildProps) => {
    function handleEnd() {
        window.autoUpdate.quitAndInstall();
        onClose();
    }
    return (
        <>
            <CheckmarkIcon width={iconWidth} height={iconWidth} />
            <div className="mT10 textCenter">
                Update verified. Restarting application in{' '}
                <Countdown from={3} onEnd={handleEnd} />
            </div>
        </>
    );
};

const ErrorChild = ({ message }: ChildProps) => (
    <>
        <ErrorIcon width={iconWidth} height={iconWidth} />
        <div className="mT10 textCenter">{message}</div>
    </>
);

const updateStatusMap: {
    [k in UpdateStatus]: ComponentType<ChildProps>;
} = {
    [UpdateStatus.Available]: AvailableChild,
    [UpdateStatus.Downloading]: ProcessChild,
    [UpdateStatus.Verifying]: ProcessChild,
    [UpdateStatus.Success]: SuccessChild,
    [UpdateStatus.Error]: ErrorChild,
};

export default function AppUpdateNotification(props: Props) {
    const { onClose } = props;
    const [state, setState] = useState<UpdateState>({
        status: UpdateStatus.Available,
    });
    const { status } = state;
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
            window.autoUpdate.onError((_, message: string) =>
                setState({
                    status: UpdateStatus.Error,
                    message,
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
            onCloseClick={onClose}
        >
            <Child {...props} {...state} setState={setState} />
        </Notification>
    );
}
