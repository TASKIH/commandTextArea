import React, {useCallback, useEffect, useMemo, useState} from 'react';
import TextField from "@material-ui/core/TextField";
import {makeStyles} from "@material-ui/core";
import clsx from "clsx";

const useStyles = makeStyles(theme => ({
    baseDiv: {
      position: "relative"
    },
    textField: {
        background: "transparent",
    },
    backgroundBase: {
        position: "absolute",
        textAlign: "left",
        backgroundColor: "aliceBlue",
        padding: "18.5px 14px",
        height: "100%",
        width: "100%",
        "-moz-box-sizing": "border-box",
        boxSizing: "border-box"
    },
    backgroundTextField: {
        lineHeight: "1.4em",
        fontSize: "1rem",
        fontFamily: `"Roboto", "Helvetica", "Arial", sans-serif`,
        fontWeight: 400,
        letterSpacing: "0.00938em",
        overflow: "auto",
        whiteSpace: "pre-wrap",
        wordWrap: "break-word",
        margin: 0,
        "text-rendering": "auto",
        color: "transparent"
    },
    comment: {
        backgroundColor: "rgba(0, 0, 0, 0.08)",
    },
    page: {
        backgroundColor: "rgba(0, 0, 0, 0.08)",
        color: "#5a5a5a"
    },
    todo: {
        backgroundColor: "#fff0e0",
    },
    divElement: {
    }
}));

const TAG_KIND = {
    NO: 0,
    Comment: 1,
    Page: 2,
    TODO: 3
};

const getTagKind = (text) => {
  if (text.length < 2) {
      return TAG_KIND.NO;
  }
  if (text[0] === "#") {
      const parsed = text.split(/#|\s/);
      if (parsed.length < 2) {
          return TAG_KIND.Comment;
      }
      if (parsed[1].toUpperCase() === "TODO") {
          return TAG_KIND.TODO;
      } else if (parsed[1].toUpperCase() === "P") {
          return TAG_KIND.Page;
      }
      return TAG_KIND.Comment
  }
};
const NoteBackgroundEditor = React.forwardRef(({text}, ref) => {
    const classes = useStyles();
    const renderElements = useMemo(() => {
        const spliced = text.split("\n");
        let pageNumber = 1;
        const elements = spliced.map((txt ,i) => {
            let tag = TAG_KIND.NO;
            if (txt.length === 0) {
                txt = " ";
            } else {
                tag = getTagKind(txt);
                if (tag === TAG_KIND.Page) {
                    pageNumber += 1;
                    txt = "  　　　　　(↓ " + pageNumber + "ページ目)"
                }
            }
            const className = clsx(classes.backgroundTextField,
                tag === TAG_KIND.Page && classes.page,
                tag === TAG_KIND.Comment && classes.comment,
                tag === TAG_KIND.TODO && classes.todo,);

            return (
                <pre key={i} className={className}>
                {txt}
                </pre>);
        });
        return elements;
    }, [classes.backgroundTextField, text]);
    return useMemo(() => {
        console.log("reload");
        return (
            <React.Fragment>
                <div className={classes.backgroundBase}>
                    {renderElements}
                </div>
            </React.Fragment>);
    }, [classes.backgroundBase, renderElements]);
});

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
    return useMemo(() => {
        return (
            <React.Fragment>
                <div className={classes.baseDiv}>
                    <NoteBackgroundEditor text={textModifyState.childInputText}/>
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