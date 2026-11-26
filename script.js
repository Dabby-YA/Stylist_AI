"use strict";
/* ---------- helpers ---------- */
const $ = (s) => document.querySelector(s);
const esc = (s) =>
    String(s).replace(
        /[&<>"]/g,
        (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
    );
let S = {
    lang: "zh",
    persona: "mia",
    tab: "plan",
    day: 0,
    filter: "all",
    search: "",
    fMax: 0,
    modal: null,
    chatOpen: false,
    chat: [],
    toast: "",
};
const L = (z, e) => (S.lang === "zh" ? z : e);
const N = (o) => (S.lang === "zh" ? o.z : o.e);
function rng(seed) {
    return () => {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/* ---------- data: colours, occasions, personas ---------- */
const COL = {
    black: ["#1c1c1e", "黑色", "Black"],
    white: ["#f5f5f2", "白色", "White"],
    gray: ["#8e8e93", "灰色", "Gray"],
    navy: ["#1f2d4d", "海軍藍", "Navy"],
    beige: ["#d8c8a8", "米色", "Beige"],
    olive: ["#6b6b2e", "橄欖綠", "Olive"],
    red: ["#b3362f", "紅色", "Red"],
    blue: ["#4d7cc0", "藍色", "Blue"],
    pink: ["#e8a3b5", "粉色", "Pink"],
    green: ["#3f7d58", "綠色", "Green"],
    brown: ["#7a5233", "棕色", "Brown"],
    camel: ["#b88a54", "駝色", "Camel"],
    burgundy: ["#6e1f2f", "酒紅色", "Burgundy"],
    denim: ["#3f5f93", "牛仔藍", "Denim"],
};
const NEUTRAL = new Set(["black", "white", "gray", "navy", "beige"]);
const SUBS = {
    blazer: ["outer", "西裝外套", "Blazer"],
    denimj: ["outer", "牛仔外套", "Denim jacket"],
    trench: ["outer", "風衣", "Trench coat"],
    puffer: ["outer", "羽絨外套", "Puffer"],
    cardigan: ["outer", "針織外套", "Cardigan"],
    necklace: ["accessory", "項鍊", "Necklace"],
    earrings: ["accessory", "耳環", "Earrings"],
    ring: ["accessory", "戒指", "Ring"],
    bracelet: ["accessory", "手鍊", "Bracelet"],
    watch: ["accessory", "手錶", "Watch"],
    hat: ["accessory", "帽子", "Hat"],
    belt: ["accessory", "皮帶", "Belt"],
    bag: ["accessory", "包包", "Bag"],
    scarf: ["accessory", "圍巾", "Scarf"],

    tee: ["top", "T 恤", "T-shirt"],
    shirt: ["top", "襯衫", "Shirt"],
    blouse: ["top", "上衣", "Blouse"],
    knit: ["top", "針織衫", "Knit"],
    hoodie: ["top", "連帽衫", "Hoodie"],
    pants: ["bottom", "長褲", "Pants"],
    trousers: ["bottom", "西裝褲", "Trousers"],
    jeans: ["bottom", "牛仔褲", "Jeans"],
    skirt: ["bottom", "裙子", "Skirt"],
    shorts: ["bottom", "短褲", "Shorts"],
    sneaker: ["shoe", "運動鞋", "Sneakers"],
    loafer: ["shoe", "樂福鞋", "Loafers"],
    heel: ["shoe", "高跟鞋", "Heels"],
    sandal: ["shoe", "涼鞋", "Sandals"],
    boot: ["shoe", "短靴", "Boots"],
};
const PAT = {
    s: ["素色", "Solid"],
    t: ["條紋", "Stripe"],
    c: ["格紋", "Check"],
    f: ["花卉", "Floral"],
    d: ["圓點", "Dots"],
};
const WARM = { 1: ["輕薄", "Light"], 2: ["中等", "Mid"], 3: ["保暖", "Warm"] };
const FORMAL = {
    1: ["運動", "Sport"],
    2: ["休閒", "Casual"],
    3: ["休閒正式", "Smart casual"],
    4: ["商務", "Business"],
    5: ["正式", "Formal"],
};
const CATN = {
 outer:["外套","Outerwear"], accessory:["飾品","Accessories"],
    top: ["上衣", "Tops"],
    bottom: ["下身", "Bottoms"],
    shoe: ["鞋子", "Shoes"],
};
const OCC = [
    { k: "gym", z: "健身", e: "Gym", b: 1 },
    { k: "casual", z: "休閒日", e: "Casual day", b: 2 },
    { k: "dinner", z: "晚餐", e: "Dinner", b: 3 },
    { k: "work", z: "上班", e: "Work", b: 3 },
    { k: "client", z: "客戶會議", e: "Client meeting", b: 4 },
    { k: "wedding", z: "婚禮", e: "Wedding", b: 5 },
];
const COMP = [
    { k: "solo", z: "獨自", e: "Solo", a: 0 },
    { k: "colleague", z: "同事", e: "Colleague", a: 1 },
    { k: "date", z: "約會", e: "Date", a: 1 },
    { k: "friend", z: "朋友", e: "Friend", a: 0 },
    { k: "family", z: "家人", e: "Family", a: 0, min: 2 },
];
const DAYS = [
    ["週一", "Mon"],
    ["週二", "Tue"],
    ["週三", "Wed"],
    ["週四", "Thu"],
    ["週五", "Fri"],
    ["週六", "Sat"],
    ["週日", "Sun"],
];
const DATES = ["11/23", "11/24", "11/25", "11/26", "11/27", "11/28", "11/29"];
const WX = [
    { hi: 23, lo: 18, f: 21, r: 20, h: 72 },
    { hi: 24, lo: 19, f: 23, r: 30, h: 70 },
    { hi: 19, lo: 16, f: 17, r: 85, h: 90 },
    { hi: 20, lo: 15, f: 18, r: 60, h: 84 },
    { hi: 22, lo: 16, f: 20, r: 40, h: 78 },
    { hi: 26, lo: 19, f: 25, r: 20, h: 66 },
    { hi: 28, lo: 21, f: 27, r: 10, h: 62 },
];
const CITY = {
    tpe: ["台北市", "Taipei", 0, 0],
    ntp: ["新北市", "New Taipei", 0, 5],
    txg: ["台中市", "Taichung", 1, -15],
    khh: ["高雄市", "Kaohsiung", 3, -25],
};
const STYLES = [
    {
        k: "classic",
        z: "經典",
        e: "Classic",
        s: ["blouse", "trousers", "loafer"],
        c: ["white", "navy", "black"],
    },
    {
        k: "minimal",
        z: "極簡",
        e: "Minimal",
        s: ["tee", "pants", "sneaker"],
        c: ["white", "gray", "beige"],
    },
    {
        k: "street",
        z: "街頭",
        e: "Street",
        s: ["hoodie", "jeans", "sneaker"],
        c: ["black", "gray", "olive"],
    },
    {
        k: "sporty",
        z: "運動",
        e: "Sporty",
        s: ["tee", "shorts", "sneaker"],
        c: ["black", "white", "blue"],
    },
    {
        k: "romantic",
        z: "浪漫",
        e: "Romantic",
        s: ["blouse", "skirt", "heel"],
        c: ["pink", "beige", "burgundy"],
    },
    {
        k: "casual",
        z: "休閒",
        e: "Easy casual",
        s: ["knit", "jeans", "boot"],
        c: ["camel", "denim", "brown"],
    },
];
const STYLETAG = {
    classic: ["blouse", "shirt", "trousers", "loafer", "knit"],
    minimal: ["tee", "pants", "sneaker"],
    street: ["hoodie", "jeans", "sneaker"],
    sporty: ["shorts", "sneaker"],
    romantic: ["blouse", "skirt", "heel"],
    casual: ["knit", "jeans", "boot", "pants"],
};

const P = {
    mia: {
        n: "Mia",
        age: 28,
        g: "f",
        role: ["台北上班族", "Taipei office worker"],
        tags: ["上班族", "省時派", "天氣不怕"],
        tagsE: ["Office", "Time-saver", "Weather-proof"],
        line: [
            "每天早上幾秒內就有適合上班的穿搭",
            "Work-ready outfits in seconds every morning",
        ],
        pain: [
            "每天花 15 分鐘以上挑衣；只穿 3 套安全牌；常被雨和冷氣打敗",
            "15+ minutes picking clothes, three safe outfits, beaten by rain and office AC",
        ],
        feat: ["7 日規劃 + 試穿", "7-day plan + try-on"],
        pref: "cold",
        city: "tpe",
        styles: ["classic", "minimal"],
        ev: [
            ["部門晨會", "Team standup", "work", "solo"],
            ["客戶提案", "Client pitch", "client", "colleague"],
            ["辦公日（下雨）", "Office day (rain)", "work", "solo"],
            ["晚餐約會", "Dinner date", "dinner", "date"],
            ["季度簡報", "Quarterly review", "work", "colleague"],
            ["朋友婚禮", "Friend's wedding", "wedding", "friend"],
            ["家庭早午餐", "Family brunch", "casual", "family"],
        ],
        w: `blouse|白色絲質襯衫|White silk blouse|white|s|1|4
shirt|淺藍條紋襯衫|Light-blue striped shirt|blue|t|1|3
knit|米色薄針織衫|Beige fine knit|beige|s|2|3
knit|海軍藍針織衫|Navy knit sweater|navy|s|2|4
knit|駝色羊毛衫|Camel wool sweater|camel|s|3|3
tee|白色素面 T 恤|White plain tee|white|s|1|2
shirt|黑色西裝襯衫|Black dress shirt|black|s|2|5
blouse|粉色荷葉領上衣|Pink ruffle-neck top|pink|s|1|4
knit|灰色高領毛衣|Gray turtleneck|gray|s|3|3
trousers|黑色西裝褲|Black tailored trousers|black|s|2|5
trousers|米色寬褲|Beige wide trousers|beige|s|2|4
skirt|海軍藍 A 字裙|Navy A-line skirt|navy|s|2|4
jeans|深藍牛仔褲|Dark denim jeans|denim|s|2|2
trousers|灰色直筒褲|Gray straight trousers|gray|s|2|3
skirt|酒紅色長裙|Burgundy midi skirt|burgundy|s|2|4
loafer|黑色樂福鞋|Black loafers|black|s|2|4
heel|裸色高跟鞋|Nude heels|beige|s|2|5
sneaker|白色小白鞋|White sneakers|white|s|2|2
sandal|米色涼鞋|Beige sandals|beige|s|1|2
boot|黑色短靴|Black ankle boots|black|s|3|3`,
        laundry: [1],
    },
    kai: {
        n: "Kai",
        age: 21,
        g: "m",
        role: ["大學生", "University student"],
        tags: ["學生", "衝動購物", "精打細算"],
        tagsE: ["Student", "Impulse buyer", "Budget-minded"],
        line: ["不想再買到自己已經有的東西", "Stop buying what I already own"],
        pain: [
            "衣櫃滿卻「沒衣服穿」；常買相似單品",
            "Full closet, nothing to wear, keeps buying lookalikes",
        ],
        feat: ["購物檢查 + 造型師聊天", "Purchase check + stylist chat"],
        pref: "hot",
        city: "ntp",
        styles: ["street", "sporty"],
        ev: [
            ["上課", "Lectures", "casual", "solo"],
            ["健身", "Gym", "gym", "solo"],
            ["上課 + 小組討論", "Lectures + group work", "casual", "friend"],
            ["社團聚餐", "Club dinner", "dinner", "friend"],
            ["約會", "Date night", "dinner", "date"],
            ["打工", "Part-time job", "work", "solo"],
            ["家人聚餐", "Family dinner", "dinner", "family"],
        ],
        w: `tee|白色圓領 T 恤|White crew tee|white|s|1|2
tee|米白色圓領 T 恤|Off-white crew tee|beige|s|1|2
tee|白色寬版 T 恤|White boxy tee|white|s|1|2
tee|淺灰圓領 T 恤|Light-gray crew tee|gray|s|1|2
tee|黑色運動 T 恤|Black training tee|black|s|1|1
hoodie|灰色連帽衛衣|Gray hoodie|gray|s|3|2
shirt|藍色牛津襯衫|Blue oxford shirt|blue|s|2|3
shirt|黑白格紋襯衫|Black-and-white check shirt|black|c|2|3
knit|海軍藍毛衣|Navy sweater|navy|s|3|3
hoodie|黑色連帽衛衣|Black hoodie|black|s|3|2
shirt|白色襯衫|White shirt|white|s|2|4
jeans|深藍牛仔褲|Dark jeans|denim|s|2|2
trousers|卡其休閒褲|Khaki chinos|beige|s|1|3
shorts|黑色運動短褲|Black athletic shorts|black|s|1|1
pants|黑色縮口褲|Black joggers|black|s|2|2
trousers|灰色西褲|Gray dress trousers|gray|s|1|4
sneaker|白色球鞋|White court sneakers|white|s|2|2
sneaker|黑色運動鞋|Black running shoes|black|s|2|1
loafer|棕色皮鞋|Brown leather shoes|brown|s|2|4
boot|黑色短靴|Black boots|black|s|3|3`,
        laundry: [],
    },
    grace: {
        n: "Grace",
        age: 33,
        g: "f",
        role: ["客戶經理", "Account manager"],
        tags: ["多場合", "提前規劃", "不再恐慌購物"],
        tagsE: ["Many occasions", "Plans ahead", "No panic buys"],
        line: [
            "每個場合都穿對，不必買新衣",
            "Dressed right for every occasion, no new buys",
        ],
        pain: [
            "不確定正式程度；為了「保險」一直買新衣",
            'Unsure about dress codes, buys "just in case"',
        ],
        feat: ["場合篩選 + 缺口分析", "Occasion filter + gap analysis"],
        pref: "none",
        city: "tpe",
        styles: ["classic"],
        ev: [
            ["部門週會", "Weekly team meeting", "work", "colleague"],
            ["客戶提案", "Client proposal", "client", "solo"],
            ["辦公日", "Office day", "work", "solo"],
            ["客戶晚宴", "Client dinner", "dinner", "colleague"],
            ["董事簡報", "Board briefing", "client", "colleague"],
            ["好友婚禮", "Close friend's wedding", "wedding", "friend"],
            ["家庭聚餐", "Family lunch", "casual", "family"],
        ],
        w: `blouse|白色襯衫|White blouse|white|s|1|4
shirt|淺藍襯衫|Light-blue shirt|blue|s|2|4
blouse|黑色無袖上衣|Black sleeveless top|black|s|1|4
knit|灰色針織衫|Gray knit|gray|s|2|3
knit|海軍藍針織衫|Navy knit|navy|s|2|4
blouse|酒紅色絲質上衣|Burgundy silk top|burgundy|s|1|5
tee|白色 T 恤|White tee|white|s|1|2
tee|條紋 T 恤|Striped tee|navy|t|1|2
shirt|米色亞麻襯衫|Beige linen shirt|beige|s|1|3
knit|駝色毛衣|Camel sweater|camel|s|3|3
blouse|碎花雪紡上衣|Floral chiffon top|pink|f|1|4
hoodie|灰色連帽上衣|Gray hoodie|gray|s|3|2
trousers|黑色西裝褲|Black tailored trousers|black|s|2|5
trousers|灰色西裝褲|Gray tailored trousers|gray|s|2|4
skirt|黑色鉛筆裙|Black pencil skirt|black|s|2|5
skirt|米色 A 字裙|Beige A-line skirt|beige|s|2|4
jeans|藍色牛仔褲|Blue jeans|blue|s|2|2
pants|軍綠色工作褲|Olive utility pants|olive|s|2|2
trousers|海軍藍寬褲|Navy wide trousers|navy|s|2|4
skirt|綠色碎花長裙|Green floral midi skirt|green|f|1|3
sneaker|白色球鞋|White sneakers|white|s|2|2
loafer|黑色平底鞋|Black flats|black|s|2|3
sandal|裸色涼鞋|Nude sandals|beige|s|1|2
boot|棕色短靴|Brown ankle boots|brown|s|3|3
sneaker|黑色運動鞋|Black trainers|black|s|2|1`,
        laundry: [0],
    },
};
const CAT = `loafer|Zara 黑色皮革樂福鞋|Zara black leather loafers|black|s|2|4|Zara|2990|f
heel|Zara 裸色尖頭高跟鞋|Zara nude pointed heels|beige|s|2|5|Zara|3490|f
heel|Zara 黑色高跟鞋|Zara black pumps|black|s|2|5|Zara|3290|f
tee|Uniqlo 白色圓領 T 恤|Uniqlo white crew tee|white|s|1|2|Uniqlo|390|u
tee|Uniqlo 淺灰圓領 T 恤|Uniqlo light-gray crew tee|gray|s|1|2|Uniqlo|390|u
tee|Uniqlo 條紋長袖 T 恤|Uniqlo striped long-sleeve tee|navy|t|1|2|Uniqlo|590|u
knit|Uniqlo 海軍藍羊毛針織衫|Uniqlo navy merino sweater|navy|s|2|4|Uniqlo|1290|u
knit|Uniqlo 黑色高領針織衫|Uniqlo black turtleneck|black|s|3|4|Uniqlo|1490|u
knit|Zara 紅色針織衫|Zara red knit|red|s|2|3|Zara|1490|f
hoodie|Uniqlo 灰色連帽衫|Uniqlo gray hoodie|gray|s|3|2|Uniqlo|1490|u
blouse|Zara 黑色緞面襯衫|Zara black satin blouse|black|s|1|5|Zara|1890|f
blouse|Zara 白色荷葉領上衣|Zara white ruffle blouse|white|s|1|4|Zara|1590|f
shirt|Zara 白色亞麻襯衫|Zara white linen shirt|white|s|1|3|Zara|1690|u
shirt|Uniqlo 白色修身襯衫|Uniqlo white slim shirt|white|s|2|4|Uniqlo|990|m
trousers|Zara 酒紅色西裝褲|Zara burgundy trousers|burgundy|s|2|5|Zara|2490|f
trousers|Uniqlo 黑色西裝褲|Uniqlo black trousers|black|s|2|5|Uniqlo|1990|u
trousers|Uniqlo 卡其寬褲|Uniqlo khaki wide trousers|beige|s|2|3|Uniqlo|1290|u
jeans|Uniqlo 淺藍牛仔褲|Uniqlo light-blue jeans|blue|s|2|2|Uniqlo|1290|u
pants|Uniqlo 橄欖綠工作褲|Uniqlo olive cargo pants|olive|s|2|2|Uniqlo|1490|u
skirt|Zara 黑色中長裙|Zara black midi skirt|black|s|2|4|Zara|1590|f
shorts|Uniqlo 黑色運動短褲|Uniqlo black sport shorts|black|s|1|1|Uniqlo|590|u
sneaker|Zara 白色皮革運動鞋|Zara white leather sneakers|white|s|2|2|Zara|2290|u
loafer|Zara 黑色德比鞋|Zara black derby shoes|black|s|2|5|Zara|3590|m
loafer|Zara 棕色皮鞋|Zara brown leather shoes|brown|s|2|4|Zara|3290|m
boot|Zara 黑色切爾西靴|Zara black Chelsea boots|black|s|3|4|Zara|3790|u`;

/* ---------- item model + simulated CLIP vector ---------- */
let UID = 0;
function vec(it) {
    const rgb = hex(COL[it.color][0]);
    const v = [];
    Object.keys(SUBS).forEach((s) => v.push(s === it.sub ? 1.5 : 0));
    rgb.forEach((c) => v.push((c / 255 - 0.5) * 4.5));
    Object.keys(PAT).forEach((p) => v.push(p === it.pat ? 0.6 : 0));
    v.push((it.warm - 2) * 0.3, (it.formal - 3) * 0.25);
    return v;
}
function hex(h) {
    return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
}
function cos(a, b) {
    let d = 0,
        x = 0,
        y = 0;
    for (let i = 0; i < a.length; i++) {
        d += a[i] * b[i];
        x += a[i] * a[i];
        y += b[i] * b[i];
    }
    return d / Math.sqrt(x * y);
}
function mk(line, pre) {
    const a = line.split("|");
    const sub = a[0];
    const hasName = true;
    const it = {
        id: pre + ++UID,
        sub,
        cat: SUBS[sub][0],
        zh: a[1],
        en: a[2],
        color: a[3],
        pat: a[4],
        warm: +a[5],
        formal: +a[6],
        laundry: false,
        worn: 0,
        src: "catalog",
    };
    if (a[7]) {
        it.brand = a[7];
        it.price = +a[8];
        it.gender = a[9];
    }
    it.vec = vec(it);
    return it;
}
const CATALOG = CAT.split("\n").map((l) => mk(l, "c"));
CATALOG.push(mk("blazer|西裝外套|Blazer|beige|s|2|3|Demo|990|u", "c"));
CATALOG.push(mk("denimj|牛仔外套|Denim jacket|beige|s|2|3|Demo|990|u", "c"));
CATALOG.push(mk("trench|風衣|Trench coat|beige|s|2|3|Demo|990|u", "c"));
CATALOG.push(mk("puffer|羽絨外套|Puffer|beige|s|2|3|Demo|990|u", "c"));
CATALOG.push(mk("cardigan|針織外套|Cardigan|beige|s|2|3|Demo|990|u", "c"));
CATALOG.push(mk("necklace|項鍊|Necklace|beige|s|2|3|Demo|990|u", "c"));
CATALOG.push(mk("earrings|耳環|Earrings|beige|s|2|3|Demo|990|u", "c"));
CATALOG.push(mk("ring|戒指|Ring|beige|s|2|3|Demo|990|u", "c"));
CATALOG.push(mk("bracelet|手鍊|Bracelet|beige|s|2|3|Demo|990|u", "c"));
CATALOG.push(mk("watch|手錶|Watch|beige|s|2|3|Demo|990|u", "c"));
CATALOG.push(mk("hat|帽子|Hat|beige|s|2|3|Demo|990|u", "c"));
CATALOG.push(mk("belt|皮帶|Belt|beige|s|2|3|Demo|990|u", "c"));
CATALOG.push(mk("bag|包包|Bag|beige|s|2|3|Demo|990|u", "c"));
CATALOG.push(mk("scarf|圍巾|Scarf|beige|s|2|3|Demo|990|u", "c"));

function seasonOf(it) {
    return it.warm === 1
        ? ["夏", "Summer"]
        : it.warm === 3
            ? ["冬", "Winter"]
            : ["春秋", "Spring/Fall"];
}

const ST = {};
function initPersona(k) {
    const p = P[k];
    const items = p.w.split("\n").map((l) => mk(l, k[0]));
    items.forEach((i) => (i.src = "photo"));
    p.laundry.forEach((ix) => {
        items[ix].laundry = true;
    });
    const r = rng(k.length * 977 + k.charCodeAt(0)),
        pick = (a) => a[Math.floor(r() * a.length)];
    const by = (c) => items.filter((i) => i.cat === c && !i.laundry);
    const worn = [-1, -2, -4, -6, -9, -13].map((off) => {
        const t = pick(by("top")),
            b = pick(by("bottom")),
            s = pick(by("shoe"));
        [t, b, s].forEach((i) => i.worn++);
        return { off, ids: [t.id, b.id, s.id], ok: true };
    });
    ST[k] = {
        items,
        worn,
        sel: {},
        likes: {},
        list: [],
        city: p.city,
        pref: p.pref,
        styles: p.styles.slice(),
        cal: true,
        consent: false,
        photo: null,
        events: p.ev.map((e) => ({ z: e[0], e: e[1], occ: e[2], comp: e[3] })),
    };
}
Object.keys(P).forEach(initPersona);
Object.keys(P).forEach(k=>{ST[k].items.push({...mk("blazer|米色西裝外套|Beige blazer|beige|s|2|4",k[0]),location:"衣櫃"},{...mk("bag|棕色包包|Brown bag|brown|s|1|3",k[0]),location:"收納箱"});});
const cur = () => ST[S.persona],
    pp = () => P[S.persona];
const byId = (id) =>
    cur().items.find((i) => i.id === id) || CATALOG.find((i) => i.id === id);

/* ---------- garment drawing ---------- */
let PC = 0;
const SH = {
    tee: "M30 12 L42 8 Q50 17 58 8 L70 12 L93 30 L83 45 L72 38 L72 90 L28 90 L28 38 L17 45 L7 30 Z",
    long: "M30 10 L44 6 L50 18 L56 6 L70 10 L96 72 L84 76 L72 40 L72 92 L28 92 L28 40 L16 76 L4 72 Z",
    pants: "M26 6 L74 6 L80 96 L54 96 L50 36 L46 96 L20 96 Z",
    wide: "M24 6 L76 6 L92 96 L56 96 L50 40 L44 96 L8 96 Z",
    shorts: "M26 6 L74 6 L82 58 L54 58 L50 30 L46 58 L18 58 Z",
    skirt: "M30 6 L70 6 L92 92 L8 92 Z",
};
function lum(h) {
    const [r, g, b] = hex(h);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}
function patDef(id, pat, base) {
    const dark = lum(base) > 0.6;
    const c = dark ? "#2b2b2b" : "#ffffff",
        o = dark ? 0.35 : 0.5;
    if (pat === "t")
        return `<pattern id="${id}" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="4" fill="${c}" opacity="${o}"/></pattern>`;
    if (pat === "c")
        return `<pattern id="${id}" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M0 0H12M0 0V12" stroke="${c}" stroke-width="2" opacity="${o}"/></pattern>`;
    if (pat === "d")
        return `<pattern id="${id}" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="5" cy="5" r="2" fill="${c}" opacity="${o}"/></pattern>`;
    return `<pattern id="${id}" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="2.6" fill="#e8708f" opacity=".85"/><circle cx="12" cy="11" r="2.2" fill="#f2c14e" opacity=".9"/><path d="M10 3 q3 2 5 0" stroke="#4a9b6b" stroke-width="1.5" fill="none"/></pattern>`;
}
function gInner(it) {
    if(it.cat === "outer") return `<path d="M30 10 L44 6 L50 22 L56 6 L70 10 L96 72 L84 76 L72 40 L72 94 L28 94 L28 40 L16 76 L4 72 Z" fill="${COL[it.color][0]}" stroke="#77695e"/><path d="M44 6 L35 28 L50 44 L65 28 L56 6 M50 44V94 M32 70H44 M56 70H68" fill="none" stroke="#77695e" stroke-width="2"/>`;
    if(it.cat === "accessory") {const c=COL[it.color][0]; const shapes={necklace:`<path d="M20 15 Q10 75 50 85 Q90 75 80 15" fill="none" stroke="${c}" stroke-width="6"/><circle cx="50" cy="85" r="8" fill="${c}"/>`, earrings:`<circle cx="30" cy="48" r="17" fill="none" stroke="${c}" stroke-width="7"/><circle cx="70" cy="48" r="17" fill="none" stroke="${c}" stroke-width="7"/>`, bag:`<rect x="15" y="35" width="70" height="55" rx="8" fill="${c}"/><path d="M35 35V22Q50 5 65 22V35" fill="none" stroke="#77695e" stroke-width="5"/>`,hat:`<path d="M25 60L35 25H65L75 60Z" fill="${c}"/><ellipse cx="50" cy="65" rx="45" ry="10" fill="${c}"/>`,belt:`<rect x="8" y="42" width="84" height="16" rx="4" fill="${c}"/><rect x="42" y="38" width="20" height="24" fill="none" stroke="#77695e" stroke-width="4"/>`,scarf:`<path d="M25 12Q80 5 72 35L42 55L75 90H55L28 55L15 90H5L20 45Q5 20 25 12Z" fill="${c}"/>`,watch:`<rect x="40" y="5" width="20" height="90" rx="5" fill="${c}"/><circle cx="50" cy="50" r="22" fill="#fff" stroke="#77695e" stroke-width="4"/><path d="M50 35V50L62 56" stroke="#77695e" fill="none"/>`};return shapes[it.sub]||`<ellipse cx="50" cy="50" rx="30" ry="24" fill="none" stroke="${c}" stroke-width="9"/>`;}

    const col = COL[it.color][0],
        id = "p" + ++PC,
        st =
            'stroke="rgba(0,0,0,.38)" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round"';
    const dt =
        'fill="none" stroke="rgba(0,0,0,.32)" stroke-width="1.2" stroke-linecap="round"';
    let body = "",
        det = "",
        shape = "";
    const dk = lum(col) > 0.5 ? "#2a2a2a" : "#f2f2f2";
    if (it.cat === "top") {
        shape = it.sub === "tee" || it.sub === "blouse" ? SH.tee : SH.long;
        det =
            it.sub === "shirt"
                ? `<path d="M42 6 L50 22 L58 6 M50 22 L50 92" ${dt}/>`
                : it.sub === "blouse"
                    ? `<path d="M42 8 L50 26 L58 8" ${dt}/>`
                    : it.sub === "knit"
                        ? `<path d="M40 8 Q50 20 60 8 M28 84 L72 84" ${dt}/>`
                        : it.sub === "hoodie"
                            ? `<path d="M36 8 Q50 -6 64 8 Q60 26 50 28 Q40 26 36 8 M34 68 L66 68 L70 86 L30 86 Z" ${dt}/>`
                            : `<path d="M42 8 Q50 18 58 8" ${dt}/>`;
    } else if (it.cat === "bottom") {
        shape =
            it.sub === "skirt"
                ? SH.skirt
                : it.sub === "shorts"
                    ? SH.shorts
                    : it.sub === "trousers" &&
                        (it.zh.includes("寬") || it.en.includes("ide"))
                        ? SH.wide
                        : SH.pants;
        det =
            `<path d="M26 14 L74 14" ${dt}/>` +
            (it.sub === "jeans"
                ? `<path d="M30 8 Q36 26 46 10 M54 10 Q64 26 70 8" ${dt}/>`
                : it.sub === "skirt"
                    ? `<path d="M40 14 L28 88 M50 14 L50 90 M60 14 L72 88" ${dt}/>`
                    : it.sub === "trousers"
                        ? `<path d="M37 16 L33 94 M63 16 L67 94" ${dt}/>`
                        : "");
    } else {
        const sole = it.sub === "sneaker" ? "#f2f2f2" : "#2a2a2a";
        const sp = {
            sneaker: [
                "M6 74 L6 54 Q26 52 36 38 L46 46 Q58 54 78 58 Q94 62 94 74 Z",
                '<path d="M38 42 L48 50 M44 38 L54 46" ' + dt + "/>",
                "M6 74 H94 V82 H6 Z",
            ],
            loafer: [
                "M6 74 L6 50 Q34 48 50 38 Q66 54 86 60 Q94 64 94 74 Z",
                '<path d="M40 52 L58 56" ' + dt + "/>",
                "M6 74 H94 V80 H6 Z",
            ],
            heel: [
                "M10 30 L32 30 Q38 56 66 62 Q92 66 94 76 L12 76 Z",
                '<path d="M10 30 L32 30" ' + dt + "/>",
                "M8 76 L18 76 L14 92 L8 92 Z",
            ],
            sandal: [
                "M30 72 L40 52 L52 72 M56 72 L68 56 L80 72 L56 72 Z",
                "",
                "M6 72 H94 V80 H6 Z",
            ],
            boot: [
                "M28 8 L58 8 L60 52 Q88 56 94 70 L94 80 L22 80 Z",
                '<path d="M28 20 L58 20" ' + dt + "/>",
                "M22 78 H94 V86 H22 Z",
            ],
        }[it.sub];
        shape = sp[0];
        det = sp[1];
        body = `<path d="${sp[2]}" fill="${sole}" ${st}/>`;
    }
    let defs = "",
        ov = "";
    if (it.pat !== "s") {
        defs = patDef(id, it.pat, col);
        ov = `<path d="${shape}" fill="url(#${id})"/>`;
    }
    return `<defs>${defs}</defs>${body}<path d="${shape}" fill="${col}" ${st}/>${ov}${det}`;
}
function gsvg(it) {
    return `<svg viewBox="0 0 100 100" aria-hidden="true">${gInner(it)}</svg>`;
}
const BOX = { top: [64, 78, 172, 150], shoe: [0, 392, 62, 48] };
function scene(occ, mode) {
    if (mode === "flat")
        return `<rect width="300" height="460" fill="#e8e6e0"/><path d="M0 0H300V460H0Z" fill="none"/>`;
    const sc = {
        work: `<rect width="300" height="460" fill="#cfd6df"/><rect x="30" y="40" width="110" height="150" fill="#eaf1f8" stroke="#aab4c0" stroke-width="4"/><path d="M85 40V190M30 115H140" stroke="#aab4c0" stroke-width="3"/><rect y="420" width="300" height="40" fill="#8f98a3"/>`,
        client: `<rect width="300" height="460" fill="#c9d1db"/><rect x="20" y="30" width="260" height="300" fill="#e3ebf3" stroke="#9aa6b4" stroke-width="3"/><path d="M107 30V330M193 30V330" stroke="#9aa6b4" stroke-width="3"/><rect y="420" width="300" height="40" fill="#7d8794"/>`,
        wedding: `<rect width="300" height="460" fill="#efe6ea"/><path d="M40 440V150Q150 -10 260 150V440" fill="none" stroke="#fff" stroke-width="18"/><g fill="#e8a3b5"><circle cx="48" cy="170" r="14"/><circle cx="250" cy="165" r="14"/><circle cx="90" cy="95" r="12"/><circle cx="210" cy="92" r="12"/><circle cx="150" cy="60" r="13"/></g><g fill="#7fb08f"><circle cx="64" cy="140" r="9"/><circle cx="236" cy="136" r="9"/><circle cx="120" cy="72" r="8"/><circle cx="182" cy="72" r="8"/></g><rect y="420" width="300" height="40" fill="#d9ccd1"/>`,
        dinner: `<rect width="300" height="460" fill="#3a2d33"/><circle cx="50" cy="80" r="36" fill="#f2b660" opacity=".35"/><circle cx="250" cy="110" r="30" fill="#f2b660" opacity=".3"/><circle cx="50" cy="80" r="8" fill="#ffd98e"/><circle cx="250" cy="110" r="7" fill="#ffd98e"/><rect y="420" width="300" height="40" fill="#241b20"/>`,
        casual: `<rect width="300" height="460" fill="#cfe3ee"/><circle cx="240" cy="60" r="26" fill="#fff3b8"/><path d="M0 400Q100 330 200 390T300 360V460H0Z" fill="#9cc79b"/><rect y="425" width="300" height="35" fill="#86b387"/>`,
        gym: `<rect width="300" height="460" fill="#d8dbe0"/><path d="M0 330H300" stroke="#b6bbc4" stroke-width="3"/><rect x="40" y="120" width="220" height="10" rx="5" fill="#8c93a0"/><circle cx="48" cy="125" r="22" fill="#6c7482"/><circle cx="252" cy="125" r="22" fill="#6c7482"/><rect y="420" width="300" height="40" fill="#9aa1ad"/>`,
    };
    return sc[occ] || sc.casual;
}
function tryon(o, occ, mode) {
    const [t, b, s] = o.ids.map(byId);
    const skin = "#d9bfa8";
    if (mode === "flat") {
        const bh = b.sub === "skirt" ? 120 : b.sub === "shorts" ? 90 : 150;
        return `<svg viewBox="0 0 300 460" role="img">${scene(occ, "flat")}<svg x="55" y="16" width="190" height="170" viewBox="0 0 100 100" preserveAspectRatio="none">${gInner(t)}</svg><svg x="85" y="190" width="130" height="${bh}" viewBox="0 0 100 100" preserveAspectRatio="none">${gInner(b)}</svg><svg x="40" y="${200 + bh}" width="100" height="70" viewBox="0 0 100 100">${gInner(s)}</svg><g transform="translate(300 0) scale(-1 1)"><svg x="40" y="${200 + bh}" width="100" height="70" viewBox="0 0 100 100">${gInner(s)}</svg></g></svg>`;
    }
    const bh = b.sub === "skirt" ? 130 : b.sub === "shorts" ? 105 : 178;
    return `<svg viewBox="0 0 300 460" role="img">${scene(occ, "body")}<ellipse cx="150" cy="52" rx="25" ry="30" fill="${skin}"/><rect x="141" y="76" width="18" height="22" fill="${skin}"/><path d="M128 40 Q150 12 172 40 Q170 26 150 22 Q130 26 128 40Z" fill="#3b2f2a"/>
 <rect x="66" y="92" width="22" height="150" rx="11" fill="${skin}"/><rect x="212" y="92" width="22" height="150" rx="11" fill="${skin}"/><rect x="104" y="210" width="38" height="190" rx="14" fill="${skin}"/><rect x="158" y="210" width="38" height="190" rx="14" fill="${skin}"/>
 <svg x="${BOX.top[0]}" y="${BOX.top[1]}" width="${BOX.top[2]}" height="${BOX.top[3]}" viewBox="0 0 100 100" preserveAspectRatio="none">${gInner(t)}</svg>
 <svg x="82" y="208" width="136" height="${bh}" viewBox="0 0 100 100" preserveAspectRatio="none">${gInner(b)}</svg>
 <svg x="84" y="${BOX.shoe[1]}" width="62" height="48" viewBox="0 0 100 100">${gInner(s)}</svg><g transform="translate(300 0) scale(-1 1)"><svg x="84" y="${BOX.shoe[1]}" width="62" height="48" viewBox="0 0 100 100">${gInner(s)}</svg></g></svg>`;
}

/* ---------- rules engine (brief 4-1) ---------- */
function wx(d) {
    const c = CITY[cur().city];
    const b = WX[d];
    return {
        hi: b.hi + c[2],
        lo: b.lo + c[2],
        f: b.f + c[2],
        r: Math.max(0, Math.min(100, b.r + c[3])),
        h: b.h,
    };
}
function allowed(t) {
    return t >= 28 ? [1] : t >= 20 ? [1, 2] : t >= 14 ? [2, 3] : [3];
}
function ctxOf(d) {
    const e = cur().events[d];
    const w = wx(d);
    const pr = cur().pref;
    const shift = pr === "hot" ? 3 : pr === "cold" ? -3 : 0;
    const eff = w.f + shift;
    const occ = OCC.find((o) => o.k === e.occ),
        comp = COMP.find((c) => c.k === e.comp);
    let tg = occ.b + comp.a;
    if (comp.min) tg = Math.max(comp.min, tg);
    tg = Math.min(5, tg);
    return {
        d,
        e,
        w,
        eff,
        shift,
        allow: allowed(eff),
        occ,
        comp,
        target: tg,
        rain: w.r,
    };
}
function valid(t, b, s, c) {
    if (t.laundry || b.laundry || s.laundry) return false;
    if ([t, b, s].some((i) => Math.abs(i.formal - c.target) > 1)) return false;
    if (!c.allow.includes(t.warm) || !c.allow.includes(b.warm)) return false;
    if (c.rain >= 60 && s.sub === "sandal") return false;
    if ([t, b, s].filter((i) => i.pat !== "s").length > 1) return false;
    if (new Set([t.color, b.color, s.color]).size > 3) return false;
    return true;
}
function allValid(items, c) {
    const T = items.filter((i) => i.cat === "top"),
        B = items.filter((i) => i.cat === "bottom"),
        Sh = items.filter((i) => i.cat === "shoe"),
        r = [];
    T.forEach((t) =>
        B.forEach((b) =>
            Sh.forEach((s) => {
                if (valid(t, b, s, c)) r.push([t, b, s]);
            }),
        ),
    );
    return r;
}
const keyOf = (ids) => ids.join(">");
function entries(except) {
    const st = cur(),
        e = st.worn.map((w) => ({ off: w.off, ids: w.ids }));
    Object.keys(st.sel).forEach((d) => {
        if (+d !== except) e.push({ off: +d, ids: st.sel[d].ids });
    });
    return e;
}
function sinceWorn(id, d) {
    let m = 14;
    entries(d).forEach((e) => {
        if (e.ids.includes(id)) {
            m = Math.min(m, Math.abs(d - e.off));
        }
    });
    return m;
}
function scoreOf(o, c) {
    const st = cur();
    let s = 50;
    const reasons = [];
    o.forEach((i) => {
        if (i.formal === c.target) s += 8;
    });
    const ex = o.filter((i) => i.formal === c.target).length;
    const neu = o.filter((i) => NEUTRAL.has(i.color)).length;
    s += neu * 4;
    const fresh =
        o.reduce((a, i) => a + Math.min(sinceWorn(i.id, c.d), 14), 0) / 42;
    s += fresh * 8;
    const tags = new Set();
    st.styles.forEach((k) => STYLETAG[k].forEach((x) => tags.add(x)));
    const sm = o.filter((i) => tags.has(i.sub)).length;
    s += sm * 3;
    const lk = st.likes[keyOf(o.map((i) => i.id))] || 0;
    s += lk * 12;
    reasons.push(
        L(
            `體感 ${c.w.f}°C${c.shift ? `（${c.shift > 0 ? "怕熱 +3" : "怕冷 −3"}→ ${c.eff}°C）` : ""}，上衣與下身為${c.allow.map((x) => N({ z: WARM[x][0], e: WARM[x][1] })).join("／")}`,
            `Feels ${c.w.f}°C${c.shift ? ` (${c.shift > 0 ? "runs hot +3" : "runs cold −3"} → ${c.eff}°C)` : ""}: top and bottom are ${c.allow
                .map((x) => WARM[x][1])
                .join(" / ")
                .toLowerCase()}`,
        ),
    );
    reasons.push(
        L(
            `正式度 ${o.map((i) => i.formal).join("／")}，目標 ${c.target}（${c.occ.z}${c.comp.a ? `＋${c.comp.z}` : ""}）`,
            `Formality ${o.map((i) => i.formal).join("/")} vs target ${c.target} (${c.occ.e}${c.comp.a ? ` + ${c.comp.e}` : ""})`,
        ),
    );
    const cols = [...new Set(o.map((i) => i.color))];
    reasons.push(
        L(
            `${cols.length} 色${neu === 3 ? "，全為中性色" : ""}${o.some((i) => i.pat !== "s") ? "，1 件圖案" : ""}`,
            `${cols.length} colours${neu === 3 ? ", all neutrals" : ""}${o.some((i) => i.pat !== "s") ? ", one pattern piece" : ""}`,
        ),
    );
    const f = Math.min(...o.map((i) => sinceWorn(i.id, c.d)));
    if (f >= 14)
        reasons.push(
            L(
                "這三件近兩週都沒穿過",
                "None of these were worn in the last two weeks",
            ),
        );
    return { score: Math.max(1, Math.min(99, Math.round(s))), reasons };
}
function options(d, pool, forceItem) {
    const c = ctxOf(d);
    const items = pool || cur().items;
    let all = allValid(items, c);
    if (forceItem) all = all.filter((o) => o.some((i) => i.id === forceItem.id));
    const total = all.length;
    let relaxed = false;
    const ent = entries(d);
    const okKey = (o) =>
        !ent.some(
            (e) =>
                Math.abs(e.off - d) < 14 && keyOf(e.ids) === keyOf(o.map((i) => i.id)),
        );
    const okTop = (o) =>
        !ent.some((e) => Math.abs(e.off - d) < 3 && e.ids.includes(o[0].id));
    let cand = all.filter(okKey);
    let c2 = cand.filter(okTop);
    if (c2.length >= 3) cand = c2;
    else if (cand.length > c2.length && cand.length) relaxed = true;
    const sc = cand
        .map((o) => ({ o, ids: o.map((i) => i.id), ...scoreOf(o, c) }))
        .sort(
            (a, b) => b.score - a.score || (a.ids.join() < b.ids.join() ? -1 : 1),
        );
    const pick = [];
    const diff = (a, b) => a.ids.filter((x, i) => x !== b.ids[i]).length;
    for (const need of [2, 1, 0]) {
        for (const x of sc) {
            if (pick.length >= 3) break;
            if (!pick.includes(x) && pick.every((p) => diff(p, x) >= need))
                pick.push(x);
        }
        if (pick.length >= 3) break;
    }
    return { ctx: c, total, opts: pick.slice(0, 3), relaxed };
}
function missing(c, items) {
    const r = [];
    ["top", "bottom", "shoe"].forEach((cat) => {
        const n = items.filter(
            (i) =>
                i.cat === cat &&
                !i.laundry &&
                Math.abs(i.formal - c.target) <= 1 &&
                (cat === "shoe"
                    ? !(c.rain >= 60 && i.sub === "sandal")
                    : c.allow.includes(i.warm)),
        ).length;
        if (!n) r.push(cat);
    });
    return r;
}
function unlock(item, pool) {
    const items = pool || cur().items;
    let delta = 0;
    const per = [];
    for (let d = 0; d < 7; d++) {
        const c = ctxOf(d);
        const a = allValid(items, c).length,
            b = allValid(items.concat([item]), c).length;
        per.push(b - a);
        delta += b - a;
    }
    return { delta, per };
}
function similar(item) {
    return cur()
        .items.filter((i) => i.cat === item.cat)
        .map((i) => ({ i, s: cos(item.vec, i.vec) }))
        .filter((x) => x.s >= 0.85)
        .sort((a, b) => b.s - a.s)
        .slice(0, 3);
}
function catalogFor() {
    const g = pp().g;
    return CATALOG.filter((c) => c.gender === "u" || c.gender === g);
}
function bestNext() {
    return catalogFor()
        .filter((c) => !similar(c).length)
        .map((c) => ({ c, ...unlock(c) }))
        .sort((a, b) => b.delta - a.delta)
        .slice(0, 5);
}

/* ---------- ui bits ---------- */
const name = (i) => N(i);
const nameOf = (i) => (S.lang === "zh" ? i.zh : i.en);
function tile(i, cls = "") {
    return `<div class="tile ${cls}">${gsvg(i)}</div>`;
}
function mini(i) {
    return `<span class="mini">${gsvg(i)}</span>`;
}
function tagsOf(i) {
    const se = seasonOf(i);
    return `<span class="chip">${COL[i.color][S.lang === "zh" ? 1 : 2]}</span><span class="chip">${S.lang === "zh" ? PAT[i.pat][0] : PAT[i.pat][1]}</span><span class="chip">${S.lang === "zh" ? WARM[i.warm][0] : WARM[i.warm][1]}</span><span class="chip acc">${L("正式度", "Formal")} ${i.formal}</span><span class="chip">${S.lang === "zh" ? se[0] : se[1]}</span>`;
}
function wxIcon(r) {
    return r >= 60
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M7 15a4 4 0 1 1 1-7.9A5 5 0 0 1 18 9a3 3 0 0 1 0 6z"/><path d="M9 18l-1 3M13 18l-1 3M17 18l-1 3"/></svg>`
        : r >= 30
            ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M7 18a4 4 0 1 1 1-7.9A5 5 0 0 1 18 12a3 3 0 0 1 0 6z"/></svg>`
            : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg>`;
}
function toast(m) {
    S.toast = m;
    $("#toastMount").innerHTML =
        `<div class="toast" role="status">${esc(m)}</div>`;
    clearTimeout(toast.t);
    toast.t = setTimeout(() => {
        $("#toastMount").innerHTML = "";
    }, 2200);
}

/* ---------- pages ---------- */
function pPlan() {
    const st = cur(),
        p = pp(),
        d = S.day;
    const r = options(d);
    const c = r.ctx;
    const sel = st.sel[d];
    const week = st.events
        .map((e, i) => {
            const w = wx(i),
                cc = ctxOf(i),
                rr = allValid(st.items, cc).length,
                sl = st.sel[i];
            const status = sl
                ? `<span class="chip good st">${L("已選", "Chosen")}</span>`
                : rr < 3
                    ? `<span class="chip bad st">${L("缺口", "Gap")} ${rr}</span>`
                    : `<span class="chip st">${rr} ${L("套可穿", "valid")}</span>`;
            return `<button class="day" data-a="day" data-i="${i}" aria-pressed="${i === d}"><span class="muted">${N({ z: DAYS[i][0], e: DAYS[i][1] })} ${DATES[i]}</span><b>${w.f}°</b><span class="row" style="gap:4px;font-size:12px;color:var(--muted)">${wxIcon(w.r)}${w.r}%</span><span class="ev">${nameOf({ zh: e.z, en: e.e })}</span>${status}</button>`;
        })
        .join("");
    const gap = r.total < 3;
    const miss = missing(c, st.items);
    const cards = r.opts
        .map((x, ix) => {
            const on = sel && keyOf(sel.ids) === keyOf(x.ids);
            return optCard(x, ix, on, c);
        })
        .join("");
    const extra =
        sel && !r.opts.some((x) => keyOf(x.ids) === keyOf(sel.ids))
            ? optCard({ ids: sel.ids, ...scoreOf(sel.ids.map(byId), c) }, 9, true, c)
            : "";
    const wl = st.worn.slice().sort((a, b) => b.off - a.off);
    Object.keys(st.sel).forEach((k) => { });
    const logRows = [
        ...Object.keys(st.sel).map((k) => ({
            off: +k,
            ids: st.sel[k].ids,
            ok: st.sel[k].ok,
            sel: true,
        })),
        ...st.worn.map((w) => ({ ...w, sel: false })),
    ].sort((a, b) => b.off - a.off);
    return `<div class="persona"><h2>${N({ z: "本週穿搭規劃", e: "This week's outfit plan" })}</h2><p>${L("依各區天氣、行程與同行對象，每天提供 3 選 1。", "Three picks a day, based on local weather, your events and who you are with.")}</p>
 <span class="row" style="margin-left:auto"><button class="btn pri" data-a="auto">${L("一鍵排滿一週", "Auto-plan the week")}</button><button class="btn" data-a="clear">${L("清除", "Clear")}</button></span></div>
 <div class="week">${week}</div>
 <div class="split"><aside class="card" style="display:flex;flex-direction:column;gap:12px"><div><span class="muted">${N({ z: DAYS[d][0], e: DAYS[d][1] })} ${DATES[d]} · ${L(CITY[st.city][0], CITY[st.city][1])}</span><h3>${esc(nameOf({ zh: st.events[d].z, en: st.events[d].e }))}</h3></div>
  <div class="field"><label for="occ">${L("場合", "Occasion")}</label><select id="occ" data-c="occ">${OCC.map((o) => `<option value="${o.k}" ${o.k === c.e.occ ? "selected" : ""}>${N(o)}</option>`).join("")}</select></div>
  <div class="field"><label for="comp">${L("同行對象", "Who with")}</label><select id="comp" data-c="comp">${COMP.map((o) => `<option value="${o.k}" ${o.k === c.e.comp ? "selected" : ""}>${N(o)}</option>`).join("")}</select></div>
  <table><tr><th>${L("天氣（氣象署模擬）", "Weather (CWA, simulated)")}</th><td class="mono">${c.w.lo}–${c.w.hi}°C<br>${L("體感", "Feels")} ${c.w.f}°C<br>${L("濕度", "Humidity")} ${c.w.h}%<br>${L("降雨", "Rain")} ${c.w.r}%</td></tr>
  <tr><th>${L("保暖度", "Warmth")}</th><td>${c.allow.map((x) => L(WARM[x][0], WARM[x][1])).join(" / ")}${c.shift ? `<br><span class="muted">${c.shift > 0 ? L("怕熱 +3°C", "Runs hot +3°C") : L("怕冷 −3°C", "Runs cold −3°C")}</span>` : ""}</td></tr>
  <tr><th>${L("正式度目標", "Formality target")}</th><td class="mono">${c.target} <span class="muted">(${c.occ.b}${c.comp.a ? "+" + c.comp.a : ""}${c.comp.min ? ", min " + c.comp.min : ""})</span></td></tr>
  <tr><th>${L("降雨限制", "Rain rule")}</th><td>${c.rain >= 60 ? L("不推薦涼鞋／拖鞋", "No sandals or slides") : L("無限制", "None")}</td></tr></table>
  <span class="chip ${gap ? "bad" : "good"}" style="align-self:flex-start">${r.total} ${L("套有效穿搭", "valid outfits")}</span></aside>
  <section style="display:flex;flex-direction:column;gap:14px;min-width:0">
  ${gap ? `<div class="banner bad"><div><b>${L("衣櫃缺口", "Wardrobe gap")}</b><br>${L(`${N({ z: DAYS[d][0], e: DAYS[d][1] })}只有 ${r.total} 套有效穿搭，少於 3 套。${miss.length ? `缺少：${miss.map((m) => CATN[m][0]).join("、")}（正式度 ${Math.max(1, c.target - 1)}–${Math.min(5, c.target + 1)}）。` : "現有單品的搭配限制太多。"}`, `Only ${r.total} valid outfits for this day, fewer than 3. ${miss.length ? `Missing: ${miss.map((m) => CATN[m][1].toLowerCase()).join(", ")} at formality ${Math.max(1, c.target - 1)}–${Math.min(5, c.target + 1)}.` : "The current pieces are too restricted to combine."}`)}<br><button class="btn sm" style="margin-top:6px" data-a="tab" data-t="shop">${L("到購物檢查看建議", "See buy suggestions")}</button></div></div>` : ""}
  ${r.relaxed ? `<div class="banner warn">${L("可選單品有限，已放寬「同一件上衣 3 天內不重複」。", 'Few options left, so the "same top within 3 days" limit was relaxed.')}</div>` : ""}
  <div class="opts">${cards}${extra}</div>
  ${!r.opts.length && !extra ? `<div class="card muted">${L("這天沒有符合規則的穿搭。", "No outfit meets the rules for this day.")}</div>` : ""}
  <div class="card"><h3>${L("穿著紀錄", "Wear log")}</h3><p class="muted" style="margin:4px 0 10px">${L("選定即記錄為已穿；隔天早上確認。14 天內不重複同一套。", "Choosing an outfit logs it as worn. Confirm the next morning. No repeats within 14 days.")}</p>
  <div class="scroll"><table><tr><th>${L("日期", "Day")}</th><th>${L("穿搭", "Outfit")}</th><th>${L("狀態", "Status")}</th></tr>${logRows.map((w) => `<tr><td class="mono">${w.off < 0 ? L("前", "") + Math.abs(w.off) + L(" 天", " d ago") : N({ z: DAYS[w.off][0], e: DAYS[w.off][1] }) + " " + DATES[w.off]}</td><td><span class="row" style="gap:4px">${w.ids.map((id) => mini(byId(id))).join("")}</span></td><td>${w.ok ? `<span class="chip good">${L("已確認", "Confirmed")}</span>` : `<button class="btn sm" data-a="confirm" data-i="${w.off}">${L("確認已穿", "Confirm worn")}</button>`}</td></tr>`).join("")}</table></div></div>
  </section></div>`;
}
function optCard(x, ix, on, c) {
    const its = x.ids.map(byId);
    const lk = cur().likes[keyOf(x.ids)] || 0;
    return `<article class="card opt ${on ? "sel" : ""}"><div class="stage">${tryon({ ids: x.ids }, c.e.occ, "body")}</div>
 <div class="row" style="justify-content:space-between"><b>${ix === 9 ? L("已選", "Chosen") : L("選項", "Option") + " " + "ABC"[ix]}</b><span class="chip acc mono">${x.score}</span></div>
 <div class="pieces">${its.map((i) => `<span>${mini(i)}<em>${esc(nameOf(i))}</em></span>`).join("")}</div>
 <ul class="reasons">${x.reasons.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>
 <div class="row" style="gap:6px;margin-top:auto"><button class="btn ${on ? "" : "pri"} sm" data-a="pick" data-k="${x.ids.join(">")}">${on ? L("取消選擇", "Unselect") : L("選這套", "Choose")}</button><button class="btn sm" data-a="view" data-k="${x.ids.join(">")}">${L("試穿預覽", "Try on")}</button><button class="btn sm" data-a="like" data-k="${x.ids.join(">")}" data-v="1" aria-pressed="${lk > 0}">👍</button><button class="btn sm" data-a="like" data-k="${x.ids.join(">")}" data-v="-1" aria-pressed="${lk < 0}">👎</button></div></article>`;
}

function pWardrobe() {
    const st = cur();
    let its = st.items.filter(
        (i) =>
            (S.filter === "all" || i.cat === S.filter) && (!S.location || (i.location || "") === S.location) &&
            (!S.fMax || i.formal === S.fMax) &&
            (!S.search ||
                (i.zh + i.en).toLowerCase().includes(S.search.toLowerCase())),
    );
    const cnt = (c) => st.items.filter((i) => i.cat === c).length;
    const wc = [1, 2, 3].map((w) => ({
        w,
        n: st.items.filter((i) => i.warm === w).length,
    }));
    const fc = [1, 2, 3, 4, 5].map((f) => ({
        f,
        n: st.items.filter((i) => i.formal === f).length,
    }));
    const mx = Math.max(...fc.map((x) => x.n), 1);
    return `<div class="persona"><h2>${L("我的衣櫃", "My wardrobe")}</h2><p>${st.items.length} ${L("件", "pieces")} · ${cnt("top")} ${L("上衣", "tops")} · ${cnt("bottom")} ${L("下身", "bottoms")} · ${cnt("shoe")} ${L("鞋子", "shoes")} · ${cnt("outer")} ${L("外套","outerwear")} · ${cnt("accessory")} ${L("飾品","accessories")}</p><span class="row" style="margin-left:auto"><button class="btn pri" data-a="addItem">${L("新增單品", "Add item")}</button></span></div>
 <div class="row"><div class="seg" role="group">${[
            ["all", L("全部", "All")],
            ["top", L("上衣", "Tops")],
            ["bottom", L("下身", "Bottoms")],
            ["shoe", L("鞋子", "Shoes")], ["outer", L("外套", "Outerwear")], ["accessory", L("飾品", "Accessories")],
        ]
            .map(
                (x) =>
                    `<button data-a="filter" data-v="${x[0]}" aria-pressed="${S.filter === x[0]}">${x[1]}</button>`,
            )
            .join("")}</div>
 <select id="fmax" data-c="fmax" aria-label="${L("正式度", "Formality")}"><option value="0">${L("所有正式度", "All formality")}</option>${[1, 2, 3, 4, 5].map((f) => `<option value="${f}" ${S.fMax === f ? "selected" : ""}>${f} · ${L(FORMAL[f][0], FORMAL[f][1])}</option>`).join("")}</select>
 <select data-c="locationFilter"><option value="">${L("所有存放位置","All locations")}</option>${[...new Set(st.items.map(i=>i.location).filter(Boolean))].map(v=>`<option value="${esc(v)}" ${S.location===v?"selected":""}>${esc(v)}</option>`).join("")}</select><input type="search" id="q" data-c="q" placeholder="${L("搜尋單品", "Search items")}" value="${esc(S.search)}"></div>
 <div class="grid">${its.map((i) => `<button class="card item" data-a="edit" data-id="${i.id}"><div class="tile">${gsvg(i)}${i.laundry ? `<span class="chip warn tag">${L("送洗中", "At laundry")}</span>` : ""}</div><h3>${esc(nameOf(i))}</h3><div class="tags">${tagsOf(i)}</div><span class="muted">📍 ${esc(i.location || L("未設定位置","Not assigned"))}</span><span class="muted" style="font-size:12px">${L("穿過", "Worn")} ${i.worn} ${L("次", "×")} · ${i.src === "photo" ? L("照片上傳", "Photo") : L("品牌目錄", "Catalog")}</span></button>`).join("") || `<p class="muted">${L("沒有符合的單品。", "No matching items.")}</p>`}</div>
 <div class="two"><div class="card"><h3>${L("正式度分布", "Formality spread")}</h3><div class="bars" style="margin-top:10px">${fc.map((x) => `<div class="bar2"><span>${x.f} · ${L(FORMAL[x.f][0], FORMAL[x.f][1])}</span><span><i style="width:${(x.n / mx) * 100}%"></i></span><span class="mono">${x.n}</span></div>`).join("")}</div></div>
 <div class="card"><h3>${L("保暖度分布", "Warmth spread")}</h3><div class="bars" style="margin-top:10px">${wc.map((x) => `<div class="bar2"><span>${L(WARM[x.w][0], WARM[x.w][1])}</span><span><i style="width:${(x.n / Math.max(...wc.map((y) => y.n), 1)) * 100}%"></i></span><span class="mono">${x.n}</span></div>`).join("")}</div></div></div>`;
}

function shopResult(it) {
    if (!it) return "";
    const sim = similar(it);
    const u = unlock(it);
    const c0 = ctxOf(0);
    const head = sim.length
        ? `<div class="banner bad"><div><b>${L("先別買：你已有相似單品", "Hold off: you already own something similar")}</b><br>${L(`同類別且相似度 ≥ 0.85 的單品有 ${sim.length} 件。`, `${sim.length} item(s) in the same category score 0.85 or higher.`)}</div></div>`
        : `<div class="banner good"><div><b>${L("可以考慮", "Worth considering")}</b><br>${L(`衣櫃裡沒有相似單品；加入後未來 7 天可新增 ${u.delta} 套有效穿搭。`, `Nothing similar in your closet. It adds ${u.delta} valid outfits over the next 7 days.`)}</div></div>`;
    const simHtml = sim.length
        ? `<div class="card"><h3>${L("你已擁有", "You already own")}</h3><div class="grid" style="margin-top:10px">${sim.map((x) => `<div class="card item"><div class="tile">${gsvg(x.i)}</div><h3>${esc(nameOf(x.i))}</h3><span class="chip bad mono">${L("相似度", "Similarity")} ${x.s.toFixed(2)}</span></div>`).join("")}</div></div>`
        : "";
    let outs = "";
    if (!sim.length) {
        const days = [];
        for (let d = 0; d < 7; d++) {
            const o = options(d, cur().items.concat([it]), it);
            if (o.opts.length) days.push({ d, x: o.opts[0], c: o.ctx });
        }
        outs = `<div class="card"><h3>${L("含新品的穿搭", "Outfits with this piece")}</h3><p class="muted" style="margin:4px 0 10px">${L("以下為各日最佳搭配，可先試穿再決定。", "Best match for each day it works. Try it on before you decide.")}</p>${days.length
                ? `<div class="opts">${days
                    .slice(0, 3)
                    .map(
                        (o) =>
                            `<div class="card opt"><div class="stage">${tryon(o.x, o.c.e.occ, "body")}</div><b>${N({ z: DAYS[o.d][0], e: DAYS[o.d][1] })} · ${nameOf({ zh: o.c.e.z, en: o.c.e.e })}</b><div class="pieces">${o.x.ids
                                .map(byId)
                                .map(
                                    (i) => `<span>${mini(i)}<em>${esc(nameOf(i))}</em></span>`,
                                )
                                .join(
                                    "",
                                )}</div><button class="btn sm" data-a="view" data-k="${o.x.ids.join(">")}" data-o="${o.c.e.occ}">${L("試穿預覽", "Try on")}</button></div>`,
                    )
                    .join("")}</div>`
                : `<p class="muted">${L("未來 7 天沒有可搭配的行程。", "It does not fit any event this week.")}</p>`
            }</div>`;
    }
    const per = u.per
        .map(
            (n, i) =>
                `<span class="chip ${n > 0 ? "good" : ""} mono">${N({ z: DAYS[i][0], e: DAYS[i][1] })} +${n}</span>`,
        )
        .join("");
    return `<div class="card" style="display:flex;gap:16px;flex-wrap:wrap"><div style="width:140px">${tile(it)}</div><div style="flex:1;min-width:220px;display:flex;flex-direction:column;gap:8px"><h3>${esc(nameOf(it))}</h3><div class="tags">${tagsOf(it)}</div>${it.price ? `<span class="mono">NT$ ${it.price.toLocaleString()} · ${it.brand}</span>` : ""}<div class="row" style="gap:4px"><span class="muted">${L("可解鎖穿搭", "Unlocks")}</span>${per}</div><div><button class="btn sm" data-a="wish" data-id="${it.id}">${L("加入購物清單", "Add to shopping list")}</button></div></div></div>${head}${simHtml}${outs}`;
}
function pShop() {
    const st = cur(),
        pool = catalogFor();
    const sel = S.shopSel ? byId(S.shopSel) : null;
    const nb = bestNext();
    const sample = pool
        .filter((c, i) => [0, 3, 4, 6, 9, 12].includes(i) || true)
        .slice(0, 6);
    return `<div class="persona"><h2>${L("購物檢查", "Purchase check")}</h2><p>${L("選一件想買的單品（截圖或品牌目錄），先看是否已有相似單品。", "Pick something you want to buy (screenshot or brand catalogue) and see if you already own something like it.")}</p></div>
 <div class="two"><div class="card" style="display:flex;flex-direction:column;gap:12px"><div class="row" style="justify-content:space-between"><h3>${L("選擇單品", "Choose an item")}</h3><button class="btn sm" data-a="upShot">${L("上傳截圖", "Upload screenshot")}</button></div>
  <div class="scroll" style="max-height:380px"><div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(120px,1fr))">${pool.map((c) => `<button class="card item" data-a="shopPick" data-id="${c.id}" style="${S.shopSel === c.id ? "border-color:var(--accent)" : ""}"><div class="tile">${gsvg(c)}</div><span style="font-size:12px;line-height:1.3">${esc(nameOf(c))}</span><span class="mono muted" style="font-size:12px">NT$ ${c.price.toLocaleString()}</span></button>`).join("")}</div></div></div>
 <div class="card" style="display:flex;flex-direction:column;gap:10px"><h3>${L("下一件該買什麼？", "What to buy next")}</h3><p class="muted" style="margin:0">${L("依「未來 7 天可解鎖穿搭數」排序，已有相似單品者不列入。", "Ranked by outfits unlocked over the next 7 days. Items you already have a match for are excluded.")}</p>
  ${nb.map((x, i) => `<button class="row card" data-a="shopPick" data-id="${x.c.id}" style="padding:8px;text-align:left;flex-wrap:nowrap"><span class="mini" style="width:44px;height:44px">${gsvg(x.c)}</span><span style="flex:1;min-width:0"><b style="font-size:13px">${esc(nameOf(x.c))}</b><br><span class="muted mono" style="font-size:12px">NT$ ${x.c.price.toLocaleString()}</span></span><span class="chip good mono">+${x.delta}</span></button>`).join("")}
  ${st.list.length
            ? `<h3 style="margin-top:6px">${L("購物清單", "Shopping list")}</h3>${st.list
                .map((id) => {
                    const c = byId(id);
                    return `<span class="row" style="gap:8px">${mini(c)}<span style="flex:1;min-width:0;font-size:13px">${esc(nameOf(c))}</span><button class="btn sm" data-a="unwish" data-id="${id}">${L("移除", "Remove")}</button></span>`;
                })
                .join("")}`
            : ""
        }</div></div>
 ${sel ? `<div style="display:flex;flex-direction:column;gap:14px">${shopResult(sel)}</div>` : `<div class="card muted">${L("選一件單品，結果會顯示在這裡。", "Pick an item to see the result here.")}</div>`}`;
}

function pProfile() {
    const st = cur(),
        p = pp();
    const gaps = [...Array(7)].map((_, d) => ({
        d,
        n: allValid(st.items, ctxOf(d)).length,
    }));
    return `<div class="persona"><h2>${L("風格檔案", "Style profile")}</h2><p>${L("設定一次，之後每週規劃都會套用。", "Set once. Every weekly plan uses it.")}</p></div>
 <div class="two"><div class="card" style="display:flex;flex-direction:column;gap:12px"><h3>${L("圖片風格測驗", "Style quiz")}</h3><div class="quiz">${STYLES.map(
        (s) => {
            const its = [
                mk(`${s.s[0]}|x|x|${s.c[0]}|s|1|3`, "q"),
                mk(`${s.s[1]}|x|x|${s.c[1]}|s|2|3`, "q"),
                mk(`${s.s[2]}|x|x|${s.c[2]}|s|2|3`, "q"),
            ];
            return `<button data-a="style" data-k="${s.k}" aria-pressed="${st.styles.includes(s.k)}"><span class="row" style="gap:0;flex-wrap:nowrap">${its.map((i) => `<span class="mini" style="width:34px;height:34px;background:none">${gsvg(i)}</span>`).join("")}</span><b>${N(s)}</b></button>`;
        },
    ).join(
        "",
    )}</div><span class="muted">${L("選 1–3 種喜歡的風格；選 👍／👎 也會更新偏好。", "Pick 1–3 styles. Your 👍 and 👎 also tune the picks.")}</span></div>
 <div class="card" style="display:flex;flex-direction:column;gap:12px"><h3>${L("城市與體感", "City and comfort")}</h3>
  <div class="field"><label for="city">${L("城市（氣象署各鄉鎮預報）", "City (CWA township forecast)")}</label><select id="city" data-c="city">${Object.keys(
        CITY,
    )
            .map(
                (k) =>
                    `<option value="${k}" ${st.city === k ? "selected" : ""}>${L(CITY[k][0], CITY[k][1])}</option>`,
            )
            .join("")}</select></div>
  <div class="field"><label>${L("怕熱／怕冷（所有溫度區間 ±3°C）", "Heat/cold sensitivity (all bands ±3°C)")}</label><div class="seg" role="group">${[
            ["hot", L("怕熱", "Runs hot")],
            ["none", L("普通", "Neutral")],
            ["cold", L("怕冷", "Runs cold")],
        ]
            .map(
                (x) =>
                    `<button data-a="pref" data-v="${x[0]}" aria-pressed="${st.pref === x[0]}">${x[1]}</button>`,
            )
            .join("")}</div></div>
  <label class="row"><input type="checkbox" id="cal" data-c="cal" ${st.cal ? "checked" : ""}> ${L("連結 Google 行事曆（模擬）", "Link Google Calendar (simulated)")}</label>
  <span class="muted">${st.cal ? L("已帶入 7 日行程；每個行程仍可調整場合與同行對象。", "Seven days of events loaded. You can still change the occasion and who you are with.") : L("未連結：每天改為手動詢問，預設值如下，可在規劃頁修改。", "Not linked: you are asked day by day. Defaults are shown on the plan page.")}</span></div></div>
 <div class="two"><div class="card" style="display:flex;flex-direction:column;gap:10px"><h3>${L("全身照（用於試穿）", "Full-body photo (for try-on)")}</h3>
  <label class="row"><input type="checkbox" id="consent" data-c="consent" ${st.consent ? "checked" : ""}> ${L("我同意使用我的全身照產生試穿圖", "I agree to use my full-body photo for try-on images")}</label>
  <div class="row"><input type="file" id="photo" accept="image/*" data-c="photo" ${st.consent ? "" : "disabled"}><button class="btn sm" data-a="delPhoto" ${st.photo ? "" : "disabled"}>${L("一鍵刪除", "Delete now")}</button></div>
  ${st.photo ? `<img src="${st.photo}" alt="" style="max-height:160px;border-radius:8px;align-self:flex-start">` : `<span class="muted">${L("尚未上傳。展示版使用示意人形；全身照存放在獨立資料夾，可隨時刪除。", "None uploaded. This demo uses a stand-in figure. The photo is stored separately and can be deleted any time.")}</span>`}
  <span class="muted">${L("正式版以 gpt-image-2 或本機 ComfyUI 產生試穿圖；此處為示意預覽，並提供平鋪預覽備案。", "The full product renders try-on with gpt-image-2 or local ComfyUI. This demo shows a stand-in preview, with a flat-lay fallback.")}</span></div>
 <div class="card"><h3>${L("本週有效穿搭數", "Valid outfits this week")}</h3><div class="bars" style="margin-top:10px">${gaps.map((g) => `<div class="bar2"><span>${N({ z: DAYS[g.d][0], e: DAYS[g.d][1] })} ${DATES[g.d]}</span><span><i style="width:${Math.min(100, g.n * 2)}%;background:${g.n < 3 ? "var(--bad)" : "var(--accent)"}"></i></span><span class="mono">${g.n}</span></div>`).join("")}</div></div></div>
 <div class="card"><h3>${L("穿搭引擎規則（第 4-1 節）", "Outfit engine rules (section 4-1)")}</h3><div class="scroll"><table>
 <tr><th>${L("規則", "Rule")}</th><th>${L("定義", "Definition")}</th></tr>
 <tr><td>${L("保暖度", "Warmth")}</td><td>${L("體感 ≥28°C 僅輕薄 · 20–27°C 輕薄或中等 · 14–19°C 中等或保暖 · <14°C 僅保暖", "Feels ≥28°C light only · 20–27°C light or mid · 14–19°C mid or warm · <14°C warm only")}</td></tr>
 <tr><td>${L("降雨", "Rain")}</td><td>${L("降雨機率 ≥60%：不推薦涼鞋或拖鞋", "Rain chance ≥60%: no sandals or slides")}</td></tr>
 <tr><td>${L("正式度", "Formality")}</td><td>${L("1 運動 · 2 休閒 · 3 休閒正式 · 4 商務 · 5 正式；場合：健身 1、休閒日 2、晚餐 3、上班 3、客戶會議 4、婚禮 5", "1 sport · 2 casual · 3 smart casual · 4 business · 5 formal. Gym 1, casual day 2, dinner 3, work 3, client meeting 4, wedding 5")}</td></tr>
 <tr><td>${L("同行對象", "Company")}</td><td>${L("同事 +1 · 約會 +1 · 朋友 0 · 家人 0（最低 2）· 獨自 0 · 上限 5", "Colleague +1 · date +1 · friend 0 · family 0 (min 2) · solo 0 · cap 5")}</td></tr>
 <tr><td>${L("有效穿搭", "Valid outfit")}</td><td>${L("1 上衣 + 1 下身 + 1 鞋；各件正式度與目標相差 ±1 內；最多 1 件圖案；最多 3 色", "1 top + 1 bottom + 1 pair of shoes; each within ±1 of target formality; at most 1 pattern; at most 3 colours")}</td></tr>
 <tr><td>${L("多樣性與重複", "Variety and repeats")}</td><td>${L("3 套至少 2 件不同 · 同一套 14 天內不重複 · 同一件上衣 3 天內不重複", "3 picks differ by at least 2 pieces · same outfit not within 14 days · same top not within 3 days")}</td></tr>
 <tr><td>${L("相似單品", "Similar items")}</td><td>${L("同類別且相似度 ≥ 0.85，顯示前 3 件（此處以模擬向量計算）", "Same category and similarity ≥ 0.85, top 3 shown (simulated vectors here)")}</td></tr></table></div></div>
 <div class="card"><h3>${L("測試資料", "Test data")}</h3><p class="muted" style="margin:6px 0 0">${L("三位人物誌的衣櫃（Mia 20 件、Kai 20 件含 4 件相似 T 恤、Grace 25 件且沒有正式鞋款）、24 件模擬品牌目錄、模擬的 7 日天氣與行事曆。全部為自行產生的展示資料，未連接任何 API，資料只存在這個頁面。", "Three persona wardrobes (Mia 20, Kai 20 with four lookalike tees, Grace 25 with no formal shoes), a 24-item simulated brand catalogue, and simulated 7-day weather and calendars. All generated for this demo. No API is connected and nothing leaves this page.")}</p></div>`;
}

/* ---------- modals ---------- */
function modalHTML() {
    const m = S.modal;
    if (!m) return "";
    let inner = "";
    if (m.t === "people") {
        inner = `<div class="row" style="justify-content:space-between"><h3>${L("更換角色", "Switch role")}</h3><button class="btn" data-a="close">${L("關閉", "Close")}</button></div><div class="people-list">${Object.entries(P).map(([k,p])=>`<button class="card person-choice" data-a="persona" data-k="${k}" aria-pressed="${k===S.persona}"><span class="avatar">${avatarHTML(p)}</span><span><b>${esc(p.n)}</b><br><span class="muted">${esc(L(...p.role))}</span></span>${k===S.persona?`<span class="chip good">${L("使用中","Active")}</span>`:""}</button>`).join("")}</div><button class="btn pri" data-a="newPerson">${L("＋ 新增人物資料","＋ Add person")}</button>`;
    }
    if (m.t === "view") {
        const c = ctxOf(m.d),
            o = { ids: m.ids };
        const its = m.ids.map(byId);
        inner = `<div class="row" style="justify-content:space-between"><h3>${L("試穿預覽", "Try-on preview")}</h3><span class="row"><div class="seg"><button data-a="mode" data-v="body" aria-pressed="${m.mode === "body"}">${L("試穿", "On body")}</button><button data-a="mode" data-v="flat" aria-pressed="${m.mode === "flat"}">${L("平鋪", "Flat lay")}</button></div><button class="btn sm" data-a="close">${L("關閉", "Close")}</button></span></div>
  <div class="row" style="align-items:flex-start;flex-wrap:wrap"><div class="stage" style="max-height:480px;flex:1;min-width:220px">${tryon(o, m.occ || c.e.occ, m.mode)}</div><div style="flex:1;min-width:220px;display:flex;flex-direction:column;gap:10px"><div class="pieces" style="font-size:13px;gap:8px">${its.map((i) => `<span>${mini(i)}<em>${esc(nameOf(i))}</em></span>`).join("")}</div>
  <span class="muted">${L("示意預覽，非 AI 生成的本人照片。", "Stand-in preview, not an AI render of your photo.")}</span><div class="row"><button class="btn sm" data-a="like" data-k="${m.ids.join(">")}" data-v="1">👍</button><button class="btn sm" data-a="like" data-k="${m.ids.join(">")}" data-v="-1">👎</button><button class="btn pri sm" data-a="pick" data-k="${m.ids.join(">")}">${L("選這套", "Choose")}</button></div></div></div>`;
    }
    if (m.t === "edit") {
        const i = byId(m.id);
        inner = `<div class="row" style="justify-content:space-between"><h3>${esc(nameOf(i))}</h3><button class="btn sm" data-a="close">${L("關閉", "Close")}</button></div><div class="row" style="align-items:flex-start;flex-wrap:wrap"><div style="width:160px">${tile(i)}</div><div style="flex:1;min-width:240px;display:flex;flex-direction:column;gap:10px">${tagEditor(i, "e")}<label class="row"><input type="checkbox" data-c="laundry" ${i.laundry ? "checked" : ""}> ${L("送洗中（不納入推薦）", "At laundry (excluded from picks)")}</label><div><button class="btn sm" data-a="del" data-id="${i.id}">${L("移出衣櫃", "Remove")}</button></div></div></div>`;
    }
    if (m.t === "add") {
        inner = `<div class="row" style="justify-content:space-between"><h3>${L("新增單品", "Add item")}</h3><button class="btn sm" data-a="close">${L("關閉", "Close")}</button></div>
  <div class="row"><button class="btn" data-a="manualItem">${L("手動新增","Add manually")}</button><button class="btn" data-a="upPhoto">${L("拍照／上傳照片", "Photo / upload")}</button><span class="muted">${L("或從品牌目錄挑選：", "or pick from the catalogue:")}</span></div>
  ${m.draft
                ? draftHTML(m)
                : `<div class="scroll" style="max-height:340px"><div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(110px,1fr))">${catalogFor()
                    .map(
                        (c) =>
                            `<button class="card item" data-a="addCat" data-id="${c.id}"><div class="tile">${gsvg(c)}</div><span style="font-size:12px;line-height:1.3">${esc(nameOf(c))}</span></button>`,
                    )
                    .join("")}</div></div>`
            }`;
    }
    if (m.t === "shot") {
        inner = `<div class="row" style="justify-content:space-between"><h3>${L("上傳截圖", "Upload screenshot")}</h3><button class="btn sm" data-a="close">${L("關閉", "Close")}</button></div>${draftHTML(m)}`;
    }
    return `<div class="mask" data-a="maskClose"><div class="modal" role="dialog" aria-modal="true">${inner}</div></div>`;
}
function tagEditor(i, mode) {
    const o = (obj, cur, fn) =>
        Object.keys(obj)
            .map(
                (k) =>
                    `<option value="${k}" ${k === cur ? "selected" : ""}>${fn(k)}</option>`,
            )
            .join("");
    return `<div class="two" style="grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px">
 <div class="field"><label>${L("存放位置", "Storage location")}</label><input type="text" list="storagePlaces" data-c="f-location" data-m="${mode}" value="${esc(i.location||"")}" placeholder="${L("選擇或自行輸入","Choose or enter")}"><datalist id="storagePlaces">${[L("衣櫃","Closet"),L("抽屜","Drawer"),L("鞋櫃","Shoe cabinet"),L("收納箱","Storage box"),L("吊衣架","Clothes rack"),L("飾品盒","Jewelry box"),...cur().items.map(x=>x.location).filter(Boolean)].map(v=>`<option value="${esc(v)}"></option>`).join("")}</datalist></div>
 <div class="field"><label>${L("類別", "Type")}</label><select data-c="f-sub" data-m="${mode}">${o(SUBS, i.sub, (k) => L(SUBS[k][1], SUBS[k][2]))}</select></div>
 <div class="field"><label>${L("顏色", "Colour")}</label><select data-c="f-color" data-m="${mode}">${o(COL, i.color, (k) => L(COL[k][1], COL[k][2]))}</select></div>
 <div class="field"><label>${L("圖案", "Pattern")}</label><select data-c="f-pat" data-m="${mode}">${o(PAT, i.pat, (k) => L(PAT[k][0], PAT[k][1]))}</select></div>
 <div class="field"><label>${L("保暖度", "Warmth")}</label><select data-c="f-warm" data-m="${mode}">${[1, 2, 3].map((w) => `<option value="${w}" ${w === i.warm ? "selected" : ""}>${L(WARM[w][0], WARM[w][1])}</option>`).join("")}</select></div>
 <div class="field"><label>${L("正式度", "Formality")}</label><select data-c="f-formal" data-m="${mode}">${[1, 2, 3, 4, 5].map((w) => `<option value="${w}" ${w === i.formal ? "selected" : ""}>${w} · ${L(FORMAL[w][0], FORMAL[w][1])}</option>`).join("")}</select></div></div>`;
}
function draftHTML(m) {
    if (!m.draft)
        return `<div class="muted">${L("選擇圖片檔，系統會自動辨識標籤。", "Choose an image and the tagger fills in the labels.")}<br><input type="file" id="upfile" accept="image/*" data-c="upfile"></div>`;
    const d = m.draft;
    return `${d.blur ? `<div class="banner warn"><div><b>${L("照片可能模糊，建議重拍", "This photo may be blurry. Consider retaking it.")}</b></div></div>` : ""}<div class="row" style="align-items:flex-start;flex-wrap:wrap"><div style="width:150px">${d.img ? `<img src="${d.img}" alt="" style="width:100%;border-radius:8px">` : ""}<div style="margin-top:6px">${tile(d.item)}</div></div><div style="flex:1;min-width:240px;display:flex;flex-direction:column;gap:10px"><span class="chip acc" style="align-self:flex-start">${L("自動標籤信心", "Auto-tag confidence")} ${d.conf}%</span>${tagEditor(d.item, "d")}<span class="muted">${L("標籤不對？直接修正。", "Wrong label? Fix it here.")}</span><div class="row">${m.t === "shot" ? `<button class="btn pri" data-a="checkDraft">${L("檢查是否已有", "Check my closet")}</button>` : `<button class="btn pri" data-a="saveDraft">${L("加入衣櫃", "Add to wardrobe")}</button>`}</div></div></div>`;
}

/* ---------- stylist chat (tool-calling, rule-backed) ---------- */
const CW = {
    橄欖綠: "olive",
    olive: "olive",
    黑色: "black",
    黑: "black",
    black: "black",
    白色: "white",
    白: "white",
    white: "white",
    灰色: "gray",
    灰: "gray",
    gray: "gray",
    grey: "gray",
    海軍藍: "navy",
    navy: "navy",
    米色: "beige",
    beige: "beige",
    紅色: "red",
    red: "red",
    藍色: "blue",
    blue: "blue",
    粉色: "pink",
    pink: "pink",
    棕色: "brown",
    brown: "brown",
    駝色: "camel",
    camel: "camel",
    酒紅: "burgundy",
    burgundy: "burgundy",
    牛仔: "denim",
    denim: "denim",
};
const SW = {
    長褲: ["pants", "trousers", "jeans"],
    褲: ["pants", "trousers", "jeans", "shorts"],
    pants: ["pants", "trousers", "jeans"],
    trousers: ["trousers"],
    jeans: ["jeans"],
    牛仔褲: ["jeans"],
    裙: ["skirt"],
    skirt: ["skirt"],
    襯衫: ["shirt", "blouse"],
    shirt: ["shirt", "blouse"],
    t恤: ["tee"],
    tee: ["tee"],
    毛衣: ["knit"],
    針織: ["knit"],
    sweater: ["knit"],
    knit: ["knit"],
    連帽: ["hoodie"],
    hoodie: ["hoodie"],
    鞋: ["sneaker", "loafer", "heel", "sandal", "boot"],
    shoes: ["sneaker", "loafer", "heel", "sandal", "boot"],
    sneaker: ["sneaker"],
    loafer: ["loafer"],
    樂福: ["loafer"],
    高跟: ["heel"],
    heels: ["heel"],
    靴: ["boot"],
    boots: ["boot"],
    涼鞋: ["sandal"],
};
const DW = [
    ["週一|星期一|monday|mon\\b", 0],
    ["週二|星期二|tuesday|tue\\b", 1],
    ["週三|星期三|wednesday|wed\\b", 2],
    ["週四|星期四|thursday|thu\\b", 3],
    ["週五|星期五|friday|fri\\b", 4],
    ["週六|星期六|saturday|sat\\b", 5],
    ["週日|星期日|星期天|sunday|sun\\b", 6],
];
function findEventIdx(q) {
    for (const [re, i] of DW) if (new RegExp(re, "i").test(q)) return i;
    const m = [
        ["婚禮|wedding", "wedding"],
        ["客戶|client|提案|pitch", "client"],
        ["約會|date", "date"],
        ["晚餐|dinner|聚餐", "dinner"],
        ["健身|gym", "gym"],
    ];
    for (const [re, k] of m)
        if (new RegExp(re, "i").test(q)) {
            const ix = cur().events.findIndex((e) => e.occ === k || e.comp === k);
            if (ix >= 0) return ix;
        }
    return -1;
}
function findItem(q) {
    const cols = Object.keys(CW)
        .filter((k) => q.includes(k))
        .map((k) => CW[k]);
    const subs = Object.keys(SW)
        .filter((k) => q.includes(k))
        .flatMap((k) => SW[k]);
    if (!cols.length && !subs.length) return null;
    const c = cur().items.filter(
        (i) =>
            (!cols.length || cols.includes(i.color)) &&
            (!subs.length || subs.includes(i.sub)),
    );
    return c.length ? c[0] : null;
}
function findCat(q) {
    const cols = Object.keys(CW)
        .filter((k) => q.includes(k))
        .map((k) => CW[k]);
    const subs = Object.keys(SW)
        .filter((k) => q.includes(k))
        .flatMap((k) => SW[k]);
    const c = catalogFor().filter(
        (i) =>
            (!cols.length || cols.includes(i.color)) &&
            (!subs.length || subs.includes(i.sub)),
    );
    return (cols.length || subs.length) && c.length && c.length < 6 ? c[0] : null;
}
function pushBot(o) {
    S.chat.push({ r: "bot", ...o });
}
function itemsLine(ids) {
    return `<div class="its">${ids
        .map((id) => {
            const i = byId(id);
            return `<span class="row" style="gap:6px;flex-wrap:nowrap">${mini(i)}<span style="min-width:0">${esc(nameOf(i))}${i.brand ? ` · NT$ ${i.price.toLocaleString()}` : ""}</span></span>`;
        })
        .join("")}</div>`;
}
function chatAnswer(text) {
    const q = text.toLowerCase();
    const st = cur();
    const dayOf = (d) => N({ z: DAYS[d][0], e: DAYS[d][1] });
    if (/海軍藍.*黑|黑.*海軍藍|navy.*black|black.*navy/.test(q))
        return {
            tool: "color_rules (4-1)",
            html: L(
                "可以。黑、白、灰、海軍藍、米色都是中性色，彼此百搭。建議整套最多 3 色、最多 1 件圖案單品。",
                "Yes. Black, white, gray, navy and beige are all neutrals and go together. Keep a full outfit to 3 colours and at most one patterned piece.",
            ),
        };
    const cm = Object.keys(CW).filter(
        (k) => q.includes(k) && !/長|褲|襯|鞋|t恤/.test(k),
    );
    const colSet = [...new Set(cm.map((k) => CW[k]))];
    if (colSet.length >= 2 && /配|搭|可以|ok|go|match|together/.test(q)) {
        const nn = colSet.filter((c) => !NEUTRAL.has(c));
        return {
            tool: "color_rules (4-1)",
            html:
                nn.length <= 1
                    ? L(
                        "可以。其中至多一個非中性色，其他是中性色，很安全。",
                        "Yes. At most one is a non-neutral and the rest are neutrals, so it is a safe pairing.",
                    )
                    : L(
                        `${nn.map((c) => COL[c][1]).join("與")}都不是中性色，同時穿會很搶眼。建議留一個主色，其餘用中性色（黑、白、灰、海軍藍、米色）。`,
                        `${nn.map((c) => COL[c][2]).join(" and ")} are both non-neutral, so they compete. Keep one as the main colour and use neutrals (black, white, gray, navy, beige) for the rest.`,
                    ),
        };
    }
    if (/缺|不足|gap|missing|lack/.test(q) && !/該買|should/.test(q)) {
        const g = [];
        for (let d = 0; d < 7; d++) {
            const c = ctxOf(d),
                n = allValid(st.items, c).length;
            if (n < 3) g.push({ d, n, c, m: missing(c, st.items) });
        }
        if (!g.length)
            return {
                tool: "find_gaps",
                html: L(
                    "這週每個行程都有至少 3 套有效穿搭，沒有缺口。",
                    "Every event this week has at least 3 valid outfits. No gaps.",
                ),
            };
        return {
            tool: "find_gaps",
            html:
                L(`${g.length} 天有缺口：<br>`, `${g.length} day(s) have gaps:<br>`) +
                g
                    .map(
                        (x) =>
                            `• ${dayOf(x.d)} ${esc(nameOf({ zh: x.c.e.z, en: x.c.e.e }))}：${x.n} ${L("套", "valid")}${x.m.length ? L(`，缺少${x.m.map((m) => CATN[m][0]).join("、")}（正式度 ${Math.max(1, x.c.target - 1)}–${Math.min(5, x.c.target + 1)}）`, `, missing ${x.m.map((m) => CATN[m][1].toLowerCase()).join(", ")} (formality ${Math.max(1, x.c.target - 1)}–${Math.min(5, x.c.target + 1)})`) : ""}`,
                    )
                    .join("<br>"),
            ask: [[L("下一件該買什麼？", "What should I buy next?")]],
        };
    }
    if (/下一件|next|買什麼|what to buy|what should i buy/.test(q)) {
        const nb = bestNext();
        if (!nb.length)
            return {
                tool: "best_next_buy",
                html: L("目錄中沒有適合的單品。", "Nothing in the catalogue fits."),
            };
        const t = nb[0];
        return {
            tool: "best_next_buy",
            html:
                L(
                    `建議買這件。它可在未來 7 天解鎖 ${t.delta} 套穿搭，而且你沒有相似單品。`,
                    `I would buy this one. It unlocks ${t.delta} outfits over the next 7 days and you own nothing similar.`,
                ) +
                itemsLine([t.c.id]) +
                L(
                    `理由：依可解鎖穿搭數排序第一；其次是 ${nb
                        .slice(1, 3)
                        .map((x) => nameOf(x.c) + `（+${x.delta}）`)
                        .join("、")}。`,
                    `Why: it ranks first by unlocked outfits. Next: ${nb
                        .slice(1, 3)
                        .map((x) => nameOf(x.c) + ` (+${x.delta})`)
                        .join(", ")}.`,
                ),
            act: {
                k: "wish",
                id: t.c.id,
                lb: L("加入購物清單", "Add to shopping list"),
            },
        };
    }
    if (/該買|值得買|should i buy|worth buying|buy this|截圖/.test(q)) {
        const cat = findCat(q);
        if (!cat)
            return {
                tool: "check_purchase",
                html: L(
                    "你想檢查哪一件？請選一件：",
                    "Which item do you want me to check? Pick one:",
                ),
                ask: bestNext()
                    .slice(0, 3)
                    .map((x) => [
                        L("這件該買嗎？", "Should I buy ") + nameOf(x.c),
                        x.c.id,
                    ]),
            };
        const sim = similar(cat),
            u = unlock(cat);
        return {
            tool: "check_purchase",
            html: sim.length
                ? L(
                    `先別買。你已有相似單品：`,
                    `Hold off. You already own something similar:`,
                ) +
                itemsLine(sim.map((x) => x.i.id)) +
                L(
                    `相似度 ${sim.map((x) => x.s.toFixed(2)).join("、")}，已超過 0.85 的門檻。`,
                    `Similarity ${sim.map((x) => x.s.toFixed(2)).join(", ")}, above the 0.85 threshold.`,
                )
                : L(
                    `可以考慮。你沒有相似單品，加入後未來 7 天新增 ${u.delta} 套有效穿搭。`,
                    `Worth considering. Nothing similar in your closet, and it adds ${u.delta} valid outfits over 7 days.`,
                ) + itemsLine([cat.id]),
            act: sim.length
                ? null
                : {
                    k: "wish",
                    id: cat.id,
                    lb: L("加入購物清單", "Add to shopping list"),
                },
        };
    }
    const it = findItem(q);
    const ev = findEventIdx(q);
    if (
        !it &&
        /搭|wear|pair|match/.test(q) &&
        (Object.keys(CW).some((k) => q.includes(k)) ||
            Object.keys(SW).some((k) => q.includes(k))) &&
        ev < 0 &&
        !/穿什麼/.test(q)
    )
        return {
            tool: "get_item",
            html: L(
                "你的衣櫃裡找不到這件單品，所以我無法為它配衣服。可以到「數位衣櫃」新增，或問我其他單品。",
                "I cannot find that piece in your wardrobe, so I cannot style it. Add it in the Wardrobe tab, or ask about another piece.",
            ),
        };
    if (it && /搭|穿|wear|pair|match|with/.test(q)) {
        let dd = ev >= 0 ? [ev] : [0, 1, 2, 3, 4, 5, 6];
        for (const d of dd) {
            const r = options(d, null, it);
            if (r.opts.length) {
                const x = r.opts[0];
                return {
                    tool: "get_item → suggest_outfits",
                    html:
                        L(
                            `${dayOf(d)}（${nameOf({ zh: st.events[d].z, en: st.events[d].e })}）可以這樣搭：`,
                            `For ${dayOf(d)} (${nameOf({ zh: st.events[d].z, en: st.events[d].e })}), try:`,
                        ) +
                        itemsLine(x.ids) +
                        x.reasons
                            .slice(0, 2)
                            .map((r) => "• " + esc(r))
                            .join("<br>"),
                    act: {
                        k: "plan",
                        d,
                        ids: x.ids,
                        lb: L(`加入${dayOf(d)}計畫`, `Add to ${dayOf(d)} plan`),
                    },
                };
            }
        }
        return {
            tool: "get_item → suggest_outfits",
            html: L(
                `「${nameOf(it)}」目前找不到符合天氣與場合規則的搭配。`,
                `I cannot find a rule-valid outfit with "${nameOf(it)}" this week.`,
            ),
        };
    }
    if (ev >= 0 || /穿什麼|穿搭|wear|outfit/.test(q)) {
        if (ev < 0)
            return {
                tool: "—",
                html: L("你想看哪一天的行程？", "Which day or event do you mean?"),
                ask: st.events
                    .map((e, i) => [
                        `${dayOf(i)} ${nameOf({ zh: e.z, en: e.e })}`,
                        "ev" + i,
                    ])
                    .slice(0, 5),
            };
        const r = options(ev);
        const c = r.ctx;
        if (!r.opts.length)
            return {
                tool: "suggest_outfits",
                html: L(
                    `${dayOf(ev)}目前沒有符合規則的穿搭（正式度目標 ${c.target}）。${missing(c, st.items).length
                        ? `缺少：${missing(c, st.items)
                            .map((m) => CATN[m][0])
                            .join("、")}。`
                        : ""
                    }`,
                    `No rule-valid outfit for ${dayOf(ev)} (target formality ${c.target}). ${missing(c, st.items).length
                        ? `Missing: ${missing(c, st.items)
                            .map((m) => CATN[m][1].toLowerCase())
                            .join(", ")}.`
                        : ""
                    }`,
                ),
                ask: [[L("下一件該買什麼？", "What should I buy next?")]],
            };
        const x = r.opts[0];
        return {
            tool: "suggest_outfits",
            html:
                (r.total < 3
                    ? L(
                        `${dayOf(ev)}只有 ${r.total} 套有效穿搭，不足 3 套。最佳選擇：`,
                        `Only ${r.total} valid outfit(s) for ${dayOf(ev)}, fewer than 3. Best pick:`,
                    )
                    : L(
                        `${dayOf(ev)}${nameOf({ zh: st.events[ev].z, en: st.events[ev].e })}，建議這套：`,
                        `For ${dayOf(ev)} ${nameOf({ zh: st.events[ev].z, en: st.events[ev].e })}, I suggest:`,
                    )) +
                itemsLine(x.ids) +
                x.reasons
                    .slice(0, 2)
                    .map((r) => "• " + esc(r))
                    .join("<br>"),
            act: {
                k: "plan",
                d: ev,
                ids: x.ids,
                lb: L(`加入${dayOf(ev)}計畫`, `Add to ${dayOf(ev)} plan`),
            },
        };
    }
    return {
        tool: "—",
        html: L(
            "這個問題超出我能查的範圍，或衣櫃裡沒有相關資料，所以我不亂猜。你可以問我：某天穿什麼、某件衣服怎麼搭、這週還缺什麼、下一件該買什麼、這件該買嗎、配色可不可以。",
            "That is outside what I can look up, or your closet has no data for it, so I will not guess. Try: what to wear on a day, how to style an item, what this week is missing, what to buy next, should I buy this, or whether two colours work.",
        ),
        ask: [
            [L("這週還缺什麼？", "What is this week missing?")],
            [L("下一件該買什麼？", "What should I buy next?")],
        ],
    };
}
function chatSend(text) {
    if (!text.trim()) return;
    S.chat.push({ r: "me", t: text });
    const m = text.match(/^ev(\d)$/);
    if (m) {
        const i = +m[1];
        text = N({ z: DAYS[i][0], e: DAYS[i][1] }) + " " + L("穿什麼", "outfit");
    }
    const idm = S.chat.length && null;
    const cm = CATALOG.find((c) => c.id === text);
    if (cm) {
        S.chat[S.chat.length - 1].t =
            L("這件該買嗎？", "Should I buy this? ") + nameOf(cm);
        const sim = similar(cm),
            u = unlock(cm);
        pushBot({
            tool: "check_purchase",
            html: sim.length
                ? L(
                    "先別買。你已有相似單品：",
                    "Hold off. You already own something similar:",
                ) +
                itemsLine(sim.map((x) => x.i.id)) +
                L(
                    `相似度 ${sim.map((x) => x.s.toFixed(2)).join("、")}。`,
                    `Similarity ${sim.map((x) => x.s.toFixed(2)).join(", ")}.`,
                )
                : L(
                    `可以考慮。你沒有相似單品，未來 7 天新增 ${u.delta} 套有效穿搭。`,
                    `Worth considering. Nothing similar, and it adds ${u.delta} valid outfits over 7 days.`,
                ) + itemsLine([cm.id]),
            act: sim.length
                ? null
                : {
                    k: "wish",
                    id: cm.id,
                    lb: L("加入購物清單", "Add to shopping list"),
                },
        });
        return;
    }
    pushBot(chatAnswer(text));
}
function chatHTML() {
    if (!S.chatOpen)
        return `<button class="fab" data-a="chat">${L("造型師聊天", "Ask the stylist")}</button>`;
    const sug = [
        L("週六婚禮要穿什麼？", "What do I wear to the wedding?"),
        L("這週的行程還缺什麼？", "What is this week missing?"),
        L("下一件該買什麼？", "What should I buy next?"),
        L("海軍藍配黑色可以嗎？", "Do navy and black work together?"),
    ];
    return `<section class="chat" aria-label="${L("造型師聊天", "Stylist chat")}"><header><div><b>${L("造型師", "Stylist")}</b><br><span class="muted" style="font-size:12px">${L("只根據你的衣櫃與規則回答", "Answers only from your closet and the rules")}</span></div><button class="btn sm" data-a="chat">${L("收起", "Close")}</button></header>
 <div class="log" id="log">${S.chat.length ? "" : `<div class="msg">${L(`嗨 ${esc(pp().n)}，問我今天或這週要穿什麼、哪件衣服怎麼搭、這件該不該買。`, `Hi ${esc(pp().n)}. Ask what to wear, how to style a piece, or whether to buy something.`)}</div>`}${S.chat.map((m, i) => (m.r === "me" ? `<div class="msg me">${esc(m.t)}</div>` : `<div class="msg">${m.tool && m.tool !== "—" ? `<div class="tool">▸ ${m.tool}</div>` : ""}<div>${m.html}</div>${m.act ? `<button class="btn sm" style="margin-top:6px" data-a="chatAct" data-i="${i}">${m.act.lb}</button>` : ""}${m.ask ? `<div class="row" style="gap:6px;margin-top:8px">${m.ask.map((a) => `<button class="btn sm" data-a="say" data-t="${esc(a[1] || a[0])}">${esc(a[0])}</button>`).join("")}</div>` : ""}</div>`)).join("")}</div>
 ${S.chat.length ? "" : `<div class="ask">${sug.map((s) => `<button class="btn sm" data-a="say" data-t="${esc(s)}">${esc(s)}</button>`).join("")}</div>`}
 <form id="chatForm"><input type="text" id="chatIn" placeholder="${L("輸入問題…", "Type a question…")}" autocomplete="off"><button class="btn pri" type="submit">${L("送出", "Send")}</button></form></section>`;
}

function avatarHTML(p){return p.avatar ? `<img src="${esc(p.avatar)}" alt="" class="avatar-photo">` : esc(p.n.slice(0,1));}
function pPeople(){
 return `<section class="card people-form"><h2>${L("新增人物資料","Add person")}</h2><p class="muted">${L("每位人物擁有獨立衣櫃、穿搭計畫與風格偏好。","Each person has a separate closet, plan and preferences.")}</p><form id="personForm" class="people-fields">
 <label class="field avatar-upload">${L("個人頭像","Profile photo")}<span class="avatar avatar-large" id="avatarPreview">＋</span><input name="avatar" id="newAvatar" type="file" accept="image/*"></label>
 <label class="field">${L("姓名","Name")}<input name="name" type="text" maxlength="40" required></label>
 <label class="field">${L("年齡","Age")}<input name="age" type="number" min="1" max="120" required></label>
 <label class="field">${L("試穿人物類型","Try-on avatar")}<select name="gender"><option value="f">${L("女性","Female")}</option><option value="m">${L("男性","Male")}</option></select></label>
 <label class="field">${L("職業／身分","Occupation")}<input name="role" type="text" maxlength="60" required></label>
 <label class="field">${L("城市","City")}<select name="city">${Object.entries(CITY).map(([k,v])=>`<option value="${k}">${L(v[0],v[1])}</option>`).join("")}</select></label>
 <label class="field">${L("體感偏好","Comfort")}<select name="pref"><option value="none">${L("一般","Neutral")}</option><option value="cold">${L("怕冷","Feels cold")}</option><option value="hot">${L("怕熱","Feels hot")}</option></select></label>
 <label class="field">${L("初始風格","Style")}<select name="style">${STYLES.map(v=>`<option value="${v.k}">${N(v)}</option>`).join("")}</select></label>
 <label class="field">${L("初始衣櫃","Initial closet")}<select name="starter"><option value="empty">${L("空衣櫃","Empty closet")}</option><option value="demo">${L("範例衣物","Sample clothes")}</option></select></label>
 <div class="row"><button class="btn pri" type="submit">${L("建立並切換角色","Create and switch")}</button><button class="btn" type="button" data-a="switchPerson">${L("查看現有角色","Existing roles")}</button></div></form></section>`;
}
async function createPerson(form){
 const f=new FormData(form), n=String(f.get("name")).trim(), role=String(f.get("role")).trim();
 if(!n||!role){toast(L("請輸入姓名與身分","Enter name and occupation"));return;}
 const file=f.get("avatar"); let avatar=null;
 if(file && file.size){if(!file.type.startsWith("image/") || file.size>5000000){toast(L("請選擇 5MB 以下圖片","Choose an image under 5MB"));return;} avatar=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file);});}
 const k="person"+(++UID), g=f.get("gender"), sample=P[g==="m"?"kai":"mia"];
 P[k]={n,avatar,age:Number(f.get("age")),g,role:[role,role],tags:[],tagsE:[],line:["打造自己的穿搭計畫","Build your own outfit plan"],pain:["",""],feat:["個人風格","Personal style"],pref:f.get("pref"),city:f.get("city"),styles:[f.get("style")],ev:Array.from({length:7},()=>["日常行程","Daily plan","casual","solo"]),w:sample.w,laundry:[]};
 initPersona(k); ST[k].worn=[]; ST[k].items.forEach(i=>i.worn=0); if(f.get("starter")==="empty") ST[k].items=[];
 S.persona=k; S.tab="wardrobe"; S.day=0; S.chat=[]; S.shopSel=null; S.modal=null; S.search=""; S.filter="all"; S.fMax=0; S.location=""; toast(L("人物已建立","Person created")); render();
}

/* ---------- render + events ---------- */
function render() {
    const p = pp();
    $("#personaSeg").innerHTML = `<span class="active-person"><span class="avatar">${avatarHTML(p)}</span><strong>${esc(p.n)}</strong></span><button class="btn sm" data-a="switchPerson">${L("更換角色", "Switch role")}</button>`;
    $("#langSeg").innerHTML =
        `<button data-a="lang" data-v="zh" aria-pressed="${S.lang === "zh"}">繁中</button><button data-a="lang" data-v="en" aria-pressed="${S.lang === "en"}">EN</button>`;
    $("#tabs").innerHTML = [
        ["plan", L("本週規劃", "Week plan")],
        ["wardrobe", L("數位衣櫃", "Wardrobe")],
        ["shop", L("購物檢查", "Purchase check")],
        ["profile", L("風格檔案", "Style profile")],
        ["people", L("新增人物資料", "Add person")],
    ]
        .map(
            (t) =>
                `<button role="tab" data-a="tab" data-t="${t[0]}" aria-selected="${S.tab === t[0]}">${t[1]}</button>`,
        )
        .join("");
    const head = `<div class="card persona" style="align-items:center"><div><h2>${esc(p.n)}, ${p.age}</h2><span class="muted">${esc(L(p.role[0], p.role[1]))}</span></div><div class="tags">${(S.lang === "zh" ? p.tags : p.tagsE).map((t) => `<span class="chip">#${t}</span>`).join("")}</div><p style="flex:1;min-width:200px"><b style="color:var(--ink)">${L(p.line[0], p.line[1])}</b><br>${L(p.pain[0], p.pain[1])}</p><span class="chip acc">${L(p.feat[0], p.feat[1])}</span></div>`;
    const page = {
        plan: pPlan,
        wardrobe: pWardrobe,
        shop: pShop,
        profile: pProfile,
        people: pPeople,
    }[S.tab]();
    const y = window.scrollY;
    $("#app").innerHTML = head + page;
    $("#overlay").innerHTML = modalHTML();
    const keep = $("#chatIn")?.value;
    $("#chatMount").innerHTML = chatHTML();
    if (keep && $("#chatIn")) $("#chatIn").value = keep;
    const lg = $("#log");
    if (lg) lg.scrollTop = lg.scrollHeight;
    document.documentElement.lang = S.lang === "zh" ? "zh-Hant" : "en";
    window.scrollTo(0, y);
}
function setSel(ids, d) {
    const st = cur();
    const k = keyOf(ids);
    if (st.sel[d] && keyOf(st.sel[d].ids) === k) {
        delete st.sel[d];
        ids.forEach((id) => {
            const i = byId(id);
            if (i.worn > 0) i.worn--;
        });
        return false;
    }
    if (st.sel[d])
        st.sel[d].ids.forEach((id) => {
            const i = byId(id);
            if (i.worn > 0) i.worn--;
        });
    st.sel[d] = { ids, ok: false };
    ids.forEach((id) => byId(id).worn++);
    return true;
}
function idsFrom(k) {
    return k.split(">");
}
function onAct(el) {
    const a = el.dataset.a,
        st = cur();
    if (a === "switchPerson") {
        S.modal = {t:"people"};
    } else if (a === "persona") {
        S.persona = el.dataset.k;
        S.day = 0;
        S.chat = [];
        S.shopSel = null;
        S.search = ""; S.filter = "all"; S.fMax = 0; S.location="";
        S.modal = null;
    } else if (a === "newPerson") { S.modal=null; S.tab="people"; } else if (a === "lang") S.lang = el.dataset.v;
    else if (a === "tab") {
        S.tab = el.dataset.t;
        window.scrollTo(0, 0);
    } else if (a === "day") S.day = +el.dataset.i;
    else if (a === "pick") {
        const on = setSel(idsFrom(el.dataset.k), S.day);
        toast(
            on
                ? L(
                    "已選定並記錄為已穿（待確認）",
                    "Chosen and logged as worn (to confirm)",
                )
                : L("已取消", "Unselected"),
        );
        if (S.modal) S.modal = null;
    } else if (a === "view") {
        S.modal = {
            t: "view",
            ids: idsFrom(el.dataset.k),
            mode: "body",
            d: S.day,
            occ: el.dataset.o,
        };
    } else if (a === "mode") S.modal.mode = el.dataset.v;
    else if (a === "like") {
        const k = el.dataset.k,
            v = +el.dataset.v;
        st.likes[k] = st.likes[k] === v ? 0 : v;
        toast(
            v > 0
                ? L("已記下你喜歡這套", "Noted: you like this one")
                : L("已記下，之後少推薦", "Noted: fewer like this"),
        );
    } else if (a === "auto") {
        st.sel = {};
        for (let d = 0; d < 7; d++) {
            const r = options(d);
            if (r.opts.length) setSel(r.opts[0].ids, d);
        }
        toast(L("已排滿可排的日子", "Planned every day that has options"));
    } else if (a === "clear") {
        Object.keys(st.sel).forEach((k) =>
            st.sel[k].ids.forEach((id) => {
                const i = byId(id);
                if (i.worn > 0) i.worn--;
            }),
        );
        st.sel = {};
    } else if (a === "confirm") {
        const o = +el.dataset.i;
        if (st.sel[o]) st.sel[o].ok = true;
        else {
            const w = st.worn.find((x) => x.off === o);
            if (w) w.ok = true;
        }
    } else if (a === "close" || (a === "maskClose" && event.target === el))
        S.modal = null;
    else if (a === "maskClose") return;
    else if (a === "filter") S.filter = el.dataset.v;
    else if (a === "edit") S.modal = { t: "edit", id: el.dataset.id };
    else if (a === "addItem") S.modal = { t: "add" };
    else if (a === "manualItem") { S.modal.draft={item:mk("tee|白色T恤|White tee|white|s|1|2","draft"),conf:0,blur:false}; } else if (a === "upPhoto") {
        const f = $("#upfile");
        if (f) {
            f.click();
            return;
        }
        S.modal.draft = null;
    } else if (a === "upShot") S.modal = { t: "shot" };
    else if (a === "addCat") {
        const c = CATALOG.find((x) => x.id === el.dataset.id);
        const n = {
            ...c,
            id: S.persona[0] + ++UID,
            src: "catalog",
            worn: 0,
            laundry: false,
        };
        st.items.push(n);
        S.modal = {t:"edit",id:n.id};
        toast(L("已加入衣櫃", "Added to wardrobe"));
    } else if (a === "saveDraft") {
        const d = S.modal.draft;
        const n = {
            ...d.item,
            id: S.persona[0] + ++UID,
            src: "photo",
            worn: 0,
            laundry: false,
        };
        n.vec = vec(n);
        st.items.push(n);
        S.modal = null;
        toast(L("已加入衣櫃", "Added to wardrobe"));
    } else if (a === "checkDraft") {
        const d = S.modal.draft;
        const n = { ...d.item, id: "u" + ++UID, brand: "", price: 0, gender: "u" };
        n.vec = vec(n);
        CATALOG.push(n);
        n.src = "shot";
        S.shopSel = n.id;
        S.modal = null;
        S.tab = "shop";
    } else if (a === "del") {
        st.items = st.items.filter((i) => i.id !== el.dataset.id);
        S.modal = null;
    } else if (a === "shopPick") S.shopSel = el.dataset.id;
    else if (a === "wish") {
        if (!st.list.includes(el.dataset.id)) st.list.push(el.dataset.id);
        toast(L("已加入購物清單", "Added to shopping list"));
    } else if (a === "unwish")
        st.list = st.list.filter((x) => x !== el.dataset.id);
    else if (a === "style") {
        const k = el.dataset.k,
            ix = st.styles.indexOf(k);
        if (ix >= 0) {
            if (st.styles.length > 1) st.styles.splice(ix, 1);
        } else {
            st.styles.push(k);
            if (st.styles.length > 3) st.styles.shift();
        }
    } else if (a === "pref") st.pref = el.dataset.v;
    else if (a === "delPhoto") {
        st.photo = null;
        toast(L("全身照已刪除", "Photo deleted"));
    } else if (a === "chat") S.chatOpen = !S.chatOpen;
    else if (a === "say") {
        chatSend(el.dataset.t);
    } else if (a === "chatAct") {
        const m = S.chat[+el.dataset.i].act;
        if (m.k === "wish") {
            if (!st.list.includes(m.id)) st.list.push(m.id);
            toast(L("已加入購物清單", "Added to shopping list"));
        } else {
            setSel(m.ids, m.d);
            S.day = m.d;
            toast(L("已加入計畫", "Added to plan"));
        }
    }
    render();
}
document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-a]");
    if (!el) return;
    if (el.dataset.a === "maskClose" && e.target !== el) return;
    window.event = e;
    onAct(el);
});
function readDraft(file) {
    const fr = new FileReader();
    fr.onload = () => {
        const h = [...file.name].reduce((a, c) => a + c.charCodeAt(0), file.size);
        const subs = Object.keys(SUBS),
            cols = Object.keys(COL);
        const sub = subs[h % subs.length],
            col = cols[(h >> 3) % cols.length];
        const it = {
            id: "d",
            sub,
            cat: SUBS[sub][0],
            zh: L(`${COL[col][1]}${SUBS[sub][1]}`, ""),
            en: `${COL[col][2]} ${SUBS[sub][2]}`,
            color: col,
            pat: "s",
            warm: 2,
            formal: SUBS[sub][0] === "shoe" ? 3 : 3,
        };
        it.zh = `${COL[col][1]}${SUBS[sub][1]}`;
        it.vec = vec(it);
        S.modal.draft = {
            img: fr.result,
            item: it,
            conf: 78 + (h % 19),
            blur: file.size < 8000,
        };
        render();
    };
    fr.readAsDataURL(file);
}
document.addEventListener("change", (e) => {
    const t = e.target,
        c = t.dataset.c;
    if(t.id === "newAvatar") {const f=t.files[0]; if(f && f.type.startsWith("image/") && f.size<=5000000){const r=new FileReader();r.onload=()=>{const el=$("#avatarPreview");if(el)el.innerHTML=`<img class="avatar-photo" src="${esc(r.result)}" alt="">`;};r.readAsDataURL(f);} return;}
    if (!c) return;
    const st = cur();
    if (c === "occ") {
        st.events[S.day].occ = t.value;
    } else if (c === "comp") {
        st.events[S.day].comp = t.value;
    } else if (c === "locationFilter") S.location = t.value;
    else if (c === "fmax") S.fMax = +t.value;
    else if (c === "city") st.city = t.value;
    else if (c === "cal") st.cal = t.checked;
    else if (c === "consent") st.consent = t.checked;
    else if (c === "photo") {
        const f = t.files[0];
        if (!f) return;
        const fr = new FileReader();
        fr.onload = () => {
            st.photo = fr.result;
            render();
        };
        fr.readAsDataURL(f);
        return;
    } else if (c === "upfile") {
        const f = t.files[0];
        if (f) readDraft(f);
        return;
    } else if (c === "laundry") {
        byId(S.modal.id).laundry = t.checked;
    } else if (c.startsWith("f-")) {
        const m = t.dataset.m === "d" ? S.modal.draft.item : byId(S.modal.id);
        const k = c.slice(2);
        m[k] = ["warm", "formal"].includes(k) ? +t.value : t.value;
        if (k === "sub") m.cat = SUBS[t.value][0];
        m.vec = vec(m);
        if (t.dataset.m === "d") {
            m.zh = `${COL[m.color][1]}${SUBS[m.sub][1]}`;
            m.en = `${COL[m.color][2]} ${SUBS[m.sub][2]}`;
        }
    }
    render();
});
document.addEventListener("input", (e) => {
    if (e.target.dataset.c === "q") {
        S.search = e.target.value;
        const p = e.target.selectionStart;
        render();
        const q = $("#q");
        q.focus();
        q.setSelectionRange(p, p);
    }
});
document.addEventListener("submit", (e) => {
    if (e.target.id === "personForm") { e.preventDefault(); createPerson(e.target).catch(()=>toast(L("頭像讀取失敗","Could not read photo"))); return; }
    if (e.target.id === "chatForm") {
        e.preventDefault();
        const v = $("#chatIn").value;
        $("#chatIn").value = "";
        chatSend(v);
        render();
        $("#chatIn")?.focus();
    }
});
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && S.modal) {
        S.modal = null;
        render();
    }
});
render();
if (typeof module !== "undefined")
    module.exports = {
        P,
        ST,
        CATALOG,
        options,
        allValid,
        ctxOf,
        similar,
        bestNext,
        unlock,
        cur,
        S,
        missing,
        chatAnswer,
    };
