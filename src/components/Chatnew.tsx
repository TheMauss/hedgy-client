import React, { FC, useState, useEffect, useRef } from "react";
  import socketIOClient from 'socket.io-client';
  import { useWallet } from '@solana/wallet-adapter-react';
  import HashLoader from "react-spinners/HashLoader";
  import Modal from 'react-modal';
  import { BiMicrophoneOff, BiSend, BiSolidSend, BiMicrophone } from "react-icons/bi";
  import CustomEmojis from "../components/emojis";


  interface WalletAddress {
    [address: string]: any;
  }

  // Custom hook for long press
  const useLongPress = (callback = null, ms = 300, walletAddress) => {
    const [startLongPress, setStartLongPress] = useState(false);
    const [cancelLongPress, setCancelLongPress] = useState(false);
  
    useEffect(() => {
      let timerId;
      if (startLongPress && callback && !cancelLongPress && walletAddress) {
        timerId = setTimeout(callback, ms);
      } else {
        clearTimeout(timerId);
      }
  
      return () => {
        clearTimeout(timerId);
      };
    }, [callback, ms, startLongPress, cancelLongPress, walletAddress]);
  
    return {
      cancel: () => setCancelLongPress(true),
      reset: () => setCancelLongPress(false),
      onMouseDown: () => setStartLongPress(true),
      onMouseUp: () => setStartLongPress(false),
      onMouseLeave: () => setStartLongPress(false),
      onTouchStart: () => setStartLongPress(true),
      onTouchEnd: () => setStartLongPress(false),
    };
  };

    const CustomEmojiPicker = ({ onEmojiClick }) => {
      return (
        <div>
          {CustomEmojis.map((emoji, index) => (
            <button key={index} onClick={() => onEmojiClick(emoji.name)}>
              <span className="emoji-wrapper p-1.5">
                <img src={emoji.src} alt={`Emoji ${index + 1}`} style={{ width: "25px", height: "25px" }} />
              </span>
            </button>
          ))}
        </div>
      );
    };

  const EmojiPickerModal = ({ isOpen, onClose, onEmojiClick, position }) => {
    return (
      <Modal
        isOpen={isOpen}
        onRequestClose={onClose}
        style={{
          overlay: {
            backgroundColor: "transparent",
          },
          content: {
            backgroundColor: "#1d202f",
            margin: "15% auto",
            padding: "20px",
            border: "1px solid #434665",
            width: "200px",
            height: "340px",
            position: "absolute",
            top: position?.top || "50%",
            left: position?.left || "65%",
            transform: "translate(-50%, -50%)",
          },
        }}
      >
        <style>
          {`
          .emoji-wrapper {
            font-size: 1rem; /* Set the font-size to match the text size */
            display: inline-block;
            vertical-align: middle;
          }
          .emoji-wrapper img {
            width: 1em;
            height: 1em;
          }
          `}
        </style>
        <CustomEmojiPicker onEmojiClick={onEmojiClick} />
      </Modal>
    );
  };  

  const Chat: FC = () => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [input, setInput] = useState("");
    const { publicKey } = useWallet();
    const walletAddress = publicKey?.toString() || '';
    const ENDPOINT2 = process.env.NEXT_PUBLIC_ENDPOINT2;
    const socketRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const emojiButtonRef = useRef(null);
    const [emojiPickerPosition, setEmojiPickerPosition] = useState(null);
    const [mutedUsers, setMutedUsers] = useState({});
    const inputRef = useRef(null);
    const mutedUsersRef = useRef({});  // Modify this line
    const [hovered, setHovered] = useState(false);
const [originalMessages, setOriginalMessages] = useState<WalletAddress>({});

    
    const muteUser = (walletAddressToMute) => {
      if (walletAddressToMute === walletAddress) {
        // Prevent users from muting themselves
        return;
      }
  
      setMessages((prevMessages) =>
      prevMessages.map((msg) => {
        if (msg.walletAddress === walletAddressToMute) {
          const mutedMessage = { ...msg, muted: !msg.muted };
          if (mutedMessage.muted) {
            mutedMessage.message = 'Muted Message';
            mutedMessage.elements = [{ type: "text" }];
          } else {
            mutedMessage.message = mutedUsers[walletAddressToMute]?.originalMessages[msg.id]?.message || msg.message;
            mutedMessage.elements = mutedUsers[walletAddressToMute]?.originalMessages[msg.id]?.elements || msg.elements;
          }
          return mutedMessage;
        } else {
          return msg;
        }
      })
    );

      
  
      setMutedUsers((prevMutedUsers) => {
        const newMutedUsers = { ...prevMutedUsers };
        if (newMutedUsers[walletAddressToMute]) {
          // User is already in the list, so toggle their muted status
          newMutedUsers[walletAddressToMute].muted = !newMutedUsers[walletAddressToMute].muted;
        } else {
          // User is not in the list, so add them and set their muted status to true
          newMutedUsers[walletAddressToMute] = { muted: true };
        }
        setOriginalMessages((prevOriginalMessages) => ({
          ...prevOriginalMessages,
          [walletAddressToMute]: messages.filter(
            (msg) => msg.walletAddress === walletAddressToMute
          ),
        }));
        mutedUsersRef.current = newMutedUsers; // Update the ref
        return newMutedUsers;
      });
      
    };
    
    const unmuteUser = (walletAddressToUnmute) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) => {
          if (msg.walletAddress === walletAddressToUnmute) {
            const unmutedMessage = { ...msg, muted: false };
            const originalMsg = originalMessages[walletAddressToUnmute]?.find((item) => item._id === msg._id);
            if (originalMsg) {
              unmutedMessage.message = originalMsg.message;
              unmutedMessage.elements = originalMsg.elements;
            }
            return unmutedMessage;
          } else {
            return msg;
          }
        })
      );
    
    
      setMutedUsers((prevMutedUsers) => {
        const newMutedUsers = { ...prevMutedUsers };
        if (newMutedUsers[walletAddressToUnmute]) {
          // Remove the muted user from the list
          delete newMutedUsers[walletAddressToUnmute];
        }
        setOriginalMessages((prevOriginalMessages) => {
          const { [walletAddressToUnmute]: deletedItem, ...rest } = prevOriginalMessages;
          return rest;
        });
        mutedUsersRef.current = newMutedUsers; // Update the ref
        return newMutedUsers;
      });
    };
    
    
    const longPressActions = useLongPress(() => {
      muteUser(walletAddress);
    }, 500, walletAddress);


    const toggleEmojiPicker = () => {
      if(walletAddress === '') {
        return;
      }
      
      if(emojiButtonRef.current) {
        const rect = emojiButtonRef.current.getBoundingClientRect();
        setEmojiPickerPosition({
          top: rect.top,
          left: rect.right,
        });
      }
      setModalIsOpen(!modalIsOpen);
    }
    

    useEffect(() => {
      setIsLoading(true); // Begin loading state
      socketRef.current = socketIOClient(ENDPOINT2);
      if (walletAddress !== '') {
        socketRef.current.emit('registerWallet', walletAddress);
      }

      socketRef.current.on("initialMessages", initialMessages => {
        setMessages(initialMessages.reverse());
        setIsLoading(false); // End loading state
      });

      socketRef.current.on("newMessage", newMessage => {
        // Only add the new message to the list if the sender is not muted
        if (!mutedUsersRef.current[newMessage.walletAddress]?.muted) {  // Use the ref here
          setMessages(prevMessages => [...prevMessages, newMessage]);
        }
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
          // Then remove focus from the input field
    };
    
    const handleEmojiClick = (emoji) => {
      setInput((prevInput) => prevInput + emoji);
      setModalIsOpen(false);
      inputRef.current.focus();
    };


    const processInput = (input) => {
      const emojiRegex = /\(([\w\s_]+)\)/g;
      const elements = [];
      let lastIndex = 0;
    
      input.replace(emojiRegex, (match, emojiName, index) => {
        if (index > lastIndex) {
          elements.push({ type: "text", value: input.substring(lastIndex, index).trim() });
        }
    
        const emoji = CustomEmojis.find((emoji) => emoji.name === match); // Use the full match (including parentheses) as the emoji name
        if (emoji) {
          elements.push({ type: "emoji", value: emoji.src });
        } else {
          console.log(`Emoji not found for name: ${match}`);
          elements.push({ type: "text", value: match }); // If emoji not found, push the entire match as text
        }
    
        lastIndex = index + match.length;
        return match; // Return the matched string as is, so that it doesn't get replaced by an empty string.
      });
    
      if (lastIndex < input.length) {
        elements.push({ type: "text", value: input.substring(lastIndex).trim() });
      }
    
      return elements.filter((el) => el.value !== "");
    };
    
    

    
    
    
    
    
    
    
    
// Modify this function
const sendMessage = () => {
  const trimmedInput = input.trim();
  if (trimmedInput === "") {
    return;
  }
  if (socketRef.current && walletAddress !== "") {
    const inputElements = processInput(trimmedInput); // Process the input here
    const messageObject = { walletAddress: walletAddress, message: trimmedInput, elements: inputElements };
    socketRef.current.emit("sendMessage", messageObject);
    setInput(""); // Clear the input
  }
};

const handleInputFocus: React.FocusEventHandler<HTMLInputElement> = (event) => {
  // Disables zooming
  document.querySelector('meta[name="viewport"]').setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0');
};

const handleInputBlur: React.FocusEventHandler<HTMLInputElement> = (event) => {
  // Enables zooming again
  document.querySelector('meta[name="viewport"]').setAttribute('content', 'width=device-width, initial-scale=1.0');
};

const customColors = [
  "#D35400", // Brighter shade of color 1
  "#28B463", // Brighter shade of color 2
  "#5D6D7E", // Brighter shade of color 3 (Adjusted for better visibility on dark backgrounds)
  "#AF7AC5", // Brighter shade of color 4
  "#52BE80", // Brighter shade of color 5
  "#6C3483", // Brighter shade of color 6 (Adjusted to be more distinguishable)
  "#F4D03F", // Brighter shade of color 7
  "#5DADE2", // Brighter shade of color 8
  "#E74C3C", // Brighter shade of color 9
  "#58D68D", // Brighter shade of color 10
];



// Function to get color for a wallet address
const getColorForWalletAddress = (walletAddress, colors) => {
  // Simple hashing function to get an index for the color
  let sum = 0;
  for (const char of walletAddress) {
    sum += char.charCodeAt(0);
  }
  const colorIndex = sum % colors.length;
  return colors[colorIndex];
};


return (
    <div className="w-full px-4 pb-1 flex flex-col custom-scrollbar overflow-x-hidden h-full  bg-[#232332] xl:order-5 lg:order-5 md:order-5 order-6 px-2 rounded-lg border-t border-b md:border border-layer-3 flex bg-layer-1">
              <div className="sticky top-0 flex items-center z-10">
          <h2 className="pt-4 pb-4 bankGothic leading-[18px] text-xl text-start text-grey-text">Chat</h2>
        </div>
      <div ref={messagesContainerRef} className="message-container overflow-y-auto custom-scrollbar">            
        {isLoading ? (
      <div className="mt-20 mb-16 flex justify-center items-center">
        <HashLoader color="#1a1a25" />
      </div>
    ) : (
      messages.map((message, i) => (
        <div
          key={i}
          className="py-2 rounded-md shadow-lg messageContainer custom-scrollbar"
          {...longPressActions}
        >
          <p 
              className="text-slate-300 text-[0.9rem] messageText" 
              style={{ display: "inline-flex", alignItems: "center", flexWrap: "wrap" }}
          >
                  <strong 
          className="font-semibold pr-1"
          style={{ color: getColorForWalletAddress(message.walletAddress, customColors) }} // Apply the color here
      >
              {message.walletAddress.slice(0, 3) + "..." + message.walletAddress.slice(-2)}:
            </strong>
            {message.elements.map((element, i) => {
  if (element.type === "text") {
    return <React.Fragment key={i}>{element.value}</React.Fragment>;
  } else if (element.type === "emoji") {
    return (
      <img
        key={i}
        src={element.value}
        alt="emoji"
        style={{ width: "25px", height: "25px", marginLeft: "5px", marginRight: "5px" }}
      />
    );
  }
  return null;
})}
            {message.muted ? "Muted Message" : null}
          </p>
          {walletAddress !== message.walletAddress && (
  <button
  className="muteButton text-slate-300"
  onClick={() =>
    mutedUsers[message.walletAddress]?.muted
      ? unmuteUser(message.walletAddress)
      : muteUser(message.walletAddress)
  }
>
  {mutedUsers[message.walletAddress]?.muted ? (
    <BiMicrophone className="mr-1" />
  ) : (
    <BiMicrophoneOff className="mr-1" />
  )}
</button>
)}

        </div>
      ))
          )}
   <div className="sticky absolute bottom-0 bg-layer-1">
      <form
        onSubmit={(e) => {
          e.preventDefault(); // prevent page reload
          sendMessage();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && !modalIsOpen) {
            e.preventDefault(); // prevent form submission
            sendMessage();
          }
        }}
        className="chat-input-container"
      >
          <div className="input-cap2 mb-2 mt-2 rounded bg-layer-2 box-border h-10 flex flex-row items-center justify-between text-base text-grey border-[1px] border-solid border-layer-3 hover:bg-[#484c6d5b]">
          <div className="pl-2">
          <button 
              onClick={(e) => {
                e.preventDefault(); // prevent form submission
                toggleEmojiPicker();
              }}
            >😀</button>

            <EmojiPickerModal
              isOpen={modalIsOpen}
              onClose={() => setModalIsOpen(false)}
              onEmojiClick={handleEmojiClick}
              position={emojiPickerPosition}
              />
            </div>
            
            <input
  ref={inputRef}
  value={input}
  className="input-cap2__input text-[0.95rem] mx-2 bg-[#282C40]"
  onChange={handleInput}
  onFocus={handleInputFocus}
  onBlur={handleInputBlur}
  placeholder={walletAddress ? "Type a message..." : "Connect to chat..."}
  disabled={!walletAddress}
/>

<button 
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={sendMessage} 
            className="input-cap2__text font-semibold bg-layer-1"
        >
            {hovered ? <BiSend/> : <BiSolidSend/>}
        </button>
                  </div>
        </form>
      </div>
    </div>
  </div>
)};

export default Chat;
