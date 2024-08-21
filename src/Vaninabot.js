import React, { useEffect, useRef, useState } from "react";
import { Container, Jumbotron, Button, Input, Row, Col, InputGroup, InputGroupAddon, Card, CardHeader, CardBody, Alert, Spinner, UncontrolledTooltip } from "reactstrap";
import { AIResponse } from "./constants";
import VaninaImage from "./cveta.jpg";

let botRespondingTimeout = null;
let botResponses = [];

const VaninaBot = (props) => {
    const [chat, setChat] = useState([]);
    const [isResponding, setIsResponding] = useState(false);
    const [userMessage, setUserMessage] = useState("");

    const MESSAGE_TYPE = {
        INCOMING: "INC",
        OUTGOING: "OUT"
    }

    const inputRef = useRef(null);

    useEffect(() => {
        botResponses = prepareAIResponsesByChance(AIResponse);
    }, []);

    useEffect(() => {
        if (chat.length > 0) {
            const lastIndex = chat.length - 1;
            const lastMessage = chat[lastIndex];
            if (lastMessage.type === MESSAGE_TYPE.OUTGOING) {
                sendBotMessage(lastMessage.text);
            }
        }
    }, [chat])

    const prepareAIResponsesByChance = (responses) => {
        const result = [];
        responses.forEach((response) => {
            if (response.chance) {
                for (let i = 1; i <= response.chance; i++) {
                    result.push(response);
                }
            } else {
                result.push(response);
            }
        });
        return result;
    }

    const addMessage = (text, options) => {
        const newChat = [...chat];
        newChat.push({
            text: text,
            type: options.type,
            date: new Date().getTime()
        })
        setChat(newChat);
        window.scrollTo(0, document.body.scrollHeight);
    }

    const sendUserMessage = () => {
        addMessage(userMessage, {
            type: MESSAGE_TYPE.OUTGOING
        });
        setUserMessage("");
    }

    const sendBotMessage = (text) => {
        setIsResponding(true);
        if (botRespondingTimeout) clearTimeout(botRespondingTimeout);
        botRespondingTimeout = setTimeout(() => {
            addMessage(generateResponse(text), {
                type: MESSAGE_TYPE.INCOMING
            });
            setIsResponding(false);
        }, 4500);
    }

    const generateResponse = (text) => {
        const possibleResponses = botResponses;
        console.log("POOL", possibleResponses);
        const matchResponses = possibleResponses.filter((resp) => resp.match);
        const nonMatchResponses = possibleResponses.filter((resp) => !resp.match);

        const foundMatches = [];
        matchResponses.forEach((resp) => {
            let foundMatch = false;
            resp.match.forEach((match) => {
                if (text.toLowerCase().indexOf(match.toLowerCase()) > -1) {
                    foundMatch = true;
                }
            });
            if (foundMatch) {
                foundMatches.push(resp)
            }
        });

        let result = null;
        if (foundMatches.length > 0) {
            result = foundMatches[Math.floor(Math.random() * foundMatches.length)]
        } else {
            result = nonMatchResponses[Math.floor(Math.random() * nonMatchResponses.length)]
        }

        return result.response;
    }

    return (
        <Container>
            <Jumbotron>
                <h1>VANINABOT.</h1>
                <p className="lead">Cveta Vanina Dinchiyska</p>

                <img height={"250px"} width={"auto"} src={VaninaImage} alt="Avatar" />
            </Jumbotron>

            <Row className="justify-content-center">
                <Col lg="6" sm="12">
                   {/*  <Row className="pt-2 pb-2">
                        <Col>
                            <table className="avatar-header">
                                <tbody>
                                    <tr>
                                        <td><img src={VaninaImage} alt="Avatar" /></td>
                                        <td>VANINABOT.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </Col>
                    </Row> */}
                    <Row>
                        <Col>
                            {chat.length > 0 && <Card>
                                <CardBody>
                                    <Row>
                                        <Col>
                                            {chat.map((message, i) => {
                                                const key = "chat_msg_" + i;
                                                const messageClasses = ["chat-message"];
                                                switch (message.type) {
                                                    case MESSAGE_TYPE.INCOMING:
                                                        messageClasses.push("message-incoming");
                                                        break;
                                                    case MESSAGE_TYPE.OUTGOING:
                                                        messageClasses.push("message-outgoing");
                                                        break;
                                                    default:
                                                        break;
                                                }
                                                const isFromBot = message.type === MESSAGE_TYPE.INCOMING;
                                                return <Row key={key} className={messageClasses.join(" ")}>
                                                    <Col className={isFromBot ? "pb-2 pt-2" : ""}>
                                                        <Alert id={key} color={!isFromBot ? "info" : "secondary"}>
                                                            {message.text}
                                                        </Alert>
                                                        <UncontrolledTooltip target={key} placement={isFromBot ? "right" : "left"}>
                                                            Sent by {isFromBot ? "VANINABOT" : "you"} @ {new Date(message.date).toLocaleTimeString()}
                                                        </UncontrolledTooltip>
                                                    </Col>
                                                </Row>
                                            })}
                                            {isResponding && <Row className={"chat-message message-incoming"}>
                                                <Col>
                                                    <Alert color={"secondary"}>
                                                        <Spinner type="grow" color="primary" />
                                                        <Spinner type="grow" color="primary" />
                                                        <Spinner type="grow" color="primary" />
                                                    </Alert>
                                                </Col>
                                            </Row>}
                                        </Col>
                                    </Row>
                                </CardBody>
                            </Card>}
                        </Col>
                    </Row>
                    <Row className="mt-2" style={{ paddingBottom: "50px" }}>
                        <Col>
                            <InputGroup>
                                <Input placeholder={"New Message"} ref={inputRef} onKeyPress={(e) => {
                                    if (e.key === "Enter") sendUserMessage();
                                }} value={userMessage} onChange={(e) => setUserMessage(e.target.value)} type="text" />
                                <InputGroupAddon addonType="append">
                                    <Button disabled={userMessage === ""} onClick={sendUserMessage} color="primary">Send</Button>
                                </InputGroupAddon>
                            </InputGroup>
                        </Col>
                    </Row>
                </Col>
            </Row>

        </Container>
    );
}

export default VaninaBot;
