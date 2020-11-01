import React from 'react';
import './App.css';
import NoteConnectEditor from "./NoteConnectEditor";
import {EditorTextParserContextProvider} from "./context/EditorTextParserContext";
import TextStructureViewer from "./TextStructureViewer";
import SplitPane from "react-split-pane";
import {makeStyles} from "@material-ui/core";

const useStyles = makeStyles(theme => ({
    paneDiv: {
        height: "100%",
        "overflow-y": "scroll",
        "overflow-x": "hidden",
    },
    textLayerDiv: {
    },
}));
function App() {
    const classes = useStyles();
  return (
      <div className="App">
          <EditorTextParserContextProvider>
              <SplitPane split="vertical" defaultSize={800}>
                  <div className={classes.paneDiv}>
                      <p>aaaa</p>
                      <p>aaaa</p>
                      <p>aaaa</p>
                      <p>aaaa</p>
                      <p>aaaa</p>
                      <div className={classes.textLayerDiv}>
                          <NoteConnectEditor/>
                      </div>
                  </div>
                <TextStructureViewer/>
              </SplitPane>
          </EditorTextParserContextProvider>
      </div>
  );
}

export default App;
