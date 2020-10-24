import React from 'react';
import './App.css';
import NoteConnectEditor from "./NoteConnectEditor";
import {EditorTextParserContextProvider} from "./context/EditorTextParserContext";
import TextStructureViewer from "./TextStructureViewer";
import SplitPane from "react-split-pane";

function App() {
  return (
      <div className="App">
          <EditorTextParserContextProvider>
              <SplitPane split="vertical" defaultSize={800}>
                <NoteConnectEditor/>
                <TextStructureViewer/>
              </SplitPane>
          </EditorTextParserContextProvider>
      </div>
  );
}

export default App;
