{
    //code block is for anti-cheat
    const canvas = document.getElementById("gameField");
    const scoreEl = document.getElementById("score");
    const colorPicker = document.getElementById("colorPick");
    const scoreMultipierBar = document.getElementById("scoreMultipierBar");
    const zenModeBtn = document.getElementById("zenModeBtn");
    const scorePanel = document.getElementById("scorePanel");
    const gameVer = "1.3";

    const ctx = canvas.getContext("2d");
    const cellSize = 50;
    let fieldSize = parseInt(prompt("Введите разммер поля", 12));
    if (!fieldSize) fieldSize = 12;
    canvas.width = cellSize * fieldSize;
    scorePanel.style["width"] = canvas.width + "px";
    canvas.height = canvas.width;

    const colorPalletes = [
        ["#0081A7", "#00AFB9", "#FDFCDC", "#FED9B7", "#F07167"],
        ["#F4F1DE", "#E07A5F", "#3D405B", "#81B29A", "#F2CC8F"],
        ["#42033D", "#680E4B", "#7C238C", "#854798", "#7C72A0"],
        ["#57385c", "#a75265", "#ec7263", "#febe7e", "Plum"],
        ["SkyBlue", "teal", "orange", "khaki", "Plum"],
    ];
    colorPicker.setAttribute("max", colorPalletes.length - 1);

    let colorInd = 0;
    if (localStorage.getItem("colorCheme")) {
        colorInd = localStorage.getItem("colorCheme");
    }
    colorPicker.value = colorInd;
    let colors = colorPalletes[colorInd];

    let score = 0;
    let gameStart = false;
    let scoreMultipier = 70;

    class Cell {
        pos = [];
        collor;
        selected;
        matched;
        style;
        constructor(posX, posY) {
            this.pos[0] = posX;
            this.pos[1] = posY;
            this.style = Math.floor(Math.random() * colors.length);
            this.collor = colors[this.style];
            this.selected = false;
            this.matched = false;
        }
        switchSelect() {
            if (this.selected) {
                this.selected = false;
            } else this.selected = true;
        }
    }

    const fieldArray = (function () {
        let field = Array(fieldSize)
            .fill(0)
            .map((x) => Array(fieldSize).fill(0));
        for (let i = 0; i < fieldSize; i++) {
            for (let j = 0; j < fieldSize; j++) {
                field[i][j] = new Cell(i, j);
            }
        }
        return field;
    })();

    let selectionHandler = {
        hasHead: false,
        tail: undefined,
        head: undefined,
        checkSwappable(cell1, cell2) {
            if (cell2.pos[0] == cell1.pos[0]) {
                if (
                    (cell2.pos[1] == cell1.pos[1] - 1) |
                    (cell2.pos[1] == cell1.pos[1] + 1)
                ) {
                    return true;
                }
            } else if (cell2.pos[1] == cell1.pos[1]) {
                if (
                    (cell2.pos[0] == cell1.pos[0] - 1) |
                    (cell2.pos[0] == cell1.pos[0] + 1)
                ) {
                    return true;
                }
            }
            return false;
        },

        select(cell) {
            if (this.hasHead) {
                if (this.head == cell) {
                    console.log("same cell selected twise");
                    cell.switchSelect();
                    this.head = undefined;
                    this.hasHead = false;
                    this.tail = undefined;
                } else {
                    let tempHead = this.head;
                    this.head = cell;
                    this.tail = tempHead;

                    if (this.checkSwappable(this.head, this.tail)) {
                        timeG = 0;
                        [this.head.collor, this.tail.collor] = [
                            this.tail.collor,
                            this.head.collor,
                        ];
                        score -= 10;
                        checkAll();
                    }

                    //clear select
                    this.tail.switchSelect();
                    this.head = undefined;
                    this.hasHead = false;
                    this.tail = undefined;
                }
            } else {
                cell.switchSelect();
                this.head = cell;
                this.hasHead = true;
            }
        },
    };

    function drawCells() {
        ctx.clearRect(0, 0, canvas.clientHeight, canvas.clientWidth);
        for (let i = 0; i < fieldSize; i++) {
            for (let j = 0; j < fieldSize; j++) {
                ctx.fillStyle = fieldArray[i][j].collor;
                ctx.fillRect(cellSize * i, cellSize * j, cellSize, cellSize);
                ctx.strokeStyle = "black";
                ctx.strokeRect(cellSize * i, cellSize * j, cellSize, cellSize);
                if (fieldArray[i][j].selected == true) {
                    ctx.strokeStyle = "red";
                    ctx.strokeRect(
                        cellSize * i + 2,
                        cellSize * j + 2,
                        cellSize - 4,
                        cellSize - 4
                    );
                }
            }
        }
        scoreEl.textContent = score;
    }

    function clickHandler(event) {
        if (event.isTrusted) {
            gameStart = true;
            let clickedCells = getClickedCell(event);

            selectionHandler.select(
                fieldArray[clickedCells[0]][clickedCells[1]]
            );
            drawCells();
        } else {
            alert("N0 B0TS!");
        }
    }

    function getClickedCell(event) {
        const cellX = Math.floor((event.pageX - 8) / cellSize);
        const cellY = Math.floor((event.pageY - 8) / cellSize);
        return new Array(cellX, cellY);
    }

    function checkThreeInARowHor(x, y) {
        if (fieldArray[x][y].collor != "black") {
            if (
                (fieldArray[x][y].collor == fieldArray[x - 1][y].collor) &
                (fieldArray[x][y].collor == fieldArray[x + 1][y].collor)
            ) {
                return true;
            }
        }
        return false;
    }

    function checkThreeInARowVert(x, y) {
        // probably can be merged into 1 func using logical
        if (fieldArray[x][y].collor != "black") {
            if (
                (fieldArray[x][y].collor == fieldArray[x][y - 1].collor) &
                (fieldArray[x][y].collor == fieldArray[x][y + 1].collor)
            ) {
                return true;
            }
        }
        return false;
    }

    function deleteCell(x, y) {
        while (y >= 1) {
            fieldArray[x][y] = fieldArray[x][y - 1];
            y -= 1;
        }
        fieldArray[x][0] = new Cell(x, 0);
    }

    function checkAll() {
        let deletedCells = new Array();
        for (let i = 1; i < fieldSize - 1; i++) {
            for (let j = 0; j < fieldSize; j++) {
                fieldArray[i][j].pos[0] = i;
                fieldArray[i][j].pos[1] = j;
                if (checkThreeInARowHor(i, j)) {
                    deletedCells.push(fieldArray[i - 1][j]);
                    deletedCells.push(fieldArray[i][j]);
                    deletedCells.push(fieldArray[i + 1][j]);
                }
            }
        }
        for (let i = 0; i < fieldSize; i++) {
            for (let j = 1; j < fieldSize - 1; j++) {
                fieldArray[i][j].pos[0] = i;
                fieldArray[i][j].pos[1] = j;
                if (checkThreeInARowVert(i, j)) {
                    deletedCells.push(fieldArray[i][j - 1]);
                    deletedCells.push(fieldArray[i][j]);
                    deletedCells.push(fieldArray[i][j + 1]);
                }
            }
        }
        fieldArray[fieldSize - 1][fieldSize - 1].pos[0] = fieldSize - 1;
        fieldArray[fieldSize - 1][fieldSize - 1].pos[1] = fieldSize - 1;
        fieldArray[0][fieldSize - 1].pos[0] = 0;
        fieldArray[0][fieldSize - 1].pos[1] = fieldSize - 1;

        deletedCells.forEach((element) => {
            element.collor = "black";
            if (gameStart) {
                if (scoreMultipier < 100) scoreMultipier += 2;
                score += Math.floor(0.5 * scoreMultipier);
            }
        });
        drawCells();
    }

    function deleteAllVoid() {
        for (let i = 0; i < fieldSize; i++) {
            for (let j = 0; j < fieldSize; j++) {
                if (fieldArray[i][j].collor == "black") {
                    deleteCell(i, j);
                    drawCells();
                }
            }
        }
    }

    function animation() {
        timeG += 0.04;
        animationFrameD = Math.floor(((1 + Math.sin(timeG)) * cellSize) / 2);
        if (zen && scoreMultipier < 1) {
            scoreMultipier = 1;
        } else {
            scoreMultipier -= 0.15;
            scoreMultipierBar.value = scoreMultipier;
        }
        if (animationFrameD > 40) {
            deleteAllVoid();
        }
    }

    function tick() {
        if (!zen && scoreMultipier < 1) {
            gameStart = false;

            const lastRecord = localStorage.getItem("record");
            const lastGameVer = localStorage.getItem("GameVer");
            if (lastGameVer != gameVer) {
                localStorage.clear();
            }
            let message = "Game over! \nYour score: " + score;
            if (score > lastRecord) {
                localStorage.setItem("record", score);
                localStorage.setItem("GameVer", gameVer);

                message += "\n   New record!";
            } else {
                if (lastRecord != null) {
                    message += "\nYour record is " + lastRecord;
                }
            }
            // message += "\nOk to restart";
            confirm(message);
            location.reload();
        }
        requestAnimationFrame(tick);
        animation();
        checkAll();
    }
    function changeColorCheme(colorInd) {
        colors = colorPalletes[colorInd];
        fieldArray.forEach((element) => {
            element.forEach((inner) => {
                inner.collor = colors[inner.style];
            });
        });
    }
    colorPicker.addEventListener("input", (event) => {
        let colorInd = event.target.value;
        localStorage.setItem("colorCheme", colorInd);
        changeColorCheme(colorInd);
    });
    zenModeBtn.addEventListener("click", (event) => {
        zen = true;
        zenModeBtn.disabled = true;
        scorePanel.style.display = "none";
    });

    canvas.addEventListener("click", clickHandler);
    let animationFrameD = 0;
    let timeG = 0;
    let zen = false;

    changeColorCheme(colorInd);
    requestAnimationFrame(tick);
}
