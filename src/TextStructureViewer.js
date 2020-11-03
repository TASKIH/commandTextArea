import React, {useCallback, useContext, useMemo, useState} from 'react';
import {fade, makeStyles} from "@material-ui/core";
import {EditorTextParserContext} from "./context/EditorTextParserContext";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Button from "@material-ui/core/Button";
import SearchIcon from '@material-ui/icons/Search';
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Link from "@material-ui/core/Link";
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";
import Popper from "@material-ui/core/Popper";
import MenuList from "@material-ui/core/MenuList";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";

const useStyles = makeStyles(theme => ({
    header: {

    },
    baseDiv: {
        paddingTop: "10px",
        height: "calc(100% - 32px)",
        position: "relative",
        overflow: "auto",
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
        textAlign: "left"
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
    markerWater: {
        background: "linear-gradient(transparent 0%, #99ccff 0%)"
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
const REGEXP_PREFIX = "##regexp"

const TextStructureViewer = React.forwardRef(({
                                            }, ref ) => {
    const classes = useStyles();
    const [state, setState] = useState({
        mode: ViewMode.All,
        searchInputText: "",
        searchWord: "",
    });
    const [anchorEl, setAnchorEl] = React.useState(null);

    const menuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const menuClose = useCallback(() => {
        setAnchorEl(null);
    }, []);
    const onSimilarDash = useCallback(() => {
        const searchRegexpWord = REGEXP_PREFIX + " −−|--|ーー|ｰｰ";
        setState(prev => ({
            ...prev,
            searchInputText: searchRegexpWord,
            searchWord: searchRegexpWord
        }));
        menuClose();
    }, [menuClose]);
    const onSearchWordClear = useCallback(() => {
        setState(prev => ({
            ...prev,
            searchInputText: "",
            searchWord: ""
        }));
        menuClose();
    }, [menuClose]);
    const [textStructure, ] = useContext(EditorTextParserContext);

    const isRegExp = useCallback((searchWord) => {
        return searchWord.indexOf(REGEXP_PREFIX) === 0;
    }, []);
    // Text検索
    const searchText = useCallback((text, searchWord) => {
        if (!text || text.length === 0) {
            return "";
        }
        let indexOfText = 0
        let highlightLength = searchWord.length;
        if (isRegExp(searchWord)) {
            const regexpWord = searchWord.substr(REGEXP_PREFIX.length, searchWord.length + 1);
            indexOfText = text.search(regexpWord);
            highlightLength = 0;
        } else {
            indexOfText = text.indexOf(searchWord);
        }
        if (indexOfText < 0) {
            return "";
        }
        const leftIndex = Math.max(0, indexOfText - 20);
        const rightIndex = Math.min(text.length, indexOfText + 20);
        const leftLeader = (leftIndex !== 0)? "……" : "";
        const rightLeader = (rightIndex !== text.length)? "……" : "";

        return {
            left: leftLeader + text.substring(leftIndex, indexOfText),
            target: text.substring(indexOfText, indexOfText + highlightLength),
            right: text.substring(indexOfText + highlightLength, rightIndex) + rightLeader,
            isHighlightText: true
        };
    }, [isRegExp]);

    const textStructureSort = (firstElm, secondElm) => {
        return firstElm["index"] - secondElm["index"];
    };
    // 検索結果
    const searchResult = useMemo(() => {
        if (Object.keys(textStructure).length !== 4) {
            return [];
        }
        if (!state.searchWord || state.searchWord.length === 0) {
            return [];
        }
        const searchTarget = textStructure[0].concat(textStructure[1], textStructure[2], textStructure[3]);
        if (!searchTarget || searchTarget.length === 0) {
            return searchTarget;
        }
        const filtered = searchTarget.filter((currentValue) => {
            const searched = searchText(currentValue["text"].content, state.searchWord);
            return (searched.length !== 0);
        });
        const mapped = filtered.map(elem => {
            const searched = searchText(elem["text"].content, state.searchWord);
            return {
                text: searched,
                index: elem["index"],
                anchor: elem["anchor"]
            };
        });
        return mapped.sort(textStructureSort);
    }, [searchText, textStructure, state.searchWord]);

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
                        <Link key={idx} href={"#" + elm.anchor}>
                            <Paper className={classes.paper}>
                                <Grid container wrap="nowrap" spacing={2}>
                                    <Grid item>
                                        {elm.text.isHighlightText && (
                                           <React.Fragment>
                                               <span>{elm.text.left}</span>
                                               <span className={classes.markerWater}>{elm.text.target}</span>
                                               <span>{elm.text.right}</span>
                                           </React.Fragment>
                                        )}
                                        {!elm.text.isHighlightText && (
                                            <span>{elm.text.content}</span>
                                        )}
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Link>
                    )
                })}
            </div>
        )
    }, [classes.markerWater, classes.paper]);

    const onSearchInputTextChanged = useCallback((ev) => {
        ev.persist();
        setState(prev => ({
            ...prev,
            searchInputText: ev.target.value,
        }));
    }, []);
    const onSearch = useCallback(() => {
        setState(prev => ({
            ...prev,
            searchWord: state.searchInputText,
        }));
    }, [state.searchInputText]);
    const onKeyDownSearch = useCallback((ev) => {
        if (ev.key === 'Enter') {
            ev.preventDefault();
            onSearch();
        }
    }, [onSearch]);
    // 検索コンテナーの作成
    const searchContainer = useMemo(() => {
        return (
            <React.Fragment>
                <div className={classes.search}>
                    <Grid container>
                        <Grid item xs={2}>
                            <div className={classes.searchIcon}>
                                <SearchIcon />
                            </div>
                        </Grid>
                        <Grid item xs={7}>
                            <TextField
                                fullWidth
                                placeholder="Search…"
                                value={state.searchInputText}
                                inputProps={{ 'aria-label': 'search' }}
                                onKeyPress={onKeyDownSearch}
                                onChange={onSearchInputTextChanged}
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <Button aria-controls="simple-menu"
                                    aria-haspopup="true"
                                    variant="outlined"
                                    onClick={onSearch}>
                                検索
                            </Button>
                            <Button aria-controls="simple-menu"
                                    aria-haspopup="true"
                                    variant="outlined"
                                    onClick={menuOpen}>
                                ...
                            </Button>
                            <Popper open={Boolean(anchorEl)}
                                    anchorEl={anchorEl}
                                    role={undefined} transition disablePortal
                                    anchororigin={{
                                        vertical: 'bottom',
                                        horizontal: 'center',
                                    }}
                                    transformorigin={{
                                        vertical: 'top',
                                        horizontal: 'center',
                                    }}>
                                <Paper>
                                    <ClickAwayListener onClickAway={menuClose}>
                                        <MenuList>
                                            <MenuItem onClick={onSearchWordClear}>クリア</MenuItem>
                                            <MenuItem onClick={onSimilarDash}>二倍長音と二倍ハイフンで検索</MenuItem>
                                        </MenuList>
                                    </ClickAwayListener>
                                </Paper>
                            </Popper>
                        </Grid>
                    </Grid>
                </div>
                <div>
                    {generateResults(searchResult)}
                </div>
            </React.Fragment>
        )
    }, [anchorEl, classes.search, classes.searchIcon, generateResults, menuClose,
        onKeyDownSearch, onSearch, onSearchInputTextChanged, onSearchWordClear, onSimilarDash, searchResult, state.searchInputText]);

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