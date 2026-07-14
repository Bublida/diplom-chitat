import iconv from 'iconv-lite';

function detectEncoding(buffer: Buffer): string {
  // Сначала ищем encoding в XML-заголовке
  const header = buffer.toString('ascii', 0, Math.min(buffer.length, 500));
  const match = header.match(/encoding=["']([^"']+)["']/i);
  if (match) {
    const enc = match[1].toLowerCase();
    if (['windows-1251', 'cp1251', 'win1251'].includes(enc)) return 'windows-1251';
    if (enc === 'utf-8') return 'utf-8';
    if (enc === 'koi8-r') return 'koi8-r';
  }

  // Проверяем BOM для UTF-8
  if (buffer.length >= 3 &&
    buffer[0] === 0xEF &&
    buffer[1] === 0xBB &&
    buffer[2] === 0xBF) {
    return 'utf-8';
  }

  // Эвристика для Windows-1251: проверяем наличие русских символов
  // В UTF-8 русские буквы занимают 2 байта, в Windows-1251 — 1 байт
  let hasValidCyrillic = 0;
  for (let i = 0; i < Math.min(buffer.length, 1000); i++) {
    const byte = buffer[i];
    // В Windows-1251 русские буквы: 0xC0-0xFF
    if (byte >= 0xC0 && byte <= 0xFF) {
      hasValidCyrillic++;
      // Если много русских букв подряд - это скорее всего Windows-1251
      if (hasValidCyrillic > 5) return 'windows-1251';
    }
    // В UTF-8 русские буквы начинаются с 0xD0 или 0xD1
    else if (byte === 0xD0 || byte === 0xD1) {
      // Следующий байт должен быть в диапазоне 0x80-0xBF для валидного UTF-8
      if (i + 1 < buffer.length && buffer[i + 1] >= 0x80 && buffer[i + 1] <= 0xBF) {
        hasValidCyrillic++;
        // Если много валидных UTF-8 последовательностей - это UTF-8
        if (hasValidCyrillic > 5) return 'utf-8';
      }
    }
  }

  // По умолчанию UTF-8
  return 'utf-8';
}

function cleanText(text: string): string {
  // Заменяем HTML сущности
  text = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");

  // Удаляем все HTML теги
  text = text.replace(/<[^>]+>/g, '');

  // Схлопываем множественные пробелы
  return text.replace(/\s+/g, ' ').trim();
}

export async function fb2ToMarkdown(fb2Buffer: Buffer): Promise<string> {
  try {
    // Определяем и декодируем кодировку
    const encoding = detectEncoding(fb2Buffer);
    console.log('FB2 encoding detected:', encoding);


    console.log('=== DEBUG FB2 PARSER ===');
    console.log('First 50 bytes (hex):', fb2Buffer.slice(0, 50).toString('hex'));
    console.log('First 100 chars (raw):', fb2Buffer.slice(0, 100).toString('binary'));
    console.log('Detected encoding:', encoding);

    let xmlString: string;
    try {
      if (encoding === 'windows-1251' || encoding === 'koi8-r') {
        xmlString = iconv.decode(fb2Buffer, encoding);
      } else {
        // Для UTF-8 удаляем BOM, если он есть
        if (fb2Buffer.length >= 3 &&
          fb2Buffer[0] === 0xEF &&
          fb2Buffer[1] === 0xBB &&
          fb2Buffer[2] === 0xBF) {
          xmlString = fb2Buffer.toString('utf-8', 3);
        } else {
          xmlString = fb2Buffer.toString('utf-8');
        }
      }
    } catch (decodeError) {
      console.warn('Decoding failed, trying UTF-8 as fallback');
      xmlString = fb2Buffer.toString('utf-8');
    }

    const result: string[] = [];

    // Ищем все секции (главы)
    const sectionRegex = /<section[^>]*>([\s\S]*?)<\/section>/gis;
    let sectionMatch;

    while ((sectionMatch = sectionRegex.exec(xmlString)) !== null) {
      const sectionContent = sectionMatch[1];

      // Ищем заголовок секции
      const titleMatch = sectionContent.match(/<title[^>]*>([\s\S]*?)<\/title>/is);
      if (titleMatch) {
        const titleText = cleanText(titleMatch[1]);
        if (titleText && !titleText.toLowerCase().includes('annotation')) {
          result.push(`\n# ${titleText}\n`);
        }
      }

      // Ищем параграфы внутри секции
      const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gis;
      let pMatch;

      while ((pMatch = pRegex.exec(sectionContent)) !== null) {
        const paragraph = cleanText(pMatch[1]);
        if (paragraph) {
          result.push(`${paragraph}\n`);
        }
      }
    }

    // Если секций не было, ищем прямые параграфы в body
    if (result.length === 0) {
      // Ищем body
      const bodyMatch = xmlString.match(/<body[^>]*>([\s\S]*?)<\/body>/is);
      if (bodyMatch) {
        const bodyContent = bodyMatch[1];

        // Ищем заголовки
        const titleRegex = /<title[^>]*>([\s\S]*?)<\/title>/gis;
        let titleMatch;

        while ((titleMatch = titleRegex.exec(bodyContent)) !== null) {
          const titleText = cleanText(titleMatch[1]);
          if (titleText && !titleText.toLowerCase().includes('annotation')) {
            result.push(`\n# ${titleText}\n`);
          }
        }

        // Ищем параграфы
        const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gis;
        let pMatch;

        while ((pMatch = pRegex.exec(bodyContent)) !== null) {
          const paragraph = cleanText(pMatch[1]);
          if (paragraph) {
            result.push(`${paragraph}\n`);
          }
        }
      }
    }

    // Если всё ещё пусто, ищем все параграфы в документе
    if (result.length === 0) {
      const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gis;
      let pMatch;

      while ((pMatch = pRegex.exec(xmlString)) !== null) {
        const paragraph = cleanText(pMatch[1]);
        if (paragraph) {
          result.push(`${paragraph}\n`);
        }
      }
    }

    // Если всё ещё пусто, извлекаем текст напрямую
    if (result.length === 0) {
      const text = cleanText(xmlString);
      if (text) {
        result.push(text);
      }
    }

    // Формируем финальный Markdown
    return result.join('\n').trim();
  } catch (error) {
    console.error('Error converting FB2 to Markdown:', error);
    throw error;
  }
}