let currentMode = "rail";

const ENG_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const RUS_ALPHABET = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ";

// ==================== ЖЕЛЕЗНОДОРОЖНАЯ ИЗГОРОДЬ ====================
function railFenceEncrypt(text, key) {
  if (key < 2) return text;

  // Подготовка текста
  let letters = "";
  for (let i = 0; i < text.length; i++) {
    const char = text[i].toUpperCase();
    if (ENG_ALPHABET.includes(char)) {
      letters += char;
    }
  }
  if (letters.length === 0) return "";

  // Создаем массив из key элементов, каждый из которых - пустой массив.
  const rails = Array(key)
    .fill()
    .map(() => []);

  let rail = 0; // текущий массив
  let direction = 1; // направление: 1 вниз, -1 вверх

  // Распределяем буквы по массивам зигзагом
  for (let char of letters) {
    rails[rail].push(char); // Добавляем букву в массив
    rail += direction; // Переходим к следующему массиву

    // Дошли до первого или последнего массива - меняем направление.
    if (rail === key - 1 || rail === 0) {
      direction *= -1;
    }
  }

  // Склеиваем все массивы в один
  return rails.flat().join("");
}

// Дешифрование
function railFenceDecrypt(text, key) {
  if (key < 2) return text;

  // Подготовка текста
  const processedText = text.toUpperCase().replace(/\s+/g, "");
  let validText = "";
  for (let i = 0; i < processedText.length; i++) {
    if (ENG_ALPHABET.includes(processedText[i])) {
      validText += processedText[i];
    }
  }
  if (validText.length === 0) return "";

  // Создаем массив такой же длины, как текст с 0
  const pattern = Array(validText.length).fill(0);
  let rail = 0;
  let direction = 1;

  // Запоминаем для каждой позиции, в каком она была массиве при шифровании.
  for (let i = 0; i < validText.length; i++) {
    pattern[i] = rail; // Запоминаем номер массива
    rail += direction; 

    // Меняем направление
    if (rail === key - 1 || rail === 0) {
      direction *= -1;
    }
  }

  // Массив массивов
  const rails = Array(key)
    .fill()
    .map(() => []);
  let idx = 0;

  // Раскладываем зашифрованный текст по массивам.
  for (let r = 0; r < key; r++) {
    for (let i = 0; i < validText.length; i++) {
      if (pattern[i] === r) {
        rails[r].push(validText[idx++]);
      }
    }
  }

  let decryptedLetters = [];
  rail = 0;
  direction = 1;

  // Берем первую букву из текущего массива и удаляем её оттуда
  for (let i = 0; i < validText.length; i++) {
    decryptedLetters.push(rails[rail].shift());
    rail += direction;

    if (rail === key - 1 || rail === 0) {
      direction *= -1;
    }
  }

  // Возвращаем расшифрованный текст
  return decryptedLetters.join("");
}

// ==================== ШИФР ВИЖЕНЕРА (прямой ключ) ====================
function vigenereEncryptRus(text, keyword) {

  // Подготовка ключа и текста
  if (!keyword) return text;

  let upperKeyword = "";
  for (let i = 0; i < keyword.length; i++) {
    const char = keyword[i].toUpperCase();
    if (RUS_ALPHABET.includes(char)) {
      upperKeyword += char;
    }
  }

  if (upperKeyword.length === 0) return text;

  let letters = "";
  for (let i = 0; i < text.length; i++) {
    const char = text[i].toUpperCase();
    if (RUS_ALPHABET.includes(char)) {
      letters += char;
    }
  }

  if (letters.length === 0) return "";

  // Шифрование по таблице Виженера
  let result = "";
  let keyIndex = 0;

  for (let char of letters) {

    // Индекс буквы текста (P)
    const textIndex = RUS_ALPHABET.indexOf(char);

    // Индекс буквы ключа (K)
    const keyChar = upperKeyword[keyIndex % upperKeyword.length];
    const keyIndex_ = RUS_ALPHABET.indexOf(keyChar);

    // Шифрование: C = (P + K) mod 33
    const encryptedIndex = (keyIndex_ + textIndex) % 33;

    result += RUS_ALPHABET[encryptedIndex];
    keyIndex++;
  }

  return result;
}

// Дешифрование методом Виженера
function vigenereDecryptRus(text, keyword) {
  if (!keyword) return text;

  // Подготовка ключа
  let upperKeyword = "";
  for (let i = 0; i < keyword.length; i++) {
    const char = keyword[i].toUpperCase();
    if (RUS_ALPHABET.includes(char)) {
      upperKeyword += char;
    }
  }

  if (upperKeyword.length === 0) return text;

  // Подготовка зашифрованного текста
  const encryptedText = text.toUpperCase().replace(/\s+/g, "");

  // Дешифрование
  let result = "";
  let keyIndex = 0;

  for (let char of encryptedText) {
    if (!RUS_ALPHABET.includes(char)) continue;

    // Индекс буквы шифротекста (C)
    const encryptedIndex = RUS_ALPHABET.indexOf(char);

    //  Индекс буквы ключа (K)
    const keyChar = upperKeyword[keyIndex % upperKeyword.length];
    const keyIndex_ = RUS_ALPHABET.indexOf(keyChar);

    // Дешифрование: P = (C - K) mod 33
    let textIndex = encryptedIndex - keyIndex_;
    if (textIndex < 0) textIndex += 33;

    result += RUS_ALPHABET[textIndex];
    keyIndex++;
  }

  return result;
}

document.addEventListener("DOMContentLoaded", function () {
  const modeBtns = document.querySelectorAll(".mode-btn"); // Кнопки выбора режима
  const keyInput = document.getElementById("keyInput"); // Поле ввода ключа
  const inputText = document.getElementById("inputText"); // Поле исходного текста
  const outputText = document.getElementById("outputText"); // Поле результата
  const encryptBtn = document.getElementById("encryptBtn"); // Кнопка "Зашифровать"
  const decryptBtn = document.getElementById("decryptBtn"); // Кнопка "Расшифровать"
  const loadFileBtn = document.getElementById("loadFileBtn"); // Кнопка "Загрузить файл"
  const saveFileBtn = document.getElementById("saveFileBtn"); // Кнопка "Сохранить файл"
  const statusDiv = document.getElementById("status"); // Панель статуса

  // Текущий режим
  let currentMode = "rail";

  // ==================== ПЕРЕКЛЮЧЕНИЕ РЕЖИМОВ ШИФРОВАНИЯ ====================
  modeBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      modeBtns.forEach((b) => b.classList.remove("active"));

      this.classList.add("active");

      currentMode = this.getAttribute("data-mode");

      if (currentMode === "rail") {
        keyInput.placeholder = "Введите высоту изгороди (число ≥ 2)";
        showStatus("Режим: Железнодорожная изгородь (английский)", "#1e2b3c");
      } else {
        keyInput.placeholder = "Введите ключевое слово (русские буквы)";
        showStatus("Режим: Виженер (русский, прямой ключ)", "#1e2b3c");
      }
    });
  });

  // ==================== ОБРАБОТЧИК ШИФРОВАНИЯ ====================
  encryptBtn.addEventListener("click", function () {
    try {
      const rawText = inputText.value;
      const key = keyInput.value.trim();

      if (!rawText) {
        showStatus("✖ Введите текст для шифрования", "#b91c1c");
        return;
      }

      let result = "";

      if (currentMode === "rail") {
        const railCount = parseInt(key, 10);

        if (!key || isNaN(railCount) || railCount < 2) {
          showStatus(
            "✖ Для железнодорожной изгороди ключ должен быть целым числом ≥ 2",
            "#b91c1c",
          );
          return;
        }

        const hasEnglish = /[A-Za-z]/.test(rawText);
        if (!hasEnglish) {
          showStatus(
            "✖ В тексте нет английских букв для шифрования",
            "#b91c1c",
          );
          return;
        }

        result = railFenceEncrypt(rawText, railCount);
      } else {
        if (!key || !/[а-яА-ЯЁё]/.test(key)) {
          showStatus(
            "✖ Для Виженера ключ должен содержать русские буквы",
            "#b91c1c",
          );
          return;
        }

        const hasRussian = /[а-яА-ЯЁё]/.test(rawText);
        if (!hasRussian) {
          showStatus("✖ В тексте нет русских букв для шифрования", "#b91c1c");
          return;
        }

        result = vigenereEncryptRus(rawText, key);
      }

      outputText.value = result;
      showStatus("✅ Шифрование выполнено", "#1e5b3c");
    } catch (e) {
      showStatus("❌ Ошибка: " + e.message, "#b91c1c");
    }
  });

  // ==================== ОБРАБОТЧИК ДЕШИФРОВАНИЯ ====================
  decryptBtn.addEventListener("click", function () {
    try {
      const rawText = inputText.value;
      const key = keyInput.value.trim();

      if (!rawText) {
        showStatus("✖ Введите текст для дешифрования", "#b91c1c");
        return;
      }

      let result = "";

      if (currentMode === "rail") {
        const railCount = parseInt(key, 10);

        if (!key || isNaN(railCount) || railCount < 2) {
          showStatus("✖ Для дешифрования нужно число ≥ 2", "#b91c1c");
          return;
        }

        result = railFenceDecrypt(rawText, railCount);
      } else {
        if (!key || !/[а-яА-ЯЁё]/.test(key)) {
          showStatus(
            "✖ Для Виженера ключ должен содержать русские буквы",
            "#b91c1c",
          );
          return;
        }

        result = vigenereDecryptRus(rawText, key);
      }

      outputText.value = result;
      showStatus("✅ Дешифрование выполнено", "#1e5b3c");
    } catch (e) {
      showStatus("❌ Ошибка: " + e.message, "#b91c1c");
    }
  });

  // ==================== ЗАГРУЗКА ТЕКСТА ИЗ ФАЙЛА ====================
  loadFileBtn.addEventListener("click", function () {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".txt,.text,text/plain";

    fileInput.onchange = function (e) {
      const file = e.target.files[0]; // Получаем выбранный файл
      if (!file) return;

      // Создаем объект FileReader для чтения файла
      const reader = new FileReader();

      reader.onload = function (event) {
        inputText.value = event.target.result;
        showStatus('📂 Файл "' + file.name + '" загружен', "#1e5b3c");
      };
      reader.onerror = function () {
        showStatus("❌ Ошибка чтения файла", "#b91c1c");
      };

      // Читаем файл как текст в кодировке UTF-8
      reader.readAsText(file, "UTF-8");
    };

    // Открываем диалог выбора файла
    fileInput.click();
  });

  // ==================== СОХРАНЕНИЕ РЕЗУЛЬТАТА В ФАЙЛ ====================
  saveFileBtn.addEventListener("click", function () {
    const content = outputText.value;

    if (!content) {
      showStatus("✖ Нет данных для сохранения", "#b91c1c");
      return;
    }

    // Создаем Blob с текстовым содержимым
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });

    // Создаем ссылку для скачивания
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);

    // Генерируем имя файла с текущей датой
    link.download = `cipher_result_${new Date().toISOString().slice(0, 10)}.txt`;

    // Программно кликаем по ссылке для скачивания
    link.click();

    // Освобождаем временный URL
    URL.revokeObjectURL(link.href);

    showStatus("💾 Файл сохранён", "#1e5b3c");
  });

  // ==================== ФУНКЦИЯ ОТОБРАЖЕНИЯ СТАТУСА ====================
  function showStatus(message, color) {
    statusDiv.textContent = message;
    statusDiv.style.background = color + "15";
    statusDiv.style.color = color;
    statusDiv.style.borderLeft = `4px solid ${color}`;
  }

  keyInput.placeholder = "Введите высоту изгороди (число ≥ 2)";
});
