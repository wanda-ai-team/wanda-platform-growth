import { useState, useRef, useEffect, Key } from 'react'
import Head from 'next/head'
import styles from '../../styles/Chat.module.css'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import { changeTwitterThread } from '@/utils/api/text/changeTwitterThread'

const Chat = ({ selectedTweets, twitterThreadText, setTwitterThreadTextPerTweet }: { selectedTweets: any; twitterThreadText: any; setTwitterThreadTextPerTweet: any; }) => {

    const [userInput, setUserInput] = useState("");
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<any[]>([
        {
            "message": "Hi there! What do you want to change?",
            "type": "apiMessage"
        }
    ]);

    const messageListRef = useRef<any>(null);
    const textAreaRef = useRef<any>(null);

    // Auto scroll chat to bottom
    useEffect(() => {
        const messageList = messageListRef.current;
        if(messageList){
            messageList.scrollTop = messageList.scrollHeight;
        }
    }, [messages]);

    // Focus on text field on load
    useEffect(() => {
        textAreaRef.current.focus();
    }, []);

    // Handle errors
    const handleError = () => {
        setMessages((prevMessages: any) => [...prevMessages, { "message": "Oops! There seems to be an error. Please try again.", "type": "apiMessage" }]);
        setLoading(false);
        setUserInput("");
    }

    // Handle form submission
    const handleSubmit = async (e: { preventDefault: () => void }) => {
        e.preventDefault();

        if (userInput.trim() === "") {
            return;
        }

        setMessages((prevMessages: any) => [...prevMessages, { "message": userInput, "type": "userMessage" }]);

        const indexes: (string | number)[] = [];
        const tweets: (string | number)[] = [];
        
        let userRequest = userInput + " ";
        selectedTweets.forEach((tweet: any, index: string | number) => {
            if (tweet) {
                userRequest += twitterThreadText[index] + " ";
                indexes.push(index);
                tweets.push(twitterThreadText[index]);
            }
        });

        setMessages((prevMessages: any) => [...prevMessages, { "message": "Changing tweet", "type": "apiMessage" }]);

        const reponseConvert = await changeTwitterThread(userRequest, tweets[0]);

        if (!reponseConvert.success) {
            handleError();
            return;
        } else {
            setMessages((prevMessages: any) => [...prevMessages, { "message": "Tweet correctly changed", "type": "apiMessage" }]);
        }

        let newArr = [...twitterThreadText];
        indexes.forEach((index: any) => {
            newArr[index] = reponseConvert.content;
        });
        setTwitterThreadTextPerTweet(newArr);

        setUserInput("");
    };

    // Prevent blank submissions and allow for multiline input
    const handleEnter = (e: { key: string; shiftKey: any; preventDefault: () => void }) => {
        if (e.key === "Enter" && userInput) {
            if (!e.shiftKey && userInput) {
                handleSubmit(e);
            }
        } else if (e.key === "Enter") {
            e.preventDefault();
        }
    };

    // Keep history in sync with messages
    useEffect(() => {
        if (messages.length >= 3) {
            setHistory([[messages[messages.length - 2].message, messages[messages.length - 1].message]]);
        }
    }, [messages])

    return (
        <main >
            <div className={styles.cloud}>
                <div ref={messageListRef} className={styles.messagelist}>
                    {messages.map((message: { type: string; message: string }, index: Key | null | undefined) => {
                        return (
                            // The latest message sent by the user will be animated while waiting for a response
                            <div key={index} className={message.type === "userMessage" && loading && index === messages.length - 1 ? styles.usermessagewaiting : message.type === "apiMessage" ? styles.apimessage : styles.usermessage}>
                                {/* Display the correct icon depending on the message type */}
                                {message.type === "apiMessage"
                                    ?
                                    <Image src="/assets/icons/wanda.png" alt="AI" width="30" height="30" className={styles.boticon} priority={true} />
                                    :
                                    <Image src="/assets/icons/usericon.png" alt="Me" width="30" height="30" className={styles.usericon} priority={true} />
                                }
                                <div className={styles.markdownanswer}>
                                    {/* Messages are being rendered in Markdown format */}
                                    <ReactMarkdown linkTarget={"_blank"}>{message.message}</ReactMarkdown>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
            <div className={styles.center}>

                <div className={styles.cloudform}>
                    <form onSubmit={handleSubmit}>
                        <textarea
                            disabled={loading}
                            onKeyDown={handleEnter}
                            ref={textAreaRef}
                            autoFocus={false}
                            rows={1}
                            maxLength={512}
                            id="userInput"
                            name="userInput"
                            placeholder={loading ? "Waiting for response..." : "Type your question..."}
                            value={userInput}
                            onChange={e => setUserInput(e.target.value)}
                            className={styles.textarea}
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className={styles.generatebutton}
                        >
                            {loading ? <div className={styles.loadingwheel}> </div> :
                                // Send icon SVG in input field
                                <svg viewBox='0 0 20 20' className={styles.svgicon} xmlns='http://www.w3.org/2000/svg'>
                                    <path d='M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z'></path>
                                </svg>}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    )
}

export default Chat;