import React, { useRef, useState, useReducer } from "react";
import Layout, { BaseScreenProps } from "../components/appShell/Layout";

interface ScannerState {
  linesOfText: String[][];
  urls: String[];
  error?: String;
  data: any;
  status: "Idle" | "Loading" | "Error" | "Success";
}

function reducer(state: ScannerState, action): ScannerState {
  switch (action.type) {
    case "reset":
      return {
        ...state,
        linesOfText: [],
        urls: [],
        status: action.status || "Idle",
        error: "",
        data: null,
      };
    case "start":
      return {
        ...state,
        status: "Loading",
      };
    case "error":
      return {
        ...state,
        linesOfText: [],
        urls: [],
        status: "Error",
        error: action.error,
        data: action.data,
      };
    case "success":
      return {
        ...state,
        error: "",
        data: action.data,
        linesOfText: action.linesOfText,
        urls: action.urls,
        status: "Success",
      };
  }
}
let initialState: ScannerState = {
  linesOfText: [],
  urls: [],
  error: "",
  data: null,
  status: "Idle",
};

export default function Scanner({ location }: BaseScreenProps) {
  let fileInputRef = useRef(null);
  let previewRef = useRef(null);
  let [state, dispatch] = useReducer(reducer, initialState);
  console.log(state);
  const onFileChange = async function(event) {
    dispatch({ type: "reset" });
    if (fileInputRef.current.files && fileInputRef.current.files.length) {
      dispatch({ type: "start" });
      let binary = await getBinaryImageFromFileInput(fileInputRef.current);
      let data = await fetchOcrData(binary);
      if (!data.regions) {
        dispatch({ type: "Error", data, error: data.message });
      }
      let linesOfText = parseDataResponse(data);
      let urls = findUrls(linesOfText);
      dispatch({
        type: "success",
        linesOfText,
        urls,
      });
    }
  };
  let previewSrc =
    previewRef.current &&
    fileInputRef.current &&
    fileInputRef.current.files &&
    URL.createObjectURL(fileInputRef.current.files[0]);
  return (
    <Layout>
      <>
        <h1>Url Scanner</h1>
        <form>
          <input
            onChange={onFileChange}
            ref={fileInputRef}
            type="file"
            name="imageToScan"
            accept="image/*"
            capture="environment"
          />
        </form>
        <div className="main">
          <div>
            {/* <button type="submit">Scan</button> */}
            {state.error && <div className="error">{state.error}</div>}
            {state.status === "Loading" && <div>Loading...</div>}
            {state.status === "Success" && (
              <>
                <h2>Urls</h2>
                <Urls urls={state.urls} />
                <h2>Lines of Text</h2>
                <pre>{state.linesOfText.map((line) => line.join(" ")).join("\n")}</pre>
              </>
            )}
          </div>
          <div>
            <img ref={previewRef} src={previewSrc} />
          </div>
        </div>
      </>
    </Layout>
  );
}

function Urls({ urls }) {
  if (!urls) return <div></div>;
  if (!urls.length) return <div>No urls found</div>;
  return (
    <ol>
      {urls.map((url) => (
        <li key={url}>
          <a href={url} target="_blank">
            {url}
          </a>
        </li>
      ))}
    </ol>
  );
}

const subscriptionKey = "f0681cbe987441aab1b076c2028b30e1";
const endpoint = "https://eastus.api.cognitive.microsoft.com/";
const getEndpoint = () => {
  return `${endpoint}/vision/v1.0/ocr?language=en`;
};

const findUrls = function(linesOfText: string[][]): string[] {
  var urlExpression = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
  var strictUrlExpression = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
  var urlRegex = new RegExp(strictUrlExpression);

  return linesOfText
    .flat()
    .map((word) => word.match(urlRegex))
    .filter(Boolean)
    .map((match) => match[0]);
};

const parseDataResponse = function(data: OcrResponseData): string[][] {
  return data.regions.reduce((allLines, region) => {
    let regionLines = region.lines.map((line) => {
      return line.words.map((word) => word.text);
    });
    return allLines.concat(regionLines);
  }, []);
};
const fetchOcrData = async function(binaryImage): Promise<OcrResponseData> {
  let data = (await fetch(getEndpoint(), {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": subscriptionKey,
      "Content-Type": "application/octet-stream",
    },
    body: binaryImage,
  }).then((res) => res.json())) as OcrResponseData;
  return data;
};

const getBinaryImageFromFileInput = async function(fileInput): Promise<Uint8Array> {
  if (!fileInput || !fileInput.files || !fileInput.files.length) {
    return null;
  }
  return new Promise((resolve, reject) => {
    let fileReader = new FileReader();
    fileReader.onload = function() {
      resolve(new Uint8Array(fileReader.result as any));
    };
    fileReader.readAsArrayBuffer(fileInput.files[0]);
  });
};

interface OcrWord {
  boundingBox: string;
  text: string;
}
interface RegionLine {
  boundingBox: string;
  words: OcrWord[];
}

interface OcrRegion {
  boundingBox: string;
  lines: RegionLine[];
}
interface OcrResponseData {
  language: string;
  regions: OcrRegion[];
  message?: string;
}
