import useNotificationStore from "../stores/useNotificationStore";

export function notify(newNotification: {
  type?: string;
  message: string;
  description?: string;
  txid?: string;
  id?: string;
}) {
  const { notifications, set: setNotificationStore } =
    useNotificationStore.getState();

  const generateUniqueId = () => {
    // Simple method to generate a unique ID
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  setNotificationStore((state: { notifications: any[] }) => {
    const notificationWithId = {
      ...newNotification,
      id: generateUniqueId(), // Assigning a unique ID
    };

    state.notifications = [...notifications, notificationWithId];
  });
}
