import React, {useCallback, useContext, useEffect, useMemo, useState} from 'react';
import TextField from "@material-ui/core/TextField";
import {makeStyles} from "@material-ui/core";
import NoteBackgroundEditor from "./NoteBackgroundEditor";
import {EditorTextParserContext} from "./context/EditorTextParserContext";

const useStyles = makeStyles(theme => ({
    baseDiv: {
      position: "relative"
    },
    textField: {
        background: "transparent",
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
                    <TextField
                        InputProps={{
                            style: {
                                lineHeight: "1.4em"
                            }
                        }}
                        onChange={onTextChange}
                        className={classes.textField}
                        fullWidth
                        variant="outlined"
                        value={inputText}
                        multiline/>
                </div>
            </React.Fragment>
        );
    }, [classes.baseDiv, classes.textField, inputText, onTextChange, textModifyState.childInputText]);
});

export default NoteConnectEditor;