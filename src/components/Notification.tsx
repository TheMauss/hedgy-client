import { useEffect, useState } from "react";
import {
  CheckCircleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from "@heroicons/react/outline";
import { XIcon } from "@heroicons/react/solid";
import useNotificationStore from "../stores/useNotificationStore";
import { useConnection } from "@solana/wallet-adapter-react";
import { useMediaQuery } from "react-responsive";
import { useNetworkConfiguration } from "contexts/NetworkConfigurationProvider";

const NotificationList = () => {
  const { notifications, set: setNotificationStore } = useNotificationStore(
    (s) => s
  );

  const isMobile = useMediaQuery({ query: "(max-width: 767px)" });

  const handleHideNotification = (id) => {
    setNotificationStore((state) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== id
      );
    });
  };

  return (
    <div
      className={`z-20 fixed ${isMobile ? "top-10 inset-x-0 justify-center items-center " : "bottom-2 left-4 "} flex flex-col items-end px-4 py-6 pointer-events-none sm:p-6`}
    >
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          id={notification.id}
          type={notification.type}
          message={notification.message}
          description={notification.description}
          txid={notification.txid}
          onHide={() => handleHideNotification(notification.id)}
          isMobile={isMobile}
        />
      ))}
    </div>
  );
};

const Notification = ({
  id,
  type,
  message,
  description,
  txid,
  onHide,
  isMobile,
}) => {
  const { connection } = useConnection();
  const { networkConfiguration } = useNetworkConfiguration();

  const [progress, setProgress] = useState(100);

  const [exit, setExit] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = Math.max(prevProgress - 100 / 150, 0);
        if (newProgress === 0) {
          setExit(true); // Start exit animation
          clearInterval(interval);
          setTimeout(() => onHide(id), 300);
        }
        return newProgress;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [onHide, id]);

  const gradientBackgrounds = {
    success: "linear-gradient(to right, #0B7A55, #34C796)",
    info: "linear-gradient(to right, #633640, #4b4e9d)",
    error: "linear-gradient(to right, #7A3636, #C44141)",
  };

  const notificationClasses = `max-w-sm ${
    isMobile ? "w-full " : "w-[320px] h-auto "
  } bg-bkg-1 rounded-md mt-2 pointer-events-auto ring-1 ring-black ring-opacity-5 p-2 mx-4 mb-4 overflow-hidden font-poppins ${
    exit ? "notification-exit" : "notification-enter"
  }`;

  return (
    <div className={notificationClasses}>
      <div
        className={`rounded-md p-[1px]`}
        style={{ background: gradientBackgrounds[type] }}
      >
        <div
          style={{ width: `${progress}%`, height: "2px", marginTop: "auto" }}
          className={`bg-layer-3 pt-2 rounded-t-md`}
        />
        <div
          className={`p-3 rounded-b-md bg-base bg-opacity-90 flex items-center`}
        >
          {/* Icon and message layout */}
          <div className={`flex-shrink-0`}>
            {type === "success" && (
              <CheckCircleIcon className={`h-8 w-8 mr-1 text-green`} />
            )}
            {type === "info" && (
              <InformationCircleIcon className={`h-8 w-8 mr-1 text-red`} />
            )}
            {type === "error" && <XCircleIcon className={`h-8 w-8 mr-1`} />}
          </div>
          <div className={`ml-2 flex-1`}>
            <div className={`font-bold text-fgd-1`}>{message}</div>
            {description && (
              <p className={`mt-0.5 text-sm text-fgd-2`}>{description}</p>
            )}
            {txid && (
              <div className="flex flex-row">
                <a
                  href={`https://solscan.io/tx/${txid}?cluster=${networkConfiguration}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-row link link-accent text-emerald-200"
                >
                  {/* Transaction link layout */}
                </a>
              </div>
            )}
          </div>
          <div className={`flex-shrink-0 self-start flex`}>
            <button
              onClick={() => onHide(id)}
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
