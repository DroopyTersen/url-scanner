<script>
  import ImagePicker from "./ImagePicker.svelte";
  import ocr from "./ocrService";
  export let name;
  let linesOfText = [];
  let error = "";
  let urls = [];

  async function onFileChange(binaryData) {
    linesOfText = [];
    urls = [];
    error = "";
    let ocrData = await ocr.fetchOcrData(binaryData);
    if (!ocrData.regions) {
      error = ocrData.message;
    } else {
      linesOfText = ocr.parseDataResponse(ocrData);
      urls = ocr.findUrls(linesOfText);
    }
  }
</script>

<style>
  h1 {
    text-align: center;
  }
</style>

<h1>Url Scanner</h1>
<ImagePicker onChange={onFileChange} />
<h2>Urls</h2>
<ol>
  {#each urls as url}
    <li key={url}>
      <a href={url} target="_blank">{url}</a>
    </li>
  {/each}
</ol>
<h2>Lines of Text</h2>
<pre>{linesOfText.map((line) => line.join(' ')).join('\n')}</pre>
<div>{error}</div>
