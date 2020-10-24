import React, {createContext, useState} from 'react';

const initialState = {
    0: [],
    1: [],
    2: [],
    3: []
};

export const EditorTextParserContext = createContext(initialState);

export function EditorTextParserContextProvider(props) {
    const [value, setValue] = useState({
        0: [],
        1: [],
        2: [],
        3: []
    });

    return (
        <EditorTextParserContext.Provider value={[value, setValue]}>
            {props.children}
        </EditorTextParserContext.Provider>
    );
}