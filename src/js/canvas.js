const canvas = document.getElementById("canvas");
      const canvasContainer = document.getElementById("canvasContainer");
      const toolbar = document.getElementById("toolbar");
      const ctx = canvas.getContext("2d");

      // Large canvas size for infinite feel
      canvas.width = 5000;
      canvas.height = 5000;

      // Pan state
      let panOffset = { x: -2150, y: -2150 }; // Center on viewport initially
      let isPanning = false;
      let panStart = { x: 0, y: 0 };
      let isPainting = false;
      let currentStroke = [];
      let isSpacePressed = false;
      let history = [];
      let historyStep = -1;
      let touchStartDistance = 0;

      // Apply initial transform
      canvas.style.transform = `translate(${panOffset.x}px, ${panOffset.y}px)`;

      // Save initial state
      const saveState = () => {
        historyStep++;
        if (historyStep < history.length) {
          history.length = historyStep;
        }
        history.push(canvas.toDataURL());
      };

      const undo = () => {
        if (historyStep > 0) {
          historyStep--;
          const img = new Image();
          img.src = history[historyStep];
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
          };
        }
      };

      saveState();

      toolbar.addEventListener("click", (e) => {
        if (e.target.id === "clear") {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      });

      toolbar.addEventListener("change", (e) => {
        if (e.target.id === "stroke") {
          ctx.strokeStyle = e.target.value;
        }
      });

      // Convert screen coordinates to canvas coordinates
      const getCanvasCoords = (clientX, clientY) => {
        const rect = canvas.getBoundingClientRect();
        return {
          x: clientX - rect.left,
          y: clientY - rect.top,
        };
      };

      const draw = (e) => {
        if (!isPainting || isPanning) return;
        const coords = getCanvasCoords(e.clientX, e.clientY);
        currentStroke.push(coords);
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
      };

      canvasContainer.addEventListener("mousedown", (e) => {
        if (e.button === 2) {
          // Right click - pan mode
          isPanning = true;
          panStart = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
          canvasContainer.classList.add("panning");
          e.preventDefault();
        } else if (e.button === 0) {
          // Left click - draw mode
          isPainting = true;
          currentStroke = [];
          const coords = getCanvasCoords(e.clientX, e.clientY);
          ctx.beginPath();
          ctx.moveTo(coords.x, coords.y);
        }
      });

      canvasContainer.addEventListener("mouseup", (e) => {
        if (isPanning && e.button === 2) {
          isPanning = false;
          canvasContainer.classList.remove("panning");
          canvasContainer.style.cursor = "crosshair";
        }

        if (isPainting && e.button === 0) {
          isPainting = false;
          ctx.stroke();
          ctx.beginPath();
          saveState();
          if (currentStroke.length > 0 && typeof sendStroke === "function") {
            sendStroke({
              points: currentStroke,
              color: ctx.strokeStyle,
            });
          }
        }
      });

      canvasContainer.addEventListener("mousemove", (e) => {
        if (isPanning) {
          panOffset.x = e.clientX - panStart.x;
          panOffset.y = e.clientY - panStart.y;
          canvas.style.transform = `translate(${panOffset.x}px, ${panOffset.y}px)`;
        } else if (isPainting) {
          draw(e);
        }
      });

      // Prevent context menu on right click
      canvasContainer.addEventListener("contextmenu", (e) =>
        e.preventDefault(),
      );

      // Ctrl+Z for undo
      document.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "z") {
          undo();
          e.preventDefault();
        }
      });

      // Touch support
      const getTouchDistance = (touches) => {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
      };

      canvasContainer.addEventListener("touchstart", (e) => {
        if (e.touches.length === 2) {
          // Two finger - pan mode
          isPanning = true;
          const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
          const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
          panStart = { x: midX - panOffset.x, y: midY - panOffset.y };
          touchStartDistance = getTouchDistance(e.touches);
          e.preventDefault();
        } else if (e.touches.length === 1) {
          // One finger - draw mode
          isPainting = true;
          currentStroke = [];
          const coords = getCanvasCoords(
            e.touches[0].clientX,
            e.touches[0].clientY,
          );
          ctx.beginPath();
          ctx.moveTo(coords.x, coords.y);
          e.preventDefault();
        }
      });

      canvasContainer.addEventListener("touchmove", (e) => {
        if (isPanning && e.touches.length === 2) {
          const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
          const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
          panOffset.x = midX - panStart.x;
          panOffset.y = midY - panStart.y;
          canvas.style.transform = `translate(${panOffset.x}px, ${panOffset.y}px)`;
          e.preventDefault();
        } else if (isPainting && e.touches.length === 1) {
          const coords = getCanvasCoords(
            e.touches[0].clientX,
            e.touches[0].clientY,
          );
          currentStroke.push(coords);
          ctx.lineWidth = 2;
          ctx.lineCap = "round";
          ctx.lineTo(coords.x, coords.y);
          ctx.stroke();
          e.preventDefault();
        }
      });

      canvasContainer.addEventListener("touchend", (e) => {
        if (isPanning) {
          isPanning = false;
        }

        if (isPainting) {
          isPainting = false;
          ctx.stroke();
          ctx.beginPath();
          saveState();
          if (currentStroke.length > 0 && typeof sendStroke === "function") {
            sendStroke({
              points: currentStroke,
              color: ctx.strokeStyle,
            });
          }
        }
        e.preventDefault();
      });

      // Initial cursor
      canvasContainer.style.cursor = "crosshair";