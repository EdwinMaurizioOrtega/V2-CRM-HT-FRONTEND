// @mui
import {Stack, Button, Typography, Box, List, ListItem, ListItemText, TextField} from '@mui/material';
// auth
import { useAuthContext } from '../../../auth/useAuthContext';
// locales
import { useLocales } from '../../../locales';
// routes
import { PATH_DOCS } from '../../../routes/paths';
import {useEffect, useLayoutEffect, useRef, useState} from "react";
import {io} from "socket.io-client";

// ----------------------------------------------------------------------

export default function NavDocs() {
  const { user } = useAuthContext();

  const { translate } = useLocales();

    const [messages, setMessages] = useState([]);
    const [coordinates, setCoordinates] = useState([])

    const [input, setInput] = useState("");
    const [currentRoom, setCurrentRoom] = useState("General");
    const [currentRoomMap, setCurrentRoomMap] = useState("Lidenar");
    const [name, setName] = useState(null);
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const onceRef = useRef(false);

    const [countriesData, setCountriesData] = useState([]);

    const listRef = useRef(null);

    useLayoutEffect(() => {
        // Scroll hasta abajo
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [messages]); // Ajusta el scroll cuando cambien los mensajes
    useEffect(() => {
        setMessages([]);
        socket?.emit("join", currentRoom);
    }, [currentRoom]);

    useEffect(() => {
        if (onceRef.current) {
            return;
        }

        onceRef.current = true;

        //const socket = io("ws://localhost:80");
        const socket = io("wss://ss.lidenar.com");
        setSocket(socket);

        // CHAT

        socket.on("connect", () => {
            console.log("Connected to socket server");
            setName(`anon-${socket.id}`);
            setConnected(true);
            console.log("joining room", currentRoom);

            socket.emit("join", currentRoom);
        });

        socket.on("message", (msg) => {
            console.log("Message received AAA", msg);
            msg.date = new Date(msg.date);
            setMessages((messages) => [...messages, msg]);
        });

        socket.on("messages", (msgs) => {
            console.log("Messages received BBB", msgs);
            let messages = msgs.messages.map((msg) => {
                msg.date = new Date(msg.date);
                return msg;
            });
            setMessages(messages);

        });

    }, []);

    const sendMessage = (e) => {
        e.preventDefault();
        socket?.emit("message", {
            text: input,
            room: currentRoom,
            user_name: user.DISPLAYNAME,
        });
        setInput("");
    };

  return (
    <Stack
      spacing={3}
      sx={{
        px: 5,
        pb: 5,
        // mt: 10,
        width: 1,
        display: 'block',
        textAlign: 'center',
      }}
    >
      {/*<Box component="img" src="/assets/illustrations/illustration_docs.svg" />*/}

        <div>
            {/*<Typography gutterBottom variant="subtitle1">*/}
            {/*  {`${translate('docs.hi')}, ${user?.DISPLAYNAME}`}*/}
            {/*</Typography>*/}

            {/*<Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'pre-line' }}>*/}
            {/*  {`${translate('docs.description')}`}*/}
            {/*</Typography>*/}
            <h3>ChatLidenar</h3>


                    <List ref={listRef} style={{maxHeight: '300px', overflowY: 'auto'}}>
                        {messages?.map((msg, index) => (
                            <ListItem key={index} alignItems="flex-start">
                                <ListItemText
                                    primary={msg.user_name}
                                    secondary={
                                        <>
                                            <Typography
                                                component="span"
                                                variant="body2"
                                                color="textPrimary"
                                            >
                                                {msg.date.toLocaleString()}
                                            </Typography>
                                            <br/>
                                            <Typography
                                                component="span"
                                                variant="body1"
                                                color="textPrimary"
                                            >
                                                {msg.text}
                                            </Typography>
                                        </>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>

                <form className="flex h-11" onSubmit={sendMessage}>
                    <div style={{display: 'flex', justifyContent: 'space-between', width: '100%'}}>
                        <TextField
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            fullWidth
                            placeholder="Escribe un mensaje..."
                            style={{marginRight: '8px'}} // Espacio entre el TextField y el Button
                        />
                    </div>
                </form>

        </div>

        {/*<Button href="https://chat.whatsapp.com/JSLQG7XaGCT1wq7wLNbWJl" target="_blank" rel="noopener"*/}
        {/*        variant="contained">*/}
        {/*    WhatsApp*/}
        {/*    /!* {`${translate('docs.documentation')}`} *!/*/}
        {/*</Button>*/}
    </Stack>
  );
}
