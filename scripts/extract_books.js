const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const workspaceRoot = process.env.BDFZ_WORKSPACE_ROOT || path.resolve(repoRoot, '..');
const bookPath = (project, ...parts) => path.join(workspaceRoot, project, ...parts);
const outputPath = (name) => path.join(repoRoot, 'constants', 'books', name);

const booksConfig = [
  {
    name: 'nahan',
    src: bookPath('nahan', 'public', 'content.js'),
    dest: outputPath('nahan.json')
  },
  {
    name: 'biancheng',
    src: bookPath('biancheng', 'public', 'content.js'),
    dest: outputPath('biancheng.json')
  },
  {
    name: 'lunyu',
    src: bookPath('lun-reader', 'public', 'content.js'),
    dest: outputPath('lunyu.json')
  },
  {
    name: 'hamlet',
    src: bookPath('hamlet', 'public', 'content.js'),
    dest: outputPath('hamlet.json')
  },
  {
    name: 'yecao',
    src: bookPath('yecao', 'public', 'content.js'),
    dest: outputPath('yecao.json')
  }
];

// Ensure constants/books folder exists
const booksDir = path.join(repoRoot, 'constants', 'books');
if (!fs.existsSync(booksDir)) {
  fs.mkdirSync(booksDir, { recursive: true });
}

booksConfig.forEach(book => {
  if (!fs.existsSync(book.src)) {
    console.warn(`Source not found: ${book.src}`);
    return;
  }

  let content = fs.readFileSync(book.src, 'utf8');

  // Extract the JSON object assigned to window.BOOK
  const startIndex = content.indexOf('window.BOOK =');
  if (startIndex === -1) {
    console.error(`window.BOOK not found in ${book.name}`);
    return;
  }

  let jsonString = content.substring(startIndex + 'window.BOOK ='.length).trim();

  // Remove trailing semicolon if any
  if (jsonString.endsWith(';')) {
    jsonString = jsonString.slice(0, -1);
  }

  // Clean up any other trailing characters after the closing brace/bracket of the object
  // Since it might end with some comments or custom shims like "true;" or similar
  const lastBraceIndex = jsonString.lastIndexOf('}');
  if (lastBraceIndex !== -1) {
    jsonString = jsonString.substring(0, lastBraceIndex + 1);
  }

  try {
    const parsed = JSON.parse(jsonString);
    fs.writeFileSync(book.dest, JSON.stringify(parsed, null, 2), 'utf8');
    console.log(`Successfully extracted ${book.name} to ${book.dest}`);
  } catch (err) {
    console.error(`Failed to parse/write ${book.name}:`, err.message);
  }
});

// Also create the chen_qing_biao.json file from the hardcoded paragraphs in read.tsx
const chenQingBiao = {
  "meta": {
    "zhTitle": "陳情表",
    "enTitle": "Memorial Expressing My Feelings",
    "author": "李密",
    "year": "西晉",
    "tagline": "「臣無祖母，無以至今日；祖母無臣，無以終餘年。」以至孝之情動晉武帝的千古名篇。",
    "about": [
      "《陳情表》是西晉文學家李密寫給晉武帝司馬炎的奏章。李密自幼喪父，母親改嫁，由祖母劉氏撫養成人。晉武帝建立西晉後，多次徵召李密入朝為官。李密因祖母年老病重，無人奉養，寫下此表向皇帝陳述自己的苦衷。",
      "文章言詞懇切，至情至孝，將忠孝難兩全的進退兩難境地表達得淋漓盡致。晉武帝讀後大為感動，不僅同意他暫不赴命，還賞賜了奴婢和糧食。",
      "本文名列中國三大抒情名篇之一（與諸葛亮《出師表》、韓愈《祭十二郎文》並稱）。"
    ]
  },
  "chapters": [
    {
      "id": "full",
      "label": "全文",
      "zh": "陳情表全文",
      "segs": [
        {
          "id": "cq-1",
          "zh": "臣密言：臣以險釁，夙遭閔凶。生孩六月，慈父見背；行年四歲，舅奪母志。祖母劉氏，躬親撫養。臣少多疾病，九歲不行。零丁孤苦，至於成立。既無叔伯，終鮮兄弟。門衰祚薄，晚有兒息。外無期功強近之親，內無手足之口之聽。煢煢孑立，形影相弔。而劉夙嬰疾病，常在床蓐；臣侍湯藥，未曾廢離。"
        },
        {
          "id": "cq-2",
          "zh": "逮奉聖朝，沐浴清化。前太守臣逵，察臣孝廉；後刺史臣榮，舉臣秀才。臣以供養無主，辭不赴命。詔書特下，拜臣郎中；尋蒙國恩，除臣洗馬。意氣勤勤，朝夕奔走；急於星火，催臣拜官。郡縣逼迫，催臣上道；州司臨門，急於星火。臣欲奉詔奔馳，則祖母劉氏病日篤；欲苟順私情，則告訴不許。臣之進退，實為狼狽。"
        },
        {
          "id": "cq-3",
          "zh": "伏惟聖朝以孝治天下，凡在故老，猶蒙矜育；況臣孤苦，特為尤甚。且臣少仕偽朝，歷職郎署，本圖宦達，不矜名節。今臣亡國賤俘，至微至陋，過蒙拔擢，寵命優渥，豈敢盤桓，有所希冀！但以劉日薄西山，氣息奄奄，人命危淺，朝不慮夕。臣無祖母，無以至今日；祖母無臣，無以終餘年。母、孫二人，更相為命，是以區區不能廢離。"
        },
        {
          "id": "cq-4",
          "zh": "臣密今年四十有四，祖母劉今年九十有六，是臣盡節於陛下之日長，報養劉之日短也。烏鳥私情，願乞終養。臣之辛苦，非獨蜀之人士及二州牧伯所見明知，皇天后土，實所共鑒。願陛下矜憫愚誠，聽臣微志，庶劉僥倖，保卒餘年。臣生當隕首，死當結草。臣不勝犬馬怖懼之情，謹拜表以聞。"
        }
      ]
    }
  ]
};

fs.writeFileSync(
  outputPath('chen_qing_biao.json'),
  JSON.stringify(chenQingBiao, null, 2),
  'utf8'
);
console.log('Successfully generated chen_qing_biao.json');
