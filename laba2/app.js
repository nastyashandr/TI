document.addEventListener("DOMContentLoaded", () => {
  const initialStateInput = document.getElementById("initial-state");
  const fileInput = document.getElementById("file-input");
  const encryptBtn = document.getElementById("encrypt-btn");
  const decryptBtn = document.getElementById("decrypt-btn");
  const saveBtn = document.getElementById("save-btn");
  const exportExcelBtn = document.getElementById("export-excel-btn");
  const fileInfo = document.getElementById("file-info");
  const keyOutput = document.getElementById("key-output");
  const originalOutput = document.getElementById("original-output");
  const resultOutput = document.getElementById("result-output");

  // Переменные состояния
  let currentFile = null;        // выбранный файл
  let currentFileData = null;    // данные файла 
  let processedData = null;      // обработанные данные 
  let keyStream = null;          // сгенерированный ключевой поток
  let lfsr = null;               // экземпляр LFSR

  // Начальное состояние регистра
  initialStateInput.value = "1111111111111111111111111111111";

  // Валидация поля ввода
  initialStateInput.addEventListener("input", (e) => {
    let value = e.target.value.replace(/[^01]/g, "");
    if (value.length > 31) value = value.slice(0, 31);
    e.target.value = value;
  });

  // Обработчик выбора файла
  fileInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    currentFile = file;
    const buffer = await file.arrayBuffer();
    currentFileData = new Uint8Array(buffer);

    fileInfo.innerHTML = `${file.name}\n${file.size * 8} бит`;

    displayBits(originalOutput, currentFileData, "исходный файл");

    processedData = null;
    keyStream = null;
    resultOutput.textContent = "—";
    keyOutput.textContent = "—";
    saveBtn.style.display = "none";
    exportExcelBtn.style.display = "none";
  });

  // Инициализация LFSR с начальным состоянием
  function initLFSR() {
    const stateStr = initialStateInput.value;
    if (!validateInitialState(stateStr)) {
      alert("Ошибка: начальное состояние должно содержать ровно 31 бит (только 0 и 1)");
      return false;
    }

    const initialState = bitsToNumber(stateStr);
    lfsr = new LFSR(initialState);
    return true;
  }

  // Извлечение битов из данных, начиная с указанного байта
  function getBits(data, startByte, numBits) {
    let bits = "";
    let bitsNeeded = numBits;
    let byteIndex = startByte;

    while (bitsNeeded > 0 && byteIndex < data.length) {
      let byte = data[byteIndex];
      for (let b = 7; b >= 0 && bitsNeeded > 0; b--) {
        bits += (byte >> b) & 1;
        bitsNeeded--;
      }
      byteIndex++;
    }

    // Если не хватило данных, дополняем нулями
    while (bitsNeeded > 0) {
      bits += "0";
      bitsNeeded--;
    }

    return bits;
  }

  // Отображение первых и последних 32 бит данных
  function displayBits(element, data, title) {
    if (!data || data.length === 0) {
      element.textContent = "—";
      return;
    }

    let result = `${title}\n\n`;

    result += "первые 32 бита:\n";
    if (data.length >= 4) {
      const firstBits = getBits(data, 0, 32);
      result += firstBits.substring(0, 8) + " ";
      result += firstBits.substring(8, 16) + " ";
      result += firstBits.substring(16, 24) + " ";
      result += firstBits.substring(24, 32) + "\n";
    } else {
      const firstBits = getBits(data, 0, 32);
      result += firstBits + " (неполные данные)\n";
    }

    result += "\nпоследние 32 бита:\n";
    if (data.length >= 4) {
      const lastBits = getBits(data, data.length - 4, 32);
      result += lastBits.substring(0, 8) + " ";
      result += lastBits.substring(8, 16) + " ";
      result += lastBits.substring(16, 24) + " ";
      result += lastBits.substring(24, 32) + "\n";
    } else {
      const lastBits = getBits(data, Math.max(0, data.length - 4), 32);
      result += lastBits + " (неполные данные)\n";
    }

    result += `\nвсего: ${data.length * 8} бит`;
    element.textContent = result;
  }

  // Отображение ключевого потока 
  function displayKeyBits(keyStream) {
    if (!keyStream || keyStream.length === 0) {
      keyOutput.textContent = "—";
      return;
    }

    let result = `ключ\n\n`;

    result += "первые 32 бита ключа:\n";
    const firstBits = getBits(keyStream, 0, 32);
    result += firstBits.substring(0, 8) + " ";
    result += firstBits.substring(8, 16) + " ";
    result += firstBits.substring(16, 24) + " ";
    result += firstBits.substring(24, 32) + "\n";

    result += "\nпоследние 32 бита ключа:\n";
    const lastBits = getBits(keyStream, keyStream.length - 4, 32);
    result += lastBits.substring(0, 8) + " ";
    result += lastBits.substring(8, 16) + " ";
    result += lastBits.substring(16, 24) + " ";
    result += lastBits.substring(24, 32) + "\n";

    result += `\nдлина ключа: ${keyStream.length * 8} бит`;
    keyOutput.textContent = result;
  }

  // Шифрование/дешифрование: XOR данных с ключевым потоком
  function processData(data, lfsrInstance) {
    const keyStream = lfsrInstance.generateKeyStream(data.length);
    const result = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
      result[i] = data[i] ^ keyStream[i];
    }
    return { result, keyStream };
  }

  // Основная функция обработки 
  function handleProcess(mode) {
    if (!currentFileData) {
      alert("Сначала выберите файл!");
      return;
    }

    if (!initLFSR()) return;

    const initialState = lfsr.state;
    const { result, keyStream: ks } = processData(currentFileData, lfsr);

    processedData = result;
    keyStream = ks;

    // Ключ и результат
    displayKeyBits(keyStream);
    displayBits(resultOutput, result, mode === "encrypt" ? "зашифрованный файл" : "расшифрованный файл");

    // Кнопки сохранения и экспорта
    saveBtn.style.display = "inline-block";
    saveBtn.textContent = mode === "encrypt" ? "Сохранить зашифрованный" : "Сохранить расшифрованный";
    exportExcelBtn.style.display = "inline-block";

    lfsr.reset(initialState);
  }

  // Обработчики кнопок
  encryptBtn.addEventListener("click", () => handleProcess("encrypt"));
  decryptBtn.addEventListener("click", () => handleProcess("decrypt"));

  // Сохранение обработанного файла
  saveBtn.addEventListener("click", () => {
    if (!processedData || !currentFile) return;

    const isEncrypt = saveBtn.textContent.includes("зашифрованный");
    let fileName;

    if (isEncrypt) {
      const dotIndex = currentFile.name.lastIndexOf('.');
      if (dotIndex === -1) {
        fileName = currentFile.name + '_encrypted';
      } else {
        fileName = currentFile.name.substring(0, dotIndex) + '_encrypted' + currentFile.name.substring(dotIndex);
      }
    } else {
      let baseName = currentFile.name.replace('_encrypted', '');
      const dotIndex = baseName.lastIndexOf('.');
      if (dotIndex === -1) {
        fileName = baseName + '_decrypted';
      } else {
        fileName = baseName.substring(0, dotIndex) + '_decrypted' + baseName.substring(dotIndex);
      }
    }

    // Создаём бинарный файл и сохраняем
    const blob = new Blob([processedData], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert(`Сохранено: ${fileName}\n${processedData.length * 8} бит`);
  });

  // Экспорт в Excel
  exportExcelBtn.addEventListener("click", () => {
    if (!currentFileData || !keyStream) {
      alert("Сначала зашифруйте или расшифруйте файл!");
      return;
    }

    const steps = Math.min(60, currentFileData.length * 8);
    const data = [];

    data.push(["LFSR", "x³¹ + x³ + 1", initialStateInput.value]);
    data.push([]);

    const headerRow = ["Шаг"];
    for (let i = 31; i >= 1; i--) headerRow.push(i.toString());
    headerRow.push("XOR", "Результат", "Ki");
    data.push(headerRow);

    const testLFSR = new LFSR(bitsToNumber(initialStateInput.value));
    let keyBits = [];

    // Первый бит ключа = старший бит начального состояния
    const firstBit = (testLFSR.state >> 30) & 1;
    keyBits.push(firstBit);

    // Проходим по каждому шагу
    for (let step = 0; step < steps; step++) {
      const row = [step + 1];
      const state = testLFSR.state;

      // Записываем все 31 бит состояния
      for (let i = 31; i >= 1; i--) {
        const bitPos = i - 1;
        row.push((state >> bitPos) & 1);
      }

      const bit31 = (state >> 30) & 1;
      const bit3 = (state >> 2) & 1;
      const xorResult = bit31 ^ bit3;
      const outputBit = bit31;

      if (step > 0) keyBits.push(outputBit);

      row.push(xorResult);
      row.push(outputBit);
      data.push(row);

      testLFSR.nextBit();
    }

    // Создаём Excel файл
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);

    const colWidths = [{ wch: 6 }];
    for (let i = 0; i < 31; i++) colWidths.push({ wch: 4 });
    colWidths.push({ wch: 8 }, { wch: 8 }, { wch: 6 });
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, "LFSR");

    const fileName = `lfsr_${currentFile.name.replace(/\.[^/.]+$/, "")}.xlsx`;
    XLSX.writeFile(wb, fileName);

    let keyBits60 = "";
    for (let i = 0; i < Math.min(60, keyBits.length); i++) {
      keyBits60 += keyBits[i];
      if ((i + 1) % 8 === 0 && i < 59) keyBits60 += " ";
    }

    alert(`Сохранено: ${fileName}\nШагов: ${steps}\n\nПервые 60 бит ключа:\n${keyBits60}`);
  });
});