import React, {useMemo} from 'react';
import {makeStyles} from "@material-ui/core";
import clsx from "clsx";


const useStyles = makeStyles(theme => ({
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
                                                   anchorPrefix="link"}, ref) => {
    const classes = useStyles();
    const renderElements = useMemo(() => {
        const spliced = text.split("\n");
        let pageNumber = 1;
        const tagDict = {};
        const elements = spliced.map((txt ,i) => {
            const tagResult = getTagResult(txt, i, anchorPrefix);
            let tag = TAG_KIND.NO;
            if (txt.length === 0) {
                tag in tagDict || (tagDict[tag] = []);
                tagDict[tag].push(tagResult);
                txt = " ";
            } else {
                tag = getTagKind(txt);
                tag in tagDict || (tagDict[tag] = []);
                tagDict[tag].push(tagResult);
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
        if (onBackgroundChanged) {
            onBackgroundChanged(tagDict);
        }
        return elements;
    }, [classes.backgroundTextField, text]);
    return useMemo(() => {
        return (
            <React.Fragment>
                <div className={classes.backgroundBase}>
                    {renderElements}
                </div>
            </React.Fragment>);
    }, [classes.backgroundBase, renderElements]);
});

export default NoteBackgroundEditor;