const data = [
      { id: 1, name: "Devansh", email: "devansh@example.com" },
      { id: 2, name: "Aman", email: "aman@example.com" },
      { id: 3, name: "Riya", email: "riya@example.com" }
    ];

    const container = document.getElementById("items-container");
    const dropZone = document.getElementById("drop-zone");
    const output = document.getElementById("output");

    // Render draggable items
    data.forEach((item, index) => {
      const div = document.createElement("div");
      div.className = "item";
      div.textContent = item.name;
      div.setAttribute("draggable", "true");
      div.setAttribute("data-json", JSON.stringify(item));

      // Drag start
      div.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("application/json", e.target.dataset.json);
      });

      container.appendChild(div);
    });

    // Drop zone events
    dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropZone.classList.add("hover");
    });

    dropZone.addEventListener("dragleave", () => {
      dropZone.classList.remove("hover");
    });

    dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropZone.classList.remove("hover");

      const jsonData = e.dataTransfer.getData("application/json");
      const parsed = JSON.parse(jsonData);

      output.innerText = `ID: ${parsed.id}\nName: ${parsed.name}\nEmail: ${parsed.email}`;
    });