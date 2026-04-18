let primitiveRoots = [];     // массив всех первообразных корней
let currentP = null;         // простое число p
let currentG = null;         // первообразный корень g
let currentX = null;         // закрытый ключ x
let currentY = null;         // открытый ключ y = g^x mod p

// Быстрое возведение в степень по модулю (бинарный метод)
function fastPowMod(base, exp, mod) {
  if (mod === 1) return 0;
  let result = 1n;
  let b = BigInt(base) % BigInt(mod);
  let e = BigInt(exp);
  const m = BigInt(mod);
  while (e > 0) {
    if (e & 1n) result = (result * b) % m;  // если бит = 1 → умножаем
    b = (b * b) % m;                        // возводим в квадрат
    e >>= 1n;                               // сдвигаем биты
  }
  return Number(result);
}

// Расширенный алгоритм Евклида: a*x + b*y = НОД(a,b)
function extendedGcd(a, b) {
  if (a === 0) return [b, 0, 1];
  const [gcd, x1, y1] = extendedGcd(b % a, a);
  const x = y1 - Math.floor(b / a) * x1;
  const y = x1;
  return [gcd, x, y];
}

// Обратное число по модулю: a^(-1) mod m
function modInverse(a, m) {
  const [gcd, x, _] = extendedGcd(a, m);
  if (gcd !== 1) return null;
  return ((x % m) + m) % m;
}

// Проверка, взаимно ли просты числа 
function isCoprime(a, b) {
  const [gcd, _, __] = extendedGcd(a, b);
  return gcd === 1;
}

// Разложение числа на уникальные простые множители
function getPrimeFactors(n) {
  const factors = [];
  let temp = n;
  let i = 2;
  while (i * i <= temp) {
    if (temp % i === 0) {
      factors.push(i);
      while (temp % i === 0) temp /= i;
    }
    i++;
  }
  if (temp > 1) factors.push(temp);
  return factors;
}

// Проверка, является ли число простым
function isPrime(n) {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

// Проверка, является ли g первообразным корнем по модулю p
function isPrimitiveRoot(g, p, primeFactors) {
  if (g === 1) return false;
  const phi = p - 1;
  for (const q of primeFactors) {
    // Если g^((p-1)/q) ≡ 1 → порядок меньше p-1 → не корень
    if (fastPowMod(g, phi / q, p) === 1) return false;
  }
  return true;
}

// Поиск всех первообразных корней по модулю p
function findAllPrimitiveRoots(p) {
  if (!isPrime(p)) return [];
  const primeFactors = getPrimeFactors(p - 1);
  const roots = [];
  for (let g = 2; g < p; g++) {
    if (isPrimitiveRoot(g, p, primeFactors)) roots.push(g);
  }
  return roots;
}

// Проверка введённых p, g, x 
function updateKeyInfo() {
  const p = parseInt(pInput.value);
  const g = parseInt(gSelect.value);
  const x = parseInt(xInput.value);
  const messages = [];

  if (!isNaN(p)) {
    if (isPrime(p)) {
      messages.push(`✓ p = ${p} — простое число`);
      if (p > 255) messages.push(`  ✓ p > 255, можно шифровать любые файлы`);
      else messages.push(`  ⚠ p < 256, НЕЛЬЗЯ шифровать картинки!`);
    } else messages.push(`✗ p = ${p} — НЕ является простым`);
  }

  if (primitiveRoots.length > 0 && !isNaN(g)) {
    if (primitiveRoots.includes(g)) messages.push(`✓ g = ${g} — первообразный корень`);
    else messages.push(`✗ g = ${g} — НЕ первообразный корень`);
  }

  if (!isNaN(p) && !isNaN(x)) {
    if (1 < x && x < p - 1) messages.push(`✓ x = ${x} в диапазоне (1, ${p - 1})`);
    else messages.push(`✗ x должно быть в диапазоне (1, ${p - 1})`);
  }

  if (keyCheckInfo) {
    keyCheckInfo.innerHTML = messages.map(m => {
      if (m.startsWith('✓')) return `<div class="success">${m}</div>`;
      if (m.startsWith('✗')) return `<div class="error">${m}</div>`;
      if (m.startsWith('⚠')) return `<div class="warning">${m}</div>`;
      return `<div class="info">${m}</div>`;
    }).join('');
  }
}

// Проверка введённого k 
function updateKInfo() {
  const k = parseInt(kInput.value);
  if (!currentP) {
    if (kCheckInfo) kCheckInfo.innerHTML = '<div class="warning">⚠ Сначала сгенерируйте ключи</div>';
    return;
  }
  const messages = [];
  if (!isNaN(k)) {
    if (1 < k && k < currentP - 1) messages.push(`✓ k = ${k} в диапазоне (1, ${currentP - 1})`);
    else messages.push(`✗ k должно быть в диапазоне (1, ${currentP - 1})`);
    if (isCoprime(k, currentP - 1)) messages.push(`✓ НОД(${k}, ${currentP - 1}) = 1`);
    else {
      const [gcd] = extendedGcd(k, currentP - 1);
      messages.push(`✗ НОД(${k}, ${currentP - 1}) = ${gcd}`);
    }
  }
  if (kCheckInfo) {
    kCheckInfo.innerHTML = messages.map(m => {
      if (m.startsWith('✓')) return `<div class="success">${m}</div>`;
      if (m.startsWith('✗')) return `<div class="error">${m}</div>`;
      return `<div class="info">${m}</div>`;
    }).join('');
  }
}

// Поиск всех первообразных корней
function findRoots() {
  const p = parseInt(pInput.value);
  if (isNaN(p)) { alert('Введите число p'); return; }
  if (!isPrime(p)) { alert(`Число ${p} не является простым!`); return; }
  if (p < 3) { alert('p должно быть больше 2'); return; }
  if (keyStatus) {
    keyStatus.textContent = 'Поиск первообразных корней...';
    keyStatus.className = 'status info';
  }
  setTimeout(() => {
    try {
      const roots = findAllPrimitiveRoots(p);
      primitiveRoots = roots;
      currentP = p;
      gSelect.innerHTML = '<option value="">-- Выберите g --</option>';
      roots.forEach(root => {
        const option = document.createElement('option');
        option.value = root;
        option.textContent = root;
        gSelect.appendChild(option);
      });
      if (rootsCount) rootsCount.textContent = `Количество корней: ${roots.length}`;
      let text = `p = ${p}\np-1 = ${p - 1}\nПростые делители p-1: ${getPrimeFactors(p - 1).join(', ')}\n\n`;
      if (roots.length > 0) {
        text += `Найдено ${roots.length} первообразных корней:\n${roots.join(', ')}\n\n`;
        if (keyStatus) {
          keyStatus.textContent = `Найдено ${roots.length} корней`;
          keyStatus.className = 'status success';
        }
        alert(`Найдено ${roots.length} первообразных корней`);
      } else {
        if (keyStatus) {
          keyStatus.textContent = 'Первообразные корни не найдены';
          keyStatus.className = 'status error';
        }
        alert('Первообразные корни не найдены');
      }
      if (keyResult) {
        keyResult.style.display = 'block';
        keyResult.innerHTML = text.replace(/\n/g, '<br>');
      }
      updateKeyInfo();
    } catch (e) {
      alert('Ошибка: ' + e.message);
      if (keyStatus) {
        keyStatus.textContent = 'Ошибка';
        keyStatus.className = 'status error';
      }
    }
  }, 100);
}

// Генерация ключей: вычисление y = g^x mod p
function generateKeys() {
  const p = parseInt(pInput.value);
  const g = parseInt(gSelect.value);
  const x = parseInt(xInput.value);
  if (isNaN(p) || isNaN(g) || isNaN(x)) { alert('Введите все значения'); return; }
  if (!isPrime(p)) { alert(`Число ${p} не является простым!`); return; }
  if (!primitiveRoots.includes(g)) { alert(`Число ${g} не является первообразным корнем!`); return; }
  if (!(1 < x && x < p - 1)) { alert(`x должно быть в диапазоне (1, ${p - 1})`); return; }
  currentP = p;
  currentG = g;
  currentX = x;
  currentY = fastPowMod(g, x, p);
  let text = '=== Генерация ключей ===\n\n';
  text += `1. Простое число p = ${p}\n`;
  text += `2. Первообразный корень g = ${g}\n`;
  text += `3. Закрытый ключ x = ${x}\n`;
  text += `4. Вычисляем y = g^x mod p:\n   y = ${g}^${x} mod ${p} = ${currentY}\n\n`;
  text += `Открытый ключ K_o = (${p}, ${g}, ${currentY})\n`;
  text += `Закрытый ключ K_c = ${x}\n`;
  if (keyResult) {
    keyResult.style.display = 'block';
    keyResult.innerHTML = text.replace(/\n/g, '<br>');
  }
  if (keyStatus) {
    keyStatus.textContent = 'Ключи успешно сгенерированы';
    keyStatus.className = 'status success';
  }
  alert('Ключи успешно сгенерированы');
  updateKInfo();
}

// Шифрование файла: каждый байт → пара (a, b)
async function encryptFile() {
  const file = encryptFileInput.files[0];
  if (!file) { alert('Выберите файл для шифрования'); return; }
  if (currentP === null || currentG === null || currentY === null) { alert('Сначала сгенерируйте ключи'); return; }

  const kFirst = parseInt(kInput.value);
  if (isNaN(kFirst)) { alert('Введите корректное целое число для k'); return; }
  if (!(1 < kFirst && kFirst < currentP - 1)) { alert(`k должно быть в диапазоне (1, ${currentP - 1})`); return; }
  if (!isCoprime(kFirst, currentP - 1)) { alert(`k = ${kFirst} и p-1 = ${currentP - 1} не взаимно просты!`); return; }

  if (encryptResult) {
    encryptResult.style.display = 'block';
    encryptResult.innerHTML = '=== Шифрование файла ===\n\n⏳ Чтение файла...';
  }

  try {
    const data = await file.arrayBuffer();
    let bytes = new Uint8Array(data);
    const originalLen = bytes.length;

    // дополнение до блока 8 байт
    const blockSize = 8;
    const paddingLen = (blockSize - (originalLen % blockSize)) % blockSize;
    if (paddingLen > 0) {
      const padded = new Uint8Array(originalLen + paddingLen);
      padded.set(bytes);
      for (let i = originalLen; i < padded.length; i++) padded[i] = paddingLen;
      bytes = padded;
    }

    const maxByte = Math.max(...bytes);
    if (maxByte >= currentP) {
      alert(`Байт ${maxByte} >= p = ${currentP}. Увеличьте p!`);
      return;
    }

    let text = '=== Шифрование файла ===\n\n';
    text += `p = ${currentP}, g = ${currentG}, y = ${currentY}\n`;
    text += `k для первого блока = ${kFirst}\n`;
    text += `Размер исходного файла: ${originalLen} байт\n`;
    if (paddingLen > 0) text += `Добавлен padding: ${paddingLen} байт(а)\n`;
    text += `Размер с padding: ${bytes.length} байт\n\n`;
    if (encryptResult) encryptResult.innerHTML = text;

    const encryptedPairs = [];
    let currentK = kFirst;

    // Шифруем каждый байт 
    for (let i = 0; i < bytes.length; i++) {
      const m = bytes[i];

      if (i > 0) {
        do {
          currentK = Math.floor(Math.random() * (currentP - 3)) + 2;
        } while (!isCoprime(currentK, currentP - 1));
      }

      const a = fastPowMod(currentG, currentK, currentP);   // a = g^k mod p
      const yk = fastPowMod(currentY, currentK, currentP);  // y^k mod p
      const b = (yk * m) % currentP;                        // b = y^k * m mod p
      encryptedPairs.push({ a, b });
    }

    // Формируем выходной файл: [размер][p][a1][b1][a2][b2]...
    const outputData = new ArrayBuffer(8 + encryptedPairs.length * 8);
    const outputView = new DataView(outputData);
    outputView.setUint32(0, originalLen, false);   // исходный размер
    outputView.setUint32(4, currentP, false);      // параметр p
    for (let i = 0; i < encryptedPairs.length; i++) {
      outputView.setUint32(8 + i * 8, encryptedPairs[i].a, false);
      outputView.setUint32(12 + i * 8, encryptedPairs[i].b, false);
    }

    // Скачивание файла
    const blob = new Blob([outputData]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name + '.enc';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    text += `\n=== Шифрование завершено ===\n`;
    text += `Зашифрованный файл: ${file.name}.enc\n`;
    text += `Всего пар (a,b): ${encryptedPairs.length}\n\n`;
    text += `Первые 10 пар (a, b):\n`;
    for (let i = 0; i < Math.min(10, encryptedPairs.length); i++) {
      text += `${i + 1}: a=${encryptedPairs[i].a}, b=${encryptedPairs[i].b}\n`;
    }

    if (encryptResult) encryptResult.innerHTML = text;
    alert(`Файл зашифрован: ${file.name}.enc`);
  } catch (e) {
    alert(`Ошибка: ${e.message}`);
    if (encryptResult) encryptResult.innerHTML = `<div class="error">Ошибка: ${e.message}</div>`;
  }
}

// Дешифрование файла
async function decryptFile() {
  const file = decryptFileInput.files[0];
  if (!file) { alert('Выберите зашифрованный файл'); return; }

  const x = parseInt(decryptXInput.value);
  let p = parseInt(decryptPInput.value);
  if (isNaN(x) || isNaN(p)) { alert('Введите x и p'); return; }

  if (decryptResult) {
    decryptResult.style.display = 'block';
    decryptResult.innerHTML = '=== Дешифрование файла ===\n\n⏳ Чтение файла...';
  }

  try {
    const data = await file.arrayBuffer();
    const view = new DataView(data);
    if (data.byteLength < 8) { alert('Файл поврежден'); return; }

    const originalLen = view.getUint32(0, false);   // исходный размер
    const savedP = view.getUint32(4, false);        // p из файла

    // Проверка совпадения p
    if (savedP !== p) {
      const useSaved = confirm(`p из файла (${savedP}) не совпадает с введенным (${p})!\nИспользовать p из файла?`);
      if (useSaved) p = savedP;
      else return;
    }

    // Читаем все пары (a, b)
    const encryptedPairs = [];
    let pos = 8;
    while (pos + 8 <= data.byteLength) {
      const a = view.getUint32(pos, false);
      const b = view.getUint32(pos + 4, false);
      encryptedPairs.push({ a, b });
      pos += 8;
    }

    let text = '=== Дешифрование файла ===\n\n';
    text += `p = ${p}, x = ${x}\n`;
    text += `Исходный размер: ${originalLen} байт\n`;
    text += `Количество пар: ${encryptedPairs.length}\n\n`;
    if (decryptResult) decryptResult.innerHTML = text;

    const decryptedData = [];

    // Расшифровка каждой пары: m = b * (a^x)^(-1) mod p
    for (let i = 0; i < encryptedPairs.length; i++) {
      const { a, b } = encryptedPairs[i];
      const aPowX = fastPowMod(a, x, p);           // a^x mod p
      const aPowXInv = modInverse(aPowX, p);       // обратный элемент
      if (aPowXInv === null) throw new Error(`Не найден обратный элемент для a=${a}`);
      const m = (b * aPowXInv) % p;                // исходный байт
      decryptedData.push(m);
    }

    // Убираем padding 
    const decryptedBytes = new Uint8Array(decryptedData).slice(0, originalLen);

    // Формируем имя файла 
    let outputPath = file.name;
    if (outputPath.endsWith('.enc')) outputPath = outputPath.slice(0, -4);
    if (outputPath.endsWith('.dec')) outputPath = outputPath.slice(0, -4);

    // Скачивание расшифрованного файла
    const blob = new Blob([decryptedBytes]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = outputPath;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    text += `\n=== Дешифрование завершено ===\n`;
    text += `Расшифрованный файл: ${outputPath}\n`;
    text += `Размер: ${decryptedBytes.length} байт\n\n`;
    if (decryptResult) decryptResult.innerHTML = text;
    alert(`Файл расшифрован: ${outputPath}`);
  } catch (e) {
    alert(`Ошибка: ${e.message}`);
    if (decryptResult) decryptResult.innerHTML = `<div class="error">Ошибка: ${e.message}</div>`;
  }
}

// Просмотр содержимого файла в 10-й системе счисления
async function viewFile() {
  const file = viewFileInput.files[0];
  if (!file) { alert('Выберите файл'); return; }
  if (viewResult) viewResult.style.display = 'block';
  try {
    const data = await file.arrayBuffer();
    const bytes = new Uint8Array(data);
    const view = new DataView(data);
    let text = `Файл: ${file.name}\nРазмер: ${bytes.length} байт\n\n`;
    if (file.name.endsWith('.enc') && bytes.length >= 8) {
      const originalLen = view.getUint32(0, false);
      const p = view.getUint32(4, false);
      text += '='.repeat(60) + '\nЗАШИФРОВАННЫЙ ФАЙЛ\n' + '='.repeat(60) + '\n';
      text += `Исходный размер: ${originalLen} байт\nПараметр p: ${p}\n\n`;
      text += 'ПЕРВЫЕ 20 ПАР (a, b):\n' + '-'.repeat(45) + '\n №       a         b\n' + '-'.repeat(45) + '\n';
      let pos = 8;
      for (let i = 0; i < 20 && pos + 8 <= bytes.length; i++) {
        const a = view.getUint32(pos, false);
        const b = view.getUint32(pos + 4, false);
        text += `${(i + 1).toString().padStart(3)}   ${a.toString().padStart(8)}   ${b.toString().padStart(8)}\n`;
        pos += 8;
      }
      text += '-'.repeat(45) + `\nВсего пар: ${(bytes.length - 8) / 8}\n`;
    } else {
      text += 'СОДЕРЖИМОЕ (байты 0-255):\n' + '-'.repeat(60) + '\n';
      for (let i = 0; i < Math.min(200, bytes.length); i++) {
        text += bytes[i].toString().padStart(3) + ' ';
        if ((i + 1) % 20 === 0) text += '\n';
      }
      if (bytes.length > 200) text += `\n... и ещё ${bytes.length - 200} байт\n`;
    }
    if (viewResult) viewResult.innerHTML = text.replace(/\n/g, '<br>');
  } catch (e) {
    alert(`Ошибка: ${e.message}`);
    if (viewResult) viewResult.innerHTML = `<div class="error">Ошибка: ${e.message}</div>`;
  }
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

document.addEventListener('DOMContentLoaded', () => {
  window.pInput = document.getElementById('pInput');
  window.findRootsBtn = document.getElementById('findRootsBtn');
  window.gSelect = document.getElementById('gSelect');
  window.rootsCount = document.getElementById('rootsCount');
  window.xInput = document.getElementById('xInput');
  window.generateKeysBtn = document.getElementById('generateKeysBtn');
  window.keyCheckInfo = document.getElementById('keyCheckInfo');
  window.keyResult = document.getElementById('keyResult');
  window.keyStatus = document.getElementById('keyStatus');

  window.encryptFileInput = document.getElementById('encryptFileInput');
  window.encryptFileName = document.getElementById('encryptFileName');
  window.selectEncryptFileBtn = document.getElementById('selectEncryptFileBtn');
  window.kInput = document.getElementById('kInput');
  window.encryptBtn = document.getElementById('encryptBtn');
  window.encryptResult = document.getElementById('encryptResult');
  window.kCheckInfo = document.getElementById('kCheckInfo');

  window.decryptFileInput = document.getElementById('decryptFileInput');
  window.decryptFileName = document.getElementById('decryptFileName');
  window.selectDecryptFileBtn = document.getElementById('selectDecryptFileBtn');
  window.decryptXInput = document.getElementById('decryptXInput');
  window.decryptPInput = document.getElementById('decryptPInput');
  window.decryptBtn = document.getElementById('decryptBtn');
  window.decryptResult = document.getElementById('decryptResult');

  window.viewFileInput = document.getElementById('viewFileInput');
  window.viewFileName = document.getElementById('viewFileName');
  window.selectViewFileBtn = document.getElementById('selectViewFileBtn');
  window.viewBtn = document.getElementById('viewBtn');
  window.viewResult = document.getElementById('viewResult');

  if (findRootsBtn) findRootsBtn.addEventListener('click', findRoots);
  if (generateKeysBtn) generateKeysBtn.addEventListener('click', generateKeys);
  if (encryptBtn) encryptBtn.addEventListener('click', encryptFile);
  if (decryptBtn) decryptBtn.addEventListener('click', decryptFile);
  if (viewBtn) viewBtn.addEventListener('click', viewFile);

  if (selectEncryptFileBtn) selectEncryptFileBtn.addEventListener('click', () => encryptFileInput.click());
  if (selectDecryptFileBtn) selectDecryptFileBtn.addEventListener('click', () => decryptFileInput.click());
  if (selectViewFileBtn) selectViewFileBtn.addEventListener('click', () => viewFileInput.click());

  if (encryptFileInput) encryptFileInput.addEventListener('change', () => {
    if (encryptFileInput.files[0] && encryptFileName) encryptFileName.textContent = encryptFileInput.files[0].name;
  });
  if (decryptFileInput) decryptFileInput.addEventListener('change', () => {
    if (decryptFileInput.files[0] && decryptFileName) decryptFileName.textContent = decryptFileInput.files[0].name;
  });
  if (viewFileInput) viewFileInput.addEventListener('change', () => {
    if (viewFileInput.files[0] && viewFileName) viewFileName.textContent = viewFileInput.files[0].name;
  });

  // Проверки при вводе
  if (pInput) pInput.addEventListener('input', updateKeyInfo);
  if (gSelect) gSelect.addEventListener('change', updateKeyInfo);
  if (xInput) xInput.addEventListener('input', updateKeyInfo);
  if (kInput) kInput.addEventListener('input', updateKInfo);

  updateKeyInfo();
});