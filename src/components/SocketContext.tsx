import React, {createContext, useContext, useState, useEffect} from 'react';
import Config from 'react-native-config';
import io, {Socket} from 'socket.io-client';

const SocketContext = createContext<Socket | null>(null);

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({
  children,
}: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Initialize the socket connection
    const socketConnection = io(`${Config.SOCKET_PROD}`);
    setSocket(socketConnection);

    // Cleanup on unmount
    return () => {
      socketConnection.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  const socket = useContext(SocketContext);

  if (!socket) {
    throw new Error('useSocket must be used within a SocketProvider');
  }

  return socket;
};
