import React, {useCallback, useContext, useEffect, useMemo, useState} from 'react';
import TextField from "@material-ui/core/TextField";
import {makeStyles} from "@material-ui/core";
import NoteBackgroundEditor from "./NoteBackgroundEditor";
import {EditorTextParserContext} from "./context/EditorTextParserContext";
import TextareaAutosize from "@material-ui/core/TextareaAutosize";
import clsx from "clsx";

const useStyles = makeStyles(theme => ({
    baseDiv: {
        position: "relative",
    },
    backgroundTextDiv: {
        "border": 0,
        "margin": 0,
        "padding": 0,
        "position": "relative",
        "top": 0,
        "min-width": 0,
        "vertical-align": "top",
        width: "100%",
        "border-color": "transparent",
        "border-radius": "4px",
        "border-width": "1px",
        "border-style": "solid",
        "font-kerning": "none",
        minHeight: "120px",
        whiteSpace: "pre-wrap",
        overflowWrap: "break-word",
        boxSizing: "border-box",
        height: "auto",
        overflow: "hidden",
        visibility: "hidden"
    },
    backgroundText: {
        lineHeight: "1.4em",
        resize: "none",
        font: "inherit",
        width: "100%",
        border: 0,
        margin: 0,
        display: "block",
        padding: "6px 0 7px",
        "font-kerning": "none",
        "min-width": 0,
        background: "none",
        "box-sizing": "content-box",
        "animation-name": "mui-auto-fill-cancel",
        "letter-spacing": "inherit",
        "animation-duration": "10ms",
        "-webkit-tap-highlight-color": "transparent",
        "outline": "0px",
    },
    textDiv: {
        "border": 0,
        "margin": 0,
        "padding": 0,
        "top": 0,
        "position": "absolute",
        "min-width": 0,
        "flex-direction": "column",
        "vertical-align": "top",
        width: "100%",
        "border-color": "rgba(0, 0, 0, 0.23)",
        "border-radius": "4px",
        "border-width": "1px",
        "border-style": "solid",
        "height": "100%"
    },
    multiLineDiv: {
        "padding": "18.5px 14px",
        "position": "relative",
        "border-radius": "4px",
        "width": "100%",
        "height": "100%",
        "color": "rgba(0, 0, 0, 0.87)",
        "cursor": "text",
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
        overflow: "hidden",
        border: 0,
        height: "100%",
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
        "font-kerning": "none",
        "outline": "0px",
    },
}));

const NoteConnectEditor = React.forwardRef(({
    objectiveLineNumber
}, ref ) => {
    const classes = useStyles();
    const lineHeight = 1.4 * parseFloat(getComputedStyle(document.documentElement).fontSize);
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
    const objectiveLineHeight = (objectiveLineNumber || 100) * lineHeight;
    const [currentHeight, setCurrentHeight] = useState(objectiveLineHeight);
    const [backgroundLineHeight, setBackgroundLineHeight] = useState(objectiveLineHeight);

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
    const onBackgroundChanged = useCallback((tagResultDict, backgroundHeight) => {
        setTextStructure(tagResultDict);
        if (backgroundHeight) {
            setBackgroundLineHeight(backgroundHeight);
        }
    }, [setTextStructure]);
    const textArea = useMemo(() => {
        return (
            <textarea value={inputText}
                      onChange={onTextChange}
                      className={classes.textField}/>)
    }, [classes.textField, inputText, onTextChange]);
    const baseDivStyle = useMemo(() => {
        return {
            height: currentHeight + "px"
        };
    }, [currentHeight]);
    useEffect(() => {
        const objectiveHeight = (objectiveLineNumber || 100) * lineHeight;

        let nextObjectiveHeight = Math.max(backgroundLineHeight, objectiveHeight);
        if (nextObjectiveHeight > currentHeight) {
            nextObjectiveHeight = nextObjectiveHeight + 100 * lineHeight;
            setCurrentHeight(nextObjectiveHeight);
        } else if (nextObjectiveHeight + 200 * lineHeight < currentHeight) {
            nextObjectiveHeight = nextObjectiveHeight + 100 * lineHeight;
            if (objectiveHeight < nextObjectiveHeight) {
                setCurrentHeight(nextObjectiveHeight);
            }
        }
    }, [backgroundLineHeight, currentHeight, lineHeight, objectiveLineHeight, objectiveLineNumber]);
    return useMemo(() => {
        return (
            <React.Fragment>
                <div className={classes.baseDiv} style={baseDivStyle}>
                    <NoteBackgroundEditor
                        text={textModifyState.childInputText}
                        onBackgroundChanged={onBackgroundChanged}/>
                    <div className={classes.textDiv}>
                        <div className={classes.multiLineDiv}>
                            {textArea}
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }, [baseDivStyle, classes.baseDiv, classes.textField, inputText, onTextChange, textModifyState.childInputText]);
});

export default NoteConnectEditor;