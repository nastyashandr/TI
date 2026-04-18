class LFSR {
  // Начальное состояние регистра
  constructor(initialState) {
    this.state = initialState;
    this.length = 31;
    this.maxValue = (1 << this.length) - 1;
  }

  // Генерация одного бита ключа
  nextBit() {
    const outputBit = (this.state >> (this.length - 1)) & 1;

    // Вычисляем новый бит для обратной связи
    const bit31 = (this.state >> 30) & 1;
    const bit3 = (this.state >> 2) & 1;
    const newBit = bit31 ^ bit3;

    // Сдвиг влево, новый бит вставляется в младший разряд
    this.state = ((this.state << 1) & this.maxValue) | newBit;

    return outputBit;
  }

  // Генерация одного байта ключа
  nextByte() {
    let byte = 0;
    for (let i = 0; i < 8; i++) {
      byte = (byte << 1) | this.nextBit();
    }
    return byte;
  }

  // Генерация ключевого потока
  generateKeyStream(length) {
    const keyStream = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      keyStream[i] = this.nextByte();
    }
    return keyStream;
  }

  // Сброс состояния регистра
  reset(initialState) {
    this.state = initialState;
  }

  // Получение текущего состояния в виде строки из 31 бита
  getStateBinary() {
    let binary = "";
    for (let i = this.length - 1; i >= 0; i--) {
      binary += (this.state >> i) & 1;
    }
    return binary;
  }
}

// Проверка валидности начального состояния
function validateInitialState(state) {
  return /^[01]{31}$/.test(state);
}

// Преобразование строки битов в число
function bitsToNumber(bitsStr) {
  let num = 0;
  for (let i = 0; i < bitsStr.length; i++) {
    if (bitsStr[i] === "1") {
      num |= 1 << (bitsStr.length - 1 - i);
    }
  }
  return num;
}

// Преобразование числа в строку битов заданной длины
function numberToBits(num, length) {
  let bits = "";
  for (let i = length - 1; i >= 0; i--) {
    bits += (num >> i) & 1;
  }
  return bits;
}
