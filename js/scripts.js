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
    if (Object.keys(zip.files).length === sizes.length + 1) {
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
    link.textContent = `Download ${name}`;
    resultsDiv.appendChild(link);
  };

  sizes.forEach(({ name, size, removeBg }) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = size;
    canvas.height = size;
    ctx.drawImage(img, 0, 0, size, size);

    if (removeBg) {
      removeBackground(ctx, canvas);
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

  // manifest.json dosyasını ekle
  const manifestContent = `{
    "name": "App",
    "icons": [
      {
        "src": "/android-icon-36x36.png",
        "sizes": "36x36",
        "type": "image/png",
        "density": "0.75"
      },
      {
        "src": "/android-icon-48x48.png",
        "sizes": "48x48",
        "type": "image/png",
        "density": "1.0"
      },
      {
        "src": "/android-icon-72x72.png",
        "sizes": "72x72",
        "type": "image/png",
        "density": "1.5"
      },
      {
        "src": "/android-icon-96x96.png",
        "sizes": "96x96",
        "type": "image/png",
        "density": "2.0"
      },
      {
        "src": "/android-icon-144x144.png",
        "sizes": "144x144",
        "type": "image/png",
        "density": "3.0"
      },
      {
        "src": "/android-icon-192x192.png",
        "sizes": "192x192",
        "type": "image/png",
        "density": "4.0"
      }
    ]
  }`;
  const manifestBlob = new Blob([manifestContent], {
    type: "application/json",
  });
  zip.file("manifest.json", manifestBlob);
}

function removeBackground(ctx, canvas) {
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i] > 200 && data[i + 1] > 200 && data[i + 2] > 200) {
      data[i + 3] = 0;
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

function copyCode() {
  const codeElement = document.getElementById("codeContent");
  const textArea = document.createElement("textarea");
  textArea.value = codeElement.textContent;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  document.body.removeChild(textArea);
}
