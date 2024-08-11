"use client";
import { Box, Button, Stack, TextField, Typography, Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { ThumbUp, ThumbDown } from "@mui/icons-material";
import { useState } from "react";
import { marked } from "marked";

export default function Home() {
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: "Ask away...",
        },
    ]);
    const [message, setMessage] = useState("");
    const [openAbout, setOpenAbout] = useState(false);
    const [openFeedback, setOpenFeedback] = useState(false);
    const [feedbackText, setFeedbackText] = useState("");
    const [feedbackType, setFeedbackType] = useState(null);

    const sendMessage = async () => {
        if (!message.trim()) return;

        const userPrompt = { prompt: message };

        setMessages((messages) => [
            ...messages,
            { role: "user", content: message },
        ]);

        setMessage("");

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userPrompt),
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            let result = "";
            await reader.read().then(function processText({ done, value }) {
                if (done) {
                    return result;
                }
                const text = decoder.decode(value || new Uint8Array(), {
                    stream: true,
                });

                try {
                    const jsonResponse = JSON.parse(text);
                    if (jsonResponse.data) {
                        const markdownContent = marked(jsonResponse.data);
                        setMessages((messages) => [
                            ...messages,
                            { role: "assistant", content: markdownContent },
                        ]);
                    } else {
                        console.error(
                            "Error: 'data' field is missing in the response."
                        );
                    }
                } catch (error) {
                    console.error(
                        "Error parsing JSON or converting markdown:",
                        error
                    );
                }

                return reader.read().then(processText);
            });
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const submitFeedback = () => {
        // Handle feedback submission (send to server, log, etc.)
        console.log("Feedback Type:", feedbackType);
        console.log("Feedback Text:", feedbackText);
        setOpenFeedback(false); // Close the feedback dialog after submission
        setFeedbackType(null); // Reset feedback type
        setFeedbackText(""); // Clear feedback text
    };

    return (
        <Box width="100vw" height="100vh" display="flex" flexDirection="column">

            {/* Top Right Buttons */}
            <Box
                display="flex"
                justifyContent="flex-end"
                p={2}
                position="absolute"
                top={0}
                right={0}
            >
                <Button variant="contained" sx={{ ml: 2 }} onClick={() => setOpenAbout(true)}>
                    About
                </Button>
                <Button variant="contained" sx={{ ml: 2 }} onClick={() => setOpenFeedback(true)}>
                    Feedback
                </Button>
            </Box>

            {/* About Dialog */}
            <Dialog open={openAbout} onClose={() => setOpenAbout(false)}>
                <DialogTitle>About</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        I am an AI-powered customer support assistant for Headstarter, a premier platform dedicated to computer science (CS) students and professionals. At Headstarter, we offer a Software Engineering (SWE) fellowship program and provide extensive resources for interview practice. My role is to assist you by answering questions about the SWE fellowship, offering guidance on interview preparation, and helping you navigate the Headstarter website.
                    </Typography>
                </DialogContent>
            </Dialog>

            {/* Feedback Dialog */}
            <Dialog open={openFeedback} onClose={() => setOpenFeedback(false)}>
                <DialogTitle>Feedback</DialogTitle>
                <DialogContent>
                    <Box display="flex" justifyContent="center" mb={2}>
                        <IconButton
                            onClick={() => setFeedbackType("positive")}
                            color={feedbackType === "positive" ? "primary" : "default"}
                        >
                            <ThumbUp />
                        </IconButton>
                        <IconButton
                            onClick={() => setFeedbackType("negative")}
                            color={feedbackType === "negative" ? "primary" : "default"}
                        >
                            <ThumbDown />
                        </IconButton>
                    </Box>
                    <TextField
                        label="Your feedback"
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                    />
                    <Button
                        variant="contained"
                        sx={{ mt: 2 }}
                        fullWidth
                        onClick={submitFeedback}
                        disabled={!feedbackType && !feedbackText.trim()}
                    >
                        Submit Feedback
                    </Button>
                </DialogContent>
            </Dialog>

            {/* Main Chat Box */}
            <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                flexGrow={1}
            >
                <Stack
                    direction={"column"}
                    width="350px"
                    height="600px"
                    border="1px solid black"
                    borderRadius="10px"
                    p={2}
                    spacing={3}
                >
                    <Stack
                        direction={"column"}
                        spacing={1}
                        flexGrow={1}
                        overflow="auto"
                        maxHeight="100%"
                    >
                        {messages.map((message, index) => (
                            <Box
                                key={index}
                                display="flex"
                                justifyContent={
                                    message.role === "assistant"
                                        ? "flex-start"
                                        : "flex-end"
                                }
                            >
                                <Box
                                    bgcolor={
                                        message.role === "assistant"
                                            ? "primary.main"
                                            : "secondary.main"
                                    }
                                    color={
                                        message.role === "assistant"
                                            ? "#000000"
                                            : "#ffffff"
                                    }
                                    borderRadius={12}
                                    p={2}
                                    dangerouslySetInnerHTML={{
                                        __html: message.content,
                                    }}
                                />
                            </Box>
                        ))}
                    </Stack>
                    <Stack direction={"row"} spacing={2}>
                        <TextField
                            label="Message"
                            fullWidth
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <Button variant="contained" onClick={sendMessage}>
                            Send
                        </Button>
                    </Stack>
                </Stack>
            </Box>
        </Box>
    );
}
