function generateFavicons() {
  const fileInput = document.getElementById("imageFile");
  if (!fileInput.files.length) {
    alert("Please select an image file.");
    return;
  }
  const file = fileInput.files[0];
  const img = new Image();
  img.src = URL.createObjectURL(file);
  img.onload = () => {
    processImage(img);
    URL.revokeObjectURL(img.src);
  };
  document.getElementById("whatsNext").hidden = false;
  document.getElementById("resultContainer").hidden = false;
}

function processImage(img) {
  const selectedOption = document.querySelector(
    'input[name="faviconOptions"]:checked'
  ).value;

  const multipleSizes = [
    { name: "android-chrome-192x192.png", size: 192, removeBg: true },
    { name: "android-chrome-512x512.png", size: 512, removeBg: true },
    { name: "apple-touch-icon.png", size: 180, removeBg: false },
    { name: "favicon.ico", size: 32, removeBg: true },
    { name: "favicon-16x16.png", size: 16, removeBg: true },
    { name: "favicon-32x32.png", size: 32, removeBg: true },
    { name: "mstile-150x150.png", size: 150, removeBg: true },
  ];

  const singleSize = [{ name: "favicon-16x16.png", size: 16, removeBg: true }];

  const sizes = selectedOption === "multiple" ? multipleSizes : singleSize;

  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";
  const zip = new JSZip();

  const addFileToZip = (name, blob) => {
    zip.file(name, blob);
    if (Object.keys(zip.files).length === sizes.length) {
      zip.generateAsync({ type: "blob" }).then((content) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(content);
        link.download = "favicons.zip";
        link.textContent = "Download Favicons Zip";
        resultsDiv.appendChild(link);
      });
    }
  };

  const downloadSingleFile = (name, blob) => {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = name;
    link.textContent = "Download favicon-16x16.png";
    resultsDiv.appendChild(link);
  };

  sizes.forEach(({ name, size, removeBg }) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = size;
    canvas.height = size;
    ctx.drawImage(img, 0, 0, size, size);

    if (removeBg) {
      removeBackground(canvas);
    }

    canvas.toBlob(
      (blob) => {
        if (selectedOption === "multiple") {
          addFileToZip(name, blob);
        } else {
          downloadSingleFile(name, blob);
        }
      },
      name.endsWith(".ico") ? "image/x-icon" : "image/png"
    );
  });
}

function removeBackground(canvas) {
  const ctx = canvas.getContext("2d");
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i] > 200 && data[i + 1] > 200 && data[i + 2] > 200) {
      data[i + 3] = 0;
    }
  }

  ctx.putImageData(imgData, 0, 0);
}
