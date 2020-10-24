import React, {useCallback, useContext, useMemo, useState} from 'react';
import {fade, makeStyles} from "@material-ui/core";
import {EditorTextParserContext} from "./context/EditorTextParserContext";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Button from "@material-ui/core/Button";
import InputBase from "@material-ui/core/InputBase";
import SearchIcon from '@material-ui/icons/Search';
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";

const useStyles = makeStyles(theme => ({
    header: {

    },
    baseDiv: {
        position: "relative"
    },
    textField: {
        background: "transparent",
    },
    search: {
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: fade(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: fade(theme.palette.common.white, 0.25),
        },
        marginLeft: 0,
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            marginLeft: theme.spacing(1),
            width: 'auto',
        },
    },
    paper: {
        maxWidth: 400,
        margin: `${theme.spacing(1)}px auto`,
        padding: theme.spacing(2),
    },
    searchIcon: {
        padding: theme.spacing(0, 2),
        height: '100%',
        position: 'absolute',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputRoot: {
        color: 'inherit',
    },
    inputInput: {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            width: '12ch',
            '&:focus': {
                width: '20ch',
            },
        },
    },
}));

const ViewMode = {
    All: 0,
    Comments: 1,
    Page: 2,
    TODOs: 3,
    Search: 4,
};

const TextStructureViewer = React.forwardRef(({
                                            }, ref ) => {
    const classes = useStyles();
    const [state, setState] = useState({
        mode: ViewMode.All,
        searchWord: "",
    });
    const preventDefault = (event) => event.preventDefault();
    const [textStructure, ] = useContext(EditorTextParserContext);

    // Text検索
    const searchText = useCallback((text, searchWord) => {
        const indexOfText = text.indexOf(searchWord);
        if (indexOfText < 0) {
            return "";
        }
        const leftIndex = Math.max(0, indexOfText - 5);
        const rightIndex = Math.min(text.length - 1, indexOfText + 5);

        return text.substring(leftIndex, rightIndex);
    }, []);

    const textStructureSort = (firstElm, secondElm) => {
        return firstElm["index"] - secondElm["index"];
    };
    // 検索結果
    const searchResult = useMemo(() => {
        if (Object.keys(textStructure).length !== 4) {
            return [];
        }
        const searchTarget = textStructure[0].concat(textStructure[1], textStructure[2], textStructure[3]);
        if (searchTarget.length === 0) {
            return searchTarget;
        }
        const filtered = searchTarget.filter((currentValue) => {
            const searched = searchText(currentValue["text"]);
            return (searched.length !== 0);
        });
        const mapped = filtered.map((elem) => {
            const searched = searchText(elem["text"]);
            filtered.push({
                text: searched,
                index: elem["index"],
                anchor: elem["anchor"]
            });
        });
        return mapped.sort(textStructureSort);
    }, [searchText, textStructure]);

    // フィルターされた文章構造
    const filteredTextStructure = useMemo(() => {
        if (Object.keys(textStructure).length !== 4) {
            return [];
        }
        if (state.mode === ViewMode.All) {
            return textStructure[1].concat(textStructure[2], textStructure[3]).sort(textStructureSort);
        } else if (state.mode === ViewMode.Page) {
            return textStructure[2].sort(textStructureSort);
        } else if (state.mode === ViewMode.TODOs) {
            return textStructure[3].sort(textStructureSort);
        }
        return [];
    }, [state.mode, textStructure]);

    // モードを切り替える
    const switchMode = useCallback((mode) => {
        setState(prev => (
            {
                ...prev,
                mode: mode
            }
        ));
    }, []);
    // モード変更ボタン部分を生成する
    const modeSwitch = useMemo(() => {
        return (
            <React.Fragment>
                <ButtonGroup>
                    <Button onClick={() => switchMode(ViewMode.All)}>All</Button>
                    <Button onClick={() => switchMode(ViewMode.Comments)}>Comments</Button>
                    <Button onClick={() => switchMode(ViewMode.Page)}>Page</Button>
                    <Button onClick={() => switchMode(ViewMode.TODOs)}>TODOs</Button>
                    <Button onClick={() => switchMode(ViewMode.Search)}>Search</Button>
                </ButtonGroup>
            </React.Fragment>
        );
    }, [switchMode]);

    // 構造コンテナの結果部分を生成する
    const generateResults = useCallback((results) => {
        return (
            <div>
                {results.map((elm, idx) => {
                    return (
                        <Link key={idx} href={"#" + elm.anchor} onClick={preventDefault}>
                            <Paper className={classes.paper}>
                                <Grid container wrap="nowrap" spacing={2}>
                                    <Grid item>
                                        <Typography>{elm.text}</Typography>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Link>
                    )
                })}
            </div>
        )
    }, [classes.paper]);

    // 検索コンテナーの作成
    const searchContainer = useMemo(() => {
        return (
            <React.Fragment>
                <div className={classes.search}>
                    <div className={classes.searchIcon}>
                        <SearchIcon />
                    </div>
                    <InputBase
                        placeholder="Search…"
                        classes={{
                            root: classes.inputRoot,
                            input: classes.inputInput,
                        }}
                        inputProps={{ 'aria-label': 'search' }}
                    />
                </div>
                <div>
                    {generateResults(searchResult)}
                </div>
            </React.Fragment>
        )
    }, [classes.inputInput, classes.inputRoot, classes.search, classes.searchIcon, generateResults, searchResult]);

    // 文章構造コンテナー
    const structureContainer = useMemo(() => {
        return (
            <React.Fragment>
                {generateResults(filteredTextStructure)}
            </React.Fragment>
        )
    }, [filteredTextStructure, generateResults]);

    return useMemo(() => {
        return (
            <React.Fragment>
                <div className={classes.header}>
                    {modeSwitch}
                </div>
                <div className={classes.baseDiv}>
                    {state.mode === ViewMode.Search && (
                        <React.Fragment>
                            {searchContainer}
                        </React.Fragment>
                    )}
                    {state.mode !== ViewMode.Search && (
                        <React.Fragment>
                            {structureContainer}
                        </React.Fragment>
                    )}
                </div>
            </React.Fragment>
        );
    }, [classes.baseDiv, classes.header, modeSwitch, searchContainer, state.mode, structureContainer]);
});

export default TextStructureViewer;