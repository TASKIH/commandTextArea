import React, {useEffect, useMemo, useReducer, useRef, useState} from 'react';
import {makeStyles} from "@material-ui/core";
import clsx from "clsx";


const useStyles = makeStyles(theme => ({
    backgroundBase: {
        position: "absolute",
        textAlign: "left",
        padding: "18.5px 14px",
        marginTop: "6px",
        width: "100%",
        "font-kerning": "none",
        "-moz-box-sizing": "border-box",
        boxSizing: "border-box",
    },
    hidden: {
      visibility: "hidden",
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
    return TAG_KIND.NO;
};

const getTagResult = (text, index, anchorPrefix) => {
    return {
        text: text,
        index: index,
        anchor: anchorPrefix + "_" + index,
    };
};

const NoteBackgroundEditor = React.forwardRef(({
                                                   text,
                                                   onBackgroundChanged,
                                                   anchorPrefix="link",
                                                   hidden}, ref) => {
    const classes = useStyles();
    const [tagDict, setTagDict] = useState({0: [], 1: [], 2: [], 3:[]});
    const [currentText, setCurrentText] = useState(text);
    const backgroundRef = useRef(null);

    if (text !== currentText) {
        setCurrentText(text);
    }

    const renderElements = useMemo(() => {
        const spliced = currentText.split("\n");
        let pageNumber = 1;
        const newTagDict = {0: [], 1: [], 2: [], 3:[]};
        const elements = spliced.map((txt ,i) => {
            const tagResult = getTagResult(txt, i, anchorPrefix);
            let tag = TAG_KIND.NO;
            if (txt.length === 0) {
                tag in newTagDict || (newTagDict[tag] = []);
                newTagDict[tag].push(tagResult);
                txt = " ";
            } else {
                tag = getTagKind(txt);
                tag in newTagDict || (newTagDict[tag] = []);
                newTagDict[tag].push(tagResult);
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
                <pre key={i} className={className} id={tagResult.anchor}>
                {txt}
                </pre>);
        });
        setTagDict(newTagDict);
        return elements;
    }, [classes.backgroundTextField, currentText]);
    useEffect(() => {
        if (onBackgroundChanged) {
            let backgroundHeight = null;
            if (backgroundRef) {
               backgroundHeight = backgroundRef.current.clientHeight;
            }
            onBackgroundChanged(tagDict, backgroundHeight);
        }
    }, [onBackgroundChanged, tagDict, ref]);
    return useMemo(() => {
        return (
            <React.Fragment>
                <div className={clsx(classes.backgroundBase, hidden && classes.hidden)}
                ref={backgroundRef}>
                    {renderElements}
                </div>
            </React.Fragment>);
    }, [classes.backgroundBase, classes.hidden, hidden, backgroundRef, renderElements]);
});

export default NoteBackgroundEditor;