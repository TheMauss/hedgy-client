import { FC, useState, useEffect, useRef } from "react";
import socketIOClient from 'socket.io-client';
import { useWallet } from '@solana/wallet-adapter-react';
import HashLoader from "react-spinners/HashLoader";

const Chat: FC = () => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [input, setInput] = useState("");
    const { publicKey } = useWallet();
    const walletAddress = publicKey?.toString() || '';

    const ENDPOINT = 'https://frozen-hamlet-77237-31263ec4359d.herokuapp.com/';

    const socketRef = useRef(null);
    const messagesContainerRef = useRef(null);

    useEffect(() => {
      setIsLoading(true); // Begin loading state
      socketRef.current = socketIOClient(ENDPOINT);
      if (walletAddress !== '') {
        socketRef.current.emit('registerWallet', walletAddress);
      }

      socketRef.current.on("initialMessages", initialMessages => {
        console.log("Fetched messages: ", initialMessages); // Log fetched messages
        setMessages(initialMessages.reverse());
        setIsLoading(false); // End loading state
      });

      socketRef.current.on("newMessage", newMessage => {
        console.log("Received new message: ", newMessage); // Log received new message
        setMessages(prevMessages => [...prevMessages, newMessage]);
      });

      return () => {
        socketRef.current.disconnect();
      };
    }, [walletAddress]);

    useEffect(() => {
      const container = messagesContainerRef.current;
      if (container) {
        const observer = new MutationObserver(() => {
          setTimeout(() => {
            container.scrollTop = container.scrollHeight;
          }, 100); // adjust delay to your needs
        });
        observer.observe(container, { childList: true, subtree: true });  // Note the addition of "subtree: true"
        return () => {
          observer.disconnect();
        };
      }
    }, []);
    
    
    const handleInput = (e) => {
      setInput(e.target.value);
    };

    const sendMessage = () => {
        if (input.trim() === '') {
          return;
        }
      if (socketRef.current && walletAddress !== '') {
        const messageObject = { walletAddress: walletAddress, message: input };
        console.log("Sending message: ", messageObject); // Log sent message
        socketRef.current.emit("sendMessage", messageObject);
        setInput("");
      }
    };

    return (
      <div ref={messagesContainerRef} className="custom-scrollbar overflow-x-hidden lg:h-[26vh] sm:h-[300px] h-[400px] xl:w-[29.85%] lg:w-[29.75%] md:w-[49.65%] w-[100%] bg-[#232332] xl:order-5 lg:order-5 md:order-5 order-6 px-3 rounded shadow-component border-t-2 border-gray-500 mt-2">

            {/* Display the chat messages */}
            <div className="message-container overflow-y-auto flex-grow">
                {isLoading ? (
                    <div className="mt-20 mb-16 flex justify-center items-center">
                        <HashLoader color="#1a1a25" /> {/* Change color to match your design */}
                    </div>
                ) : (
                    messages.map((message, i) => (
                        <p key={i} className="text-slate-300 text-[0.84rem] xl:text-[0.9rem] lg:text-[0.9rem] md:text-[0.9rem] sm:text-[0.84rem]">
                            <strong>
                                {message.walletAddress.slice(0, 3) + '...' + message.walletAddress.slice(-2)}
                            </strong>: {message.message}
                        </p>
                    ))
                )}
            </div>

            {/* Input field for new messages */}
            <div className="sticky bottom-0">
                <form
                    onSubmit={(e) => {
                        e.preventDefault(); // prevent page reload
                        sendMessage();
                    }}
                    className="chat-input-container bg-[#232332]"
                >
                    <div className="input-cap mb-2 mt-2">
                        <input
                            value={input}
                            className="input-cap__input text-[0.95rem]"
                            onChange={handleInput}
                            placeholder={walletAddress ? "Type a message..." : "To send a message connect your wallet"}
                            disabled={!walletAddress}
                        />
                        <button onClick={sendMessage} className="input-cap__text font-semibold">SEND</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Chat;
