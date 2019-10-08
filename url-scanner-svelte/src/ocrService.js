const subscriptionKey = "f0681cbe987441aab1b076c2028b30e1";
const endpoint = "https://eastus.api.cognitive.microsoft.com/vision/v1.0/ocr?language=en";

export const findUrls = function(linesOfText) {
  var urlExpression = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
  var strictUrlExpression = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
  var urlRegex = new RegExp(strictUrlExpression);

  return linesOfText
    .flat()
    .map((word) => word.match(urlRegex))
    .filter(Boolean)
    .map((match) => match[0]);
};

export const getBinaryFromFileInput = async function(fileInput) {
  if (!fileInput || !fileInput.files || !fileInput.files.length) {
    return null;
  }
  return new Promise((resolve, reject) => {
    let fileReader = new FileReader();
    fileReader.onload = function() {
      resolve(new Uint8Array(fileReader.result));
    };
    fileReader.readAsArrayBuffer(fileInput.files[0]);
  });
};

const parseDataResponse = function(data) {
  return data.regions.reduce((allLines, region) => {
    let regionLines = region.lines.map((line) => {
      return line.words.map((word) => word.text);
    });
    return allLines.concat(regionLines);
  }, []);
};
const fetchOcrData = async function(binaryImage) {
  try {
    let data = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": subscriptionKey,
        "Content-Type": "application/octet-stream",
      },
      body: binaryImage,
    }).then((res) => res.json());
    return data;
  } catch (err) {
    alert(err);
  }
};

export default {
  findUrls,
  getBinaryFromFileInput,
  fetchOcrData,
  parseDataResponse,
};
