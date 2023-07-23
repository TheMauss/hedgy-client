import { useEffect} from 'react';
import {
  CheckCircleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from '@heroicons/react/outline';
import { XIcon } from '@heroicons/react/solid';
import useNotificationStore from '../stores/useNotificationStore';
import { useConnection } from '@solana/wallet-adapter-react';
import { useMediaQuery } from 'react-responsive';
import { useNetworkConfiguration } from 'contexts/NetworkConfigurationProvider';

const NotificationList = () => {
  const { notifications, set: setNotificationStore } = useNotificationStore(
    (s) => s
  );
  const latestNotification =
    notifications.length > 0 ? notifications[notifications.length - 1] : null;

  useEffect(() => {
    if (latestNotification) {
      const timer = setTimeout(() => {
        setNotificationStore((state) => {
          state.notifications.shift(); // Remove the oldest notification
        });
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [latestNotification, setNotificationStore]);

  useEffect(() => {
    if (notifications.length > 1) {
      setNotificationStore((state) => {
        state.notifications = [
          state.notifications[state.notifications.length - 1]
        ]; // Keep only the latest notification
      });
    }
  }, [notifications, setNotificationStore]);

  const handleHideNotification = () => {
    setNotificationStore((state) => {
      state.notifications.pop(); // Remove the latest notification
    });
  };

  
  const isMobile = useMediaQuery({ query: '(max-width: 767px)' });

  return (
    <div className={`z-20 fixed ${isMobile ? 'bottom-4 inset-x-0 justify-center' : 'bottom-2 left-4'} flex items-end px-4 py-6 pointer-events-none sm:p-6`}>
      <div className={`flex ${isMobile ? 'flex-col items-center' : 'flex-row items-start'}`}>
        {latestNotification && (
          <Notification
            type={latestNotification.type}
            message={latestNotification.message}
            description={latestNotification.description}
            txid={latestNotification.txid}
            onHide={handleHideNotification}
            isMobile={isMobile}
          />
        )}
      </div>
    </div>
  );
};

const Notification = ({ type, message, description, txid, onHide, isMobile }) => {
  const { connection } = useConnection();
  const { networkConfiguration } = useNetworkConfiguration();

  useEffect(() => {
    const id = setTimeout(() => {
      onHide();
    }, 8000);

    return () => {
      clearTimeout(id);
    };
  }, [onHide]);

  const notificationClasses = `max-w-sm ${
    isMobile ? 'w-[200%] h-[50%]' : 'w-80 h-auto'
  } bg-bkg-1 shadow-lg rounded-md mt-2 pointer-events-auto ring-1 ring-black ring-opacity-5 p-2 mx-4 mb-12 overflow-hidden`;


  return (
    <div className={notificationClasses}>
      <div
        className={`p-4 rounded-md bg-gradient-to-r from-purple-900 via-purple-600 to-emerald-500`}
        style={{ background: 'linear-gradient(to right, #633640, #4b4e9d)' }}
      >
        <div className={`flex items-center`}>
          <div className={`flex-shrink-0`}>
            {type === 'success' ? (
              <CheckCircleIcon className={`h-8 w-8 mr-1 text-green`} />
            ) : null}
            {type === 'info' && (
              <InformationCircleIcon className={`h-8 w-8 mr-1 text-red`} />
            )}
            {type === 'error' && <XCircleIcon className={`h-8 w-8 mr-1`} />}
          </div>
          <div className={`ml-2 w-0 flex-1`}>
            <div className={`font-bold text-fgd-1`}>{message}</div>
            {description ? (
              <p className={`mt-0.5 text-sm text-fgd-2`}>{description}</p>
            ) : null}
            {txid ? (
              <div className="flex flex-row">
                <a
                  href={`https://explorer.solana.com/tx/${txid}?cluster=${networkConfiguration}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-row link link-accent text-emerald-200"
                >
                  <svg
                    className="flex-shrink-0 h-4 ml-2 mt-0.5 text-primary-light w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    ></path>
                  </svg>
                  <div className="flex mx-4">
                    {txid.slice(0, 8)}...
                    {txid.slice(txid.length - 8)}
                  </div>
                </a>
              </div>
            ) : null}
          </div>
          <div className={`ml-4 flex-shrink-0 self-start flex`}>
            <button
              onClick={() => onHide()}
              className={`bg-bkg-2 default-transition rounded-md inline-flex text-fgd-3 hover:text-fgd-4 focus:outline-none`}
            >
              <span className={`sr-only`}>Close</span>
              <XIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationList;
