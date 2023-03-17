const puzzle = document.querySelector("#puzzle");
const reader = new FileReader();
const img = new Image();

//첫 화면 셋팅 함수
//size 개수에 맞춰 div 박스 생성
const set = (size) => {
  while (puzzle.firstChild) {
    puzzle.firstChild.remove();
  }

  for (let i = 0; i < size; i++) {
    const pieceElement = document.createElement("div");
    pieceElement.className = `piece box${i + 1}`;
    const pieceNum = document.createElement("div");
    if (i !== size - 1) {
      pieceNum.className = `innerPiece piece${numArr[i]}`;
      if (state === "number" || state === "first") {
        pieceNum.innerHTML = numArr[i];
      }
      pieceElement.appendChild(pieceNum);
    } else if (i === size - 1) {
      pieceNum.className = `innerPiece piece${size}`;
      pieceElement.appendChild(pieceNum);
    }

    puzzle.append(pieceElement);
  }

  if (state === "image") {
    setImg();
  }
};

//파일 리더
const fileReading = (input, hintImg) => {
  const file = input.files[0];
  reader.addEventListener("load", () => {
    img.src = reader.result;
    temp = reader.result;
    hintImg.setAttribute("src", reader.result);
  });

  if (file) {
    reader.readAsDataURL(file);
    document.querySelector(".fileName").innerHTML =
      file.name.slice(0, 12) + "...";
  }
};

//이미지 업로드 및 퍼즐 생성
const setImg = () => {
  const input = document.querySelector("#imgInput");
  const hintImg = document.querySelector(".hintImg");
  const pieceList = document.querySelectorAll(".piece");

  fileReading(input, hintImg);

  if (state === "first" || state === "image") {
    img.src = temp;
    pieceList.forEach((piece, idx) => {
      const canvas = document.createElement("canvas");
      canvas.className = `innerPiece piece${idx + 1}`;
      piece.innerHTML = "";
      piece.appendChild(canvas);
    });

    img.onload = () => {
      const pieceX = Math.round(img.width / zig);
      const pieceY = Math.round(img.height / zag);
      const positionArr = [];

      for (let j = 0; j < zag; j++) {
        for (let i = 0; i < zig; i++) {
          positionArr.push([j * pieceY, i * pieceX]);
        }
      }

      pieceList.forEach((piece, idx) => {
        const pieceCanvas = piece.firstChild;
        pieceCanvas.width = Math.round(puzzle.clientWidth / zig);
        pieceCanvas.height = Math.round(puzzle.clientHeight / zag);

        if (idx === pieceList.length - 1) {
          return;
        }
        pieceCanvas
          .getContext("2d")
          .drawImage(
            hintImg,
            positionArr[idx][1],
            positionArr[idx][0],
            pieceX,
            pieceY,
            0,
            0,
            pieceCanvas.width,
            pieceCanvas.height
          );
      });
    };
  }
};

//사이즈 변경 함수
const sizing = (e) => {
  const regExp = /[3-9]/; //전역 탐색 플래그를 제공한 정규 표현식에서 여러 번 호출하면 이전 일치 이후부터 탐색합니다. 2회차에 boolean 반대로 나옴 > g를 삭제하는 것으로 해결
  const width = document.querySelector(".zig");
  const height = document.querySelector(".zag");

  if (!regExp.test(width.value) || !regExp.test(height.value)) {
    width.value = zig;
    height.value = zag;
    return alert("3 이상 9 이하의 숫자만 입력해 주세요.");
  }

  zig = width.value;
  zag = height.value;
  size = zig * zag;
  numArr = makeNumArr(size);

  puzzle.style.gridTemplateColumns = `repeat(${zig}, 1fr)`;
  puzzle.style.gridTemplateRows = `repeat(${zag}, 1fr)`;

  set(size);
  addEvent();
};

//퍼즐 섞기
const start = () => {
  const boxList = document.querySelectorAll(".piece");
  const pieceList = document.querySelectorAll(".innerPiece");
  const pieceListArr = Array.prototype.slice.call(pieceList);

  pieceListArr.sort(() => Math.random() - 0.5);
  boxList.forEach((piece, idx) => {
    piece.appendChild(pieceListArr[idx]);
  });
};

//모서리 이동 블락 함수
const checkPosition = (e) => {
  const edgeArr = [];
  const emptyPieceBox = document.querySelector(`.piece${size}`).parentElement;
  const emptyPieceNum = emptyPieceBox.className.split(" ")[1];
  const emptyPiece =
    emptyPieceNum.length > 4
      ? emptyPieceNum.slice(-2)
      : emptyPieceNum.slice(-1); //빈칸의 인덱스(조각 박스 번호) 추출

  const clickedPieceBox = e.currentTarget.className.split(" ")[1];
  const clickedPiece =
    clickedPieceBox.length > 4
      ? clickedPieceBox.slice(-2)
      : clickedPieceBox.slice(-1);

  const location = Math.abs(emptyPiece - clickedPiece);

  for (let i = 1; i < zag; i++) {
    edgeArr.push(zig * i, 1 + zig * i);
  }

  return { emptyPiece, clickedPiece, location, emptyPieceBox, edgeArr };
};

//퍼즐 이동
const move = (e) => {
  //상대 위치 값
  const { emptyPiece, clickedPiece, location, emptyPieceBox, edgeArr } =
    checkPosition(e);
  const answerArr = makeAnswer();

  if (
    edgeArr.includes(emptyPiece * 1) &&
    edgeArr.includes(clickedPiece * 1) &&
    Math.abs(emptyPiece - clickedPiece) === 1
  ) {
    return;
  } else if (location == zig || location == 1) {
    e.currentTarget.appendChild(emptyPieceBox.firstChild);
    emptyPieceBox.appendChild(e.currentTarget.children[0]);
    count++;
    document.querySelector(".count").innerHTML = count;
  }

  /*배열 비교하기
  
  //방법 1: JSON.stringify
  const finishedPuzzle = JSON.stringify(
    listArr.map((piece) => Number(piece.outerText))
  );

  if (finishedPuzzle === JSON.stringify(answerArr)) {
    return alert("퍼즐 완성!");
  }

  //방법2: .every
  const finishedPuzzle = listArr.map((piece) => Number(piece.outerText));
  if (finishedPuzzle.every((num, idx) => num === answerArr[idx])) {
    return alert("퍼즐 완성!");
  }
*/
  //방법3: for문
  let correctCount = 0;
  let pieceList = Array.prototype.slice.call(
    document.querySelectorAll(".innerPiece")
  );
  const pieceNumArr = pieceList.map((pieceNode) => {
    const pieceNum = pieceNode.className.split(" ")[1];
    return pieceNum.length > 6 ? pieceNum.slice(-2) : pieceNum.slice(-1);
  });

  for (let i = 0; i < pieceNumArr.length; i++) {
    if (pieceNumArr[i] == answerArr[i]) {
      correctCount++;
    }
  }
  if (correctCount === answerArr.length) {
    return alert("퍼즐 완성!");
  }
};

//컬러 변경
const movable = (e) => {
  const { emptyPiece, clickedPiece, location, edgeArr } = checkPosition(e);

  if (
    edgeArr.includes(emptyPiece * 1) &&
    edgeArr.includes(clickedPiece * 1) &&
    Math.abs(emptyPiece - clickedPiece) === 1
  ) {
    e.currentTarget.className += " red";
  } else if (location == zig || location == 1) {
    e.currentTarget.className += " green";
  } else if (location == 0) {
    return;
  } else {
    e.currentTarget.className += " red";
  }
};

//컬러 삭제
const cleanUp = (e) => {
  const classList = e.target.className.split(" ");
  const originClassName = classList[0] + " " + classList[1];
  e.target.className = originClassName;
};

//size에 맞춰 숫자 배열 생성
const makeNumArr = () => {
  let numArr = new Array(size - 1);
  for (let i = 0; i < numArr.length; i++) {
    numArr[i] = i + 1;
  }

  numArr.push("");
  return numArr;
};

//size에 맞춰 답 배열 생성
const makeAnswer = () => {
  let answerArr = new Array(size);
  for (let i = 0; i < answerArr.length; i++) {
    answerArr[i] = i + 1;
  }
  return answerArr;
};

//각 조각에 이벤트 추가
const addEvent = () => {
  //조각 박스 노드리스트
  const list = document.querySelectorAll(".piece");

  list.forEach((piece) => {
    piece.addEventListener("click", move);
    if (state != "image") {
      piece.addEventListener("mouseenter", movable);
    }
    piece.addEventListener("mouseleave", cleanUp);
  });
};

const removeEvent = () => {
  const list = document.querySelectorAll(".piece");

  list.forEach((piece) => {
    piece.removeEventListener("mouseenter", movable);
    piece.removeEventListener("mouseleave", cleanUp);
  });
};

//이미지 힌트 팝업
const hint = () => {
  if (temp.length == 0) {
    alert("이미지를 업로드해 주세요.");
  } else {
    const imgDiv = document.querySelector(".hintImg");
    imgDiv.style.width = puzzle.clientWidth;
    imgDiv.style.height = puzzle.clientHeight;
    imgDiv.style.display = "block";

    setTimeout(() => {
      imgDiv.style.display = "none";
    }, 2000);
  }
};

//숫자 퍼즐로 변경
const changeNum = () => {
  img.src = "";
  state = "number";
  set(size);
  addEvent();
};

//이미지 퍼즐로 변경
const changeImg = () => {
  if (temp.length == 0) {
    alert("이미지를 업로드해 주세요.");
  } else {
    state = "image";
    setImg();
  }
};

//퍼즐 상태
let state = "first"; //first, number, image

//이미지 주소 변수
let temp = "";

//퍼즐 사이즈 지정 sizeXsize
let zig = 3;
let zag = 3;
let size = zig * zag;

//조각 이동 횟수
let count = 0;

//첫화면 배치와 섞기에 사용되는 배열
let numArr = makeNumArr();

//정답 배열
let answerArr = makeAnswer();

//초기화면 셋팅
set(size);
addEvent();

document.querySelector("#start").addEventListener("click", start);
document.querySelector("#make").addEventListener("click", sizing);
document.querySelector("#imgInput").addEventListener("change", setImg);
document.querySelector(".hint").addEventListener("click", hint);
document.querySelector(".changeNum").addEventListener("click", changeNum);
document.querySelector(".changeImg").addEventListener("click", changeImg);
