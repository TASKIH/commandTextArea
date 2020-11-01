import React, {useCallback, useContext, useEffect, useMemo, useState} from 'react';
import TextField from "@material-ui/core/TextField";
import {makeStyles} from "@material-ui/core";
import NoteBackgroundEditor from "./NoteBackgroundEditor";
import {EditorTextParserContext} from "./context/EditorTextParserContext";
import TextareaAutosize from "@material-ui/core/TextareaAutosize";

const useStyles = makeStyles(theme => ({
    baseDiv: {
      position: "relative"
    },
    textDiv: {
        "border": 0,
        "margin": 0,
        "display": "inline-flex",
        "padding": 0,
        "position": "relative",
        "min-width": 0,
        "flex-direction": "column",
        "vertical-align": "top",
        width: "100%",
        "border-color": "rgba(0, 0, 0, 0.23)",
        "border-radius": "4px",
        "border-width": "1px",
        "border-style": "solid",
    },
    multiLineDiv: {
        "padding": "18.5px 14px",
        "position": "relative",
        "border-radius": "4px",
        "width": "100%",
        "color": "rgba(0, 0, 0, 0.87)",
        "cursor": "text",
        "display": "inline-flex",
        "font-size": "1rem",
        "box-sizing": "border-box",
        "align-items": "center",
        "font-family": `"Roboto", "Helvetica", "Arial", sans-serif`,
        "font-weight": 400,
        "line-height": "1.1876em",
        "letter-spacing": "0.00938em"
    },
    textField: {
        lineHeight: "1.4em",
        resize: "none",
        font: "inherit",
        color: "currentColor",
        width: "100%",
        border: 0,
        height: "1.1876em",
        margin: 0,
        display: "block",
        padding: "6px 0 7px",
        "min-width": 0,
        background: "none",
        "box-sizing": "content-box",
        "animation-name": "mui-auto-fill-cancel",
        "letter-spacing": "inherit",
        "animation-duration": "10ms",
        "-webkit-tap-highlight-color": "transparent",
        "outline": "0px",
    },
}));

const NoteConnectEditor = React.forwardRef(({
}, ref ) => {
    const classes = useStyles();
    const [inputText, setInputText] = useState("");
    const [textModifyState, setTextModifyState] = useState({
        childInputText: inputText,
        textChanged: false,
        needUpdate: false,
        prevInputTime: Date.now(),
    });
    const [textStructure, setTextStructure] = useContext(EditorTextParserContext);
    const lazyTime = 500 * 1;
    const updateInterval = 1000;

    useEffect(() => {
        if (!textModifyState.needUpdate) {
            return;
        }

        const isIdling = Date.now() - lazyTime > textModifyState.prevInputTime;
        if (textModifyState.textChanged && isIdling) {
            setTextModifyState(prev => ({
                ...prev,
                childInputText: inputText,
                needUpdate: false,
                textChanged: false
            }));
        } else {
            setTextModifyState(prev => ({
                ...prev,
                needUpdate: false
            }));
        }

    }, [textModifyState.needUpdate]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setTextModifyState(prev => ({
                ...prev,
                needUpdate: true
            }));
        }, updateInterval);

        return () => {
            clearInterval(intervalId);
        }
    }, []);
    const onTextChange = useCallback((event) => {
        setTextModifyState(prev => ({
            ...prev,
            textChanged: true,
            prevInputTime: Date.now()
        }));
        setInputText(event.target.value);
    }, []);
    const onBackgroundChanged = useCallback((tagResultDict) => {
        setTextStructure(tagResultDict);
    }, [setTextStructure]);
    return useMemo(() => {
        return (
            <React.Fragment>
                <div className={classes.baseDiv}>
                    <NoteBackgroundEditor
                        text={textModifyState.childInputText}
                        onBackgroundChanged={onBackgroundChanged}/>
                        <div className={classes.textDiv}>
                            <div className={classes.multiLineDiv}>

                                <TextareaAutosize value={inputText}
                                          onChange={onTextChange}
                                          className={classes.textField}/>
                            </div>
                        </div>
                </div>
            </React.Fragment>
        );
    }, [classes.baseDiv, classes.textField, inputText, onTextChange, textModifyState.childInputText]);
});

export default NoteConnectEditor;