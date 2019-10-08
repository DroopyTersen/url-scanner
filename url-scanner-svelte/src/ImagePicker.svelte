<script>
  export let onChange;
  import { getBinaryFromFileInput } from "./ocrService";
  let imagePreviewStyle = "";

  async function onFileChange(event) {
    if (event.target && event.target.files && event.target.files.length) {
      updatePreview(event.target);
      let binary = await getBinaryFromFileInput(event.target);
      console.log(binary);
      onChange(binary);
    }
  }

  const updatePreview = function(fileInput) {
    if (!fileInput || !fileInput.files || !fileInput.files.length) return;
    let reader = new FileReader();
    reader.onloadend = function() {
      imagePreviewStyle = "background-image: url(" + reader.result + ")";
    };
    reader.readAsDataURL(fileInput.files[0]);
  };
</script>

<style>
  .drop-container {
    width: 100%;
  }
</style>

<div class="drop-container">
  <label class="dropimage" style={imagePreviewStyle}>
    <input
      title="Drop image or click me"
      type="file"
      on:change={onFileChange}
      accept="image/*"
      capture="environment" />
  </label>
</div>
