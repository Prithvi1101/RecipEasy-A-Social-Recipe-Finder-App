// app.js
async function identifyFood() {
  const input = document.getElementById("file-input");
  const file = input.files[0];
  if (!file) return alert("Please select a food image.");

  const reader = new FileReader();
  reader.onload = async function () {
    const base64Image = reader.result.split(',')[1];

    // Show image preview
    document.getElementById("image-preview").innerHTML = `<img src="${reader.result}" />`;

    const payload = {
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Identify this food. Name it, list ingredients, and explain preparation." },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
          ]
        }
      ],
      model: "deepseek-vl"
    };

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "sk-08589c2c88504181a5cfb317b58dad0a"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || "No response.";
    document.getElementById("result").innerText = result;
  };

  reader.readAsDataURL(file);
}
