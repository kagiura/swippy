import { mrtLowFi } from "./mrtLines";

interface MrtStation {
	name: {
		en: string;
		cn: string;
		tm: string;
		ms?: string;
	};
	code: string[];
	line: string[];
	connections?: string;
}

const mrtStations: MrtStation[] = [
	{
		name: {
			en: "Admiralty",
			cn: "海军部",
			tm: "அட்மிரல்ட்டி",
		},
		code: ["NS10"],
		line: ["NSL"],
	},
	{
		name: {
			en: "Aljunied",
			cn: "阿裕尼",
			tm: "அல்ஜூனிட்",
		},
		code: ["EW9"],
		line: ["EWL"],
	},
	{
		name: {
			en: "Ang Mo Kio",
			cn: "宏茂桥",
			tm: "அங் மோ கியோ",
		},
		code: ["NS16"],
		line: ["NSL"],
		connections: "Ang Mo Kio Bus Interchange",
	},
	{
		name: {
			en: "Bartley",
			cn: "巴特礼",
			tm: "பார்ட்லி",
		},
		code: ["CC12"],
		line: ["CCL"],
	},
	{
		name: {
			en: "Bayfront",
			cn: "海湾舫",
			tm: "பேஃபிரண்ட்",
		},
		code: ["CC34", "DT16"],
		line: ["CCL", "DTL"],
	},
	{
		name: {
			en: "Bayshore",
			cn: "碧湾",
			tm: "பேஷோர்",
		},
		code: ["TE29"],
		line: ["TEL"],
	},
	{
		name: {
			en: "Beauty World",
			cn: "美世界",
			tm: "பியூட்டி வோர்ல்ட்",
		},
		code: ["DT5"],
		line: ["DTL"],
	},
	{
		name: {
			en: "Bedok",
			cn: "勿洛",
			tm: "பிடோக்",
		},
		code: ["EW5"],
		line: ["EWL"],
		connections: "Bedok Bus Interchange",
	},
	{
		name: {
			en: "Bedok North",
			cn: "勿洛北",
			tm: "பிடோக் நார்த்",
		},
		code: ["DT29"],
		line: ["DTL"],
	},
	{
		name: {
			en: "Bedok Reservoir",
			cn: "勿洛蓄水池",
			tm: "பிடோக் ரெசவோர்",
		},
		code: ["DT30"],
		line: ["DTL"],
	},
	{
		name: {
			en: "Bencoolen",
			cn: "明古连",
			tm: "பென்கூலன்",
		},
		code: ["DT21"],
		line: ["DTL"],
	},
	{
		name: {
			en: "Bendemeer",
			cn: "明地迷亚",
			tm: "பெண்டிமியர்",
		},
		code: ["DT23"],
		line: ["DTL"],
	},
	{
		name: {
			en: "Bishan",
			cn: "碧山",
			tm: "பீஷான்",
		},
		code: ["NS17", "CC15"],
		line: ["NSL", "CCL"],
		connections: "Bishan Bus Interchange",
	},
	{
		name: {
			en: "Boon Keng",
			cn: "文庆",
			tm: "பூன் கெங்",
		},
		code: ["NE9"],
		line: ["NEL"],
	},
	{
		name: {
			en: "Boon Lay",
			cn: "文礼",
			tm: "பூன் லே",
		},
		code: ["EW27"],
		line: ["EWL"],
		connections: "Boon Lay Bus Interchange",
	},
	{
		name: {
			en: "Botanic Gardens",
			cn: "植物园",
			tm: "பூ மலை",
			ms: "Kebun Bunga",
		},
		code: ["CC19", "DT9"],
		line: ["CCL", "DTL"],
	},
	{
		name: {
			en: "Braddell",
			cn: "布莱德",
			tm: "பிரேடல்",
		},
		code: ["NS18"],
		line: ["NSL"],
	},
	{
		name: {
			en: "Bras Basah",
			cn: "百胜",
			tm: "பிராஸ் பாசா",
		},
		code: ["CC2"],
		line: ["CCL"],
	},
	{
		name: {
			en: "Bright Hill",
			cn: "光明山",
			tm: "பிரைட் ஹில்",
		},
		code: ["TE7"],
		line: ["TEL"],
	},
	{
		name: {
			en: "Buangkok",
			cn: "万国",
			tm: "புவாங்கோக்",
		},
		code: ["NE15"],
		line: ["NEL"],
		connections: "Buangkok Bus Interchange",
	},
	{
		name: {
			en: "Bugis",
			cn: "武吉士",
			tm: "பூகிஸ்",
		},
		code: ["EW12", "DT14"],
		line: ["EWL", "DTL"],
	},
	{
		name: {
			en: "Bukit Batok",
			cn: "武吉巴督",
			tm: "புக்கிட் பாத்தோக்",
		},
		code: ["NS2"],
		line: ["NSL"],
		connections: "Bukit Batok Bus Interchange",
	},
	{
		name: {
			en: "Bukit Gombak",
			cn: "武吉甘柏",
			tm: "புக்கிட் கோம்பாக்",
		},
		code: ["NS3"],
		line: ["NSL"],
	},
	{
		name: {
			en: "Bukit Panjang",
			cn: "武吉班让",
			tm: "புக்கிட் பாஞ்சாங்",
		},
		code: ["BP6", "DT1"],
		line: ["DTL"],
		connections: "Bukit Panjang Bus Interchange",
	},
	{
		name: {
			en: "Buona Vista",
			cn: "波那维斯达",
			tm: "புவன விஸ்தா",
		},
		code: ["EW21", "CC22"],
		line: ["EWL", "CCL"],
	},
	{
		name: {
			en: "Caldecott",
			cn: "加利谷",
			tm: "கால்டிகாட்",
		},
		code: ["CC17", "TE9"],
		line: ["CCL", "TEL"],
	},
	{
		name: {
			en: "Canberra",
			cn: "坎贝拉",
			tm: "கென்பரா",
		},
		code: ["NS12"],
		line: ["NSL"],
	},
	{
		name: {
			en: "Cantonment",
			cn: "广东民",
			tm: "கெண்டொன்மன்",
		},
		code: ["CC31"],
		line: ["CCL"],
	},
	{
		name: {
			en: "Cashew",
			cn: "凯秀",
			tm: "கேஷ்யூ",
		},
		code: ["DT2"],
		line: ["DTL"],
	},
	{
		name: {
			en: "Changi Airport",
			cn: "樟宜机场",
			tm: "சாங்கி விமானநிலையம்",
		},
		code: ["CG2"],
		line: ["CGL"],
	},
	{
		name: {
			en: "Chinatown",
			cn: "牛车水",
			tm: "சைனாடவுன்",
		},
		code: ["NE4", "DT19"],
		line: ["NEL", "DTL"],
	},
	{
		name: {
			en: "Chinese Garden",
			cn: "裕华园",
			tm: "சீனத் தோட்டம்",
		},
		code: ["EW25"],
		line: ["EWL"],
	},
	{
		name: {
			en: "Choa Chu Kang",
			cn: "蔡厝港",
			tm: "சுவா சூ காங்",
		},
		code: ["NS4", "BP1"],
		line: ["NSL"],
		connections: "Choa Chu Kang Bus Interchange",
	},
	{
		name: {
			en: "City Hall",
			cn: "政府大厦",
			tm: "நகர மண்டபம்",
		},
		code: ["NS25", "EW13"],
		line: ["NSL", "EWL"],
	},
	{
		name: {
			en: "Clarke Quay",
			cn: "克拉码头",
			tm: "கிளார்க் கீ",
		},
		code: ["NE5"],
		line: ["NEL"],
	},
	{
		name: {
			en: "Clementi",
			cn: "金文泰",
			tm: "கிளிமெண்டி",
		},
		code: ["EW23"],
		line: ["EWL"],
		connections: "Clementi Bus Interchange",
	},
	{
		name: {
			en: "Commonwealth",
			cn: "联邦",
			tm: "காமன்வெல்த்",
		},
		code: ["EW20"],
		line: ["EWL"],
	},
	{
		name: {
			en: "Dakota",
			cn: "达科达",
			tm: "டகோட்டா",
		},
		code: ["CC8"],
		line: ["CCL"],
	},
	{
		name: {
			en: "Dhoby Ghaut",
			cn: "多美歌",
			tm: "தோபி காட்",
		},
		code: ["NS24", "NE6", "CC1"],
		line: ["NSL", "NEL", "CCL"],
	},
	{
		name: {
			en: "Dover",
			cn: "杜弗",
			tm: "டோவெர்",
		},
		code: ["EW22"],
		line: ["EWL"],
	},
	{
		name: {
			en: "Downtown",
			cn: "市中心",
			tm: "டௌன்டவுன்",
		},
		code: ["DT17"],
		line: ["DTL"],
	},
	{
		name: {
			en: "Esplanade",
			cn: "滨海中心",
			tm: "எஸ்பிளனேட்",
		},
		code: ["CC3"],
		line: ["CCL"],
	},
	{
		name: {
			en: "Eunos",
			cn: "友诺士",
			tm: "யூனுஸ்",
		},
		code: ["EW7"],
		line: ["EWL"],
		connections: "Eunos Bus Interchange",
	},
	{
		name: {
			en: "Expo",
			cn: "博覽",
			tm: "எக்ஸ்போ",
		},
		code: ["CG1", "DT35"],
		line: ["CGL", "DTL"],
	},
	{
		name: {
			en: "Farrer Park",
			cn: "花拉公园",
			tm: "ஃபேரர் பார்க்",
		},
		code: ["NE8"],
		line: ["NEL"],
	},
	{
		name: {
			en: "Farrer Road",
			cn: "花拉路",
			tm: "ஃபேரர் சாலை",
		},
		code: ["CC20"],
		line: ["CCL"],
	},
	{
		name: {
			en: "Fort Canning",
			cn: "福康宁",
			tm: "ஃபோர்ட் கெனிங்",
		},
		code: ["DT20"],
		line: ["DTL"],
	},
	{
		name: {
			en: "Gardens by the Bay",
			cn: "滨海湾花园",
			tm: "கரையோரப் பூந்தோட்டங்கள்",
			ms: "Taman Di Persisiran",
		},
		code: ["TE22"],
		line: ["TEL"],
	},
	{
		name: {
			en: "Geylang Bahru",
			cn: "芽笼峇鲁",
			tm: "கேலாங் பாரு",
		},
		code: ["DT24"],
		line: ["DTL"],
	},
	{
		name: {
			en: "Great World",
			cn: "大世界",
			tm: "கிரேட் வோர்ல்ட்",
		},
		code: ["TE15"],
		line: ["TEL"],
	},
	{
		name: {
			en: "Gul Circle",
			cn: "卡尔圈",
			tm: "கல் சர்க்கல்",
		},
		code: ["EW30"],
		line: ["EWL"],
	},
	{
		name: {
			en: "HarbourFront",
			cn: "港湾",
			tm: "ஹார்பர்ஃபிரண்ட்",
		},
		code: ["NE1", "CC29"],
		line: ["NEL", "CCL"],
		connections: "HarbourFront Bus Interchange",
	},
	{
		name: {
			en: "Havelock",
			cn: "合乐",
			tm: "ஹவ்லாக்",
		},
		code: ["TE16"],
		line: ["TEL"],
	},
	{
		name: {
			en: "Haw Par Villa",
			cn: "虎豹别墅",
			tm: "ஹா பர் வில்லா",
		},
		code: ["CC25"],
		line: ["CCL"],
	},
	{
		name: {
			en: "Hillview",
			cn: "山景",
			tm: "ஹில்வியூ",
		},
		code: ["DT3"],
		line: ["DTL"],
	},
	{
		name: {
			en: "Holland Village",
			cn: "荷兰村",
			tm: "ஹாலந்து வில்லேஜ்",
		},
		code: ["CC21"],
		line: ["CCL"],
	},
	{
		name: {
			en: "Hougang",
			cn: "后港",
			tm: "ஹவ்காங்",
		},
		code: ["NE14"],
		line: ["NEL"],
		connections: "Hougang Bus Interchange",
	},
	{
		name: {
			en: "Hume",
			cn: "谦道",
			tm: "ஹியூம்",
		},
		code: ["DT4"],
		line: ["DTL"],
	},
	{
		name: {
			en: "Jalan Besar",
			cn: "惹兰勿刹",
			tm: "ஜாலான் புசார்",
		},
		code: ["DT22"],
		line: ["DTL"],
	},
	{
		name: {
			en: "Joo Koon",
			cn: "裕群",
			tm: "ஜூ கூன்",
		},
		code: ["EW29"],
		line: ["EWL"],
		connections: "Joo Koon Bus Interchange",
	},
	{
		name: {
			en: "Jurong East",
			cn: "裕廊东",
			tm: "ஜூரோங் கிழக்கு",
		},
		code: ["NS1", "EW24"],
		line: ["NSL", "EWL"],
		connections: "Jurong East Bus Interchange",
	},
	{
		name: {
			en: "Kaki Bukit",
			cn: "加基武吉",
			tm: "காக்கி புக்கிட்",
		},
		code: ["DT28"],
		line: ["DTL"],
	},
	{
		name: {
			en: "Kallang",
			cn: "加冷",
			tm: "காலாங்",
		},
		code: ["EW10"],
		line: ["EWL"],
	},
	{
		name: {
			en: "Katong Park",
			cn: "加东公园",
			tm: "காத்தோங் பார்க்",
		},
		code: ["TE24"],
		line: ["TEL"],
	},
	{
		name: {
			en: "Kembangan",
			cn: "景万岸",
			tm: "கெம்பாங்கான்",
		},
		code: ["EW6"],
		line: ["EWL"],
	},
	{
		name: {
			en: "Kent Ridge",
			cn: "肯特岗",
			tm: "கெண்ட் ரிஜ்",
		},
		code: ["CC24"],
		line: ["CCL"],
	},
	{
		name: {
			en: "Keppel",
			cn: "吉宝",
			tm: "கெப்பல்",
		},
		code: ["CC30"],
		line: ["CCL"],
	},
	{
		name: {
			en: "Khatib",
			cn: "卡迪",
			tm: "காதிப்",
		},
		code: ["NS14"],
		line: ["NSL"],
	},
	{
		name: {
			en: "King Albert Park",
			cn: "阿尔柏王园",
			tm: "கிங் ஆல்பர்ட் பார்க்",
		},
		code: ["DT6"],
		line: ["DTL"],
	},
	{
		name: {
			en: "Kovan",
			cn: "高文",
			tm: "கோவன்",
		},
		code: ["NE13"],
		line: ["NEL"],
	},
	{
		name: {
			en: "Kranji",
			cn: "克兰芝",
			tm: "கிராஞ்சி",
		},
		code: ["NS7"],
		line: ["NSL"],
	},
	{
		name: {
			en: "Labrador Park",
			cn: "拉柏多公园",
			tm: "லாப்ரடார் பூங்கா",
		},
		code: ["CC27"],
		line: ["CCL"],
	},
	{
		name: {
			en: "Lakeside",
			cn: "湖畔",
			tm: "ஏரிக்கரை",
		},
		code: ["EW26"],
		line: ["EWL"],
	},
	{
		name: {
			en: "Lavender",
			cn: "劳明达",
			tm: "லவண்டர்",
		},
		code: ["EW11"],
		line: ["EWL"],
	},
	{
		name: {
			en: "Lentor",
			cn: "伦多",
			tm: "லென்ட்டோர்",
		},
		code: ["TE5"],
		line: ["TEL"],
	},
	{
		name: {
			en: "Little India",
			cn: "小印度",
			tm: "லிட்டில் இந்தியா",
		},
		code: ["NE7", "DT12"],
		line: ["NEL", "DTL"],
	},
	{
		name: {
			en: "Lorong Chuan",
			cn: "罗弄泉",
			tm: "லோரோங் சுவான்",
		},
		code: ["CC14"],
		line: ["CCL"],
	},
	{
		name: {
			en: "MacPherson",
			cn: "麦波申",
			tm: "மெக்பர்சன்",
		},
		code: ["CC10", "DT26"],
		line: ["CCL", "DTL"],
	},
	{
		name: {
			en: "Marina Bay",
			cn: "滨海湾",
			tm: "மரீனா பே",
		},
		code: ["NS27", "CC33", "TE20"],
		line: ["NSL", "CCL", "TEL"],
	},
	{
		name: {
			en: "Marina South Pier",
			cn: "滨海南码头",
			tm: "மரினா சவுத் பியர்",
		},
		code: ["NS28"],
		line: ["NSL"],
	},
	{
		name: {
			en: "Marine Parade",
			cn: "马林百列",
			tm: "மரீன் பரேட்",
		},
		code: ["TE26"],
		line: ["TEL"],
	},
	{
		name: {
			en: "Marine Terrace",
			cn: "马林台",
			tm: "மரீன் டெரஸ்",
		},
		code: ["TE27"],
		line: ["TEL"],
	},
	{
		name: {
			en: "Marsiling",
			cn: "马西岭",
			tm: "மார்சிலிங்",
		},
		code: ["NS8"],
		line: ["NSL"],
	},
	{
		name: {
			en: "Marymount",
			cn: "玛丽蒙",
			tm: "மேரிமவுண்ட்",
		},
		code: ["CC16"],
		line: ["CCL"],
	},
	{
		name: {
			en: "Mattar",
			cn: "玛达",
			tm: "மாத்தார்",
		},
		code: ["DT25"],
		line: ["DTL"],
	},
	{
		name: {
			en: "Maxwell",
			cn: "麦士威",
			tm: "மெச்ஸ்வெல்",
		},
		code: ["TE18"],
		line: ["TEL"],
	},
	{
		name: {
			en: "Mayflower",
			cn: "美华",
			tm: "மேஃபிளவர்",
		},
		code: ["TE6"],
		line: ["TEL"],
	},
	{
		name: {
			en: "Mountbatten",
			cn: "蒙巴登",
			tm: "மவுண்ட்பேட்டன்",
		},
		code: ["CC7"],
		line: ["CCL"],
	},
	{
		name: {
			en: "Napier",
			cn: "纳比雅",
			tm: "நேப்பியர்",
		},
		code: ["TE12"],
		line: ["TEL"],
	},
	{
		name: {
			en: "Newton",
			cn: "纽顿",
			tm: "நியூட்டன்",
		},
		code: ["NS21", "DT11"],
		line: ["NSL", "DTL"],
	},
	{
		name: {
			en: "Nicoll Highway",
			cn: "尼诰大道",
			tm: "நிக்கல் நெடுஞ்சாலை",
		},
		code: ["CC5"],
		line: ["CCL"],
	},
	{
		name: {
			en: "Novena",
			cn: "诺维娜",
			tm: "நொவீனா",
		},
		code: ["NS20"],
		line: ["NSL"],
	},
	{
		name: {
			en: "one-north",
			cn: "纬壹",
			tm: "ஒன்-நார்த்",
		},
		code: ["CC23"],
		line: ["CCL"],
	},
	{
		name: {
			en: "Orchard",
			cn: "乌节",
			tm: "ஆர்ச்சர்ட்",
		},
		code: ["NS22", "TE14"],
		line: ["NSL", "TEL"],
	},
	{
		name: {
			en: "Orchard Boulevard",
			cn: "乌节大道",
			tm: "ஆர்ச்சர்ட் பொலிவார்ட்",
		},
		code: ["TE13"],
		line: ["TEL"],
	},
	{
		name: {
			en: "Outram Park",
			cn: "欧南园",
			tm: "ஊட்ரம் பார்க்",
		},
		code: ["EW16", "NE3", "TE17"],
		line: ["EWL", "NEL", "TEL"],
	},
	{
		name: {
			en: "Pasir Panjang",
			cn: "巴西班让",
			tm: "பாசிர் பாஞ்சாங்",
		},
		code: ["CC26"],
		line: ["CCL"],
	},
	{
		name: {
			en: "Pasir Ris",
			cn: "巴西立",
			tm: "பாசிர் ரிஸ்",
		},
		code: ["EW1"],
		line: ["EWL"],
		connections: "Pasir Ris Bus Interchange",
	},
	{
		name: {
			en: "Paya Lebar",
			cn: "巴耶利峇",
			tm: "பாய லேபார்",
		},
		code: ["EW8", "CC9"],
		line: ["EWL", "CCL"],
	},
	{
		name: {
			en: "Pioneer",
			cn: "先驱",
			tm: "பயனியர்",
		},
		code: ["EW28"],
		line: ["EWL"],
	},
	{
		name: {
			en: "Potong Pasir",
			cn: "波东巴西",
			tm: "போத்தோங் பாசிர்",
		},
		code: ["NE10"],
		line: ["NEL"],
	},
	{
		name: {
			en: "Prince Edward Road",
			cn: "爱德华太子路",
			tm: "பிரின்ஸ் எட்வர்ட் ரோடு",
		},
		code: ["CC32"],
		line: ["CCL"],
		connections: "Shenton Way Bus Terminal",
	},
	{
		name: {
			en: "Promenade",
			cn: "宝门廊",
			tm: "புரொமனாட்",
		},
		code: ["CC4", "DT15"],
		line: ["CCL", "DTL"],
	},
	{
		name: {
			en: "Punggol",
			cn: "榜鹅",
			tm: "பொங்கோல்",
		},
		code: ["NE17", "PTC"],
		line: ["NEL"],
	},
	{
		name: {
			en: "Punggol Coast",
			cn: "榜鹅海岸",
			tm: "பொங்கோல் கோஸ்ட்",
		},
		code: ["NE18"],
		line: ["NEL"],
		connections: "Punggol Coast Bus Interchange",
	},
	{
		name: {
			en: "Queenstown",
			cn: "女皇镇",
			tm: "குவீன்ஸ்டவுன்",
		},
		code: ["EW19"],
		line: ["EWL"],
	},
	{
		name: {
			en: "Raffles Place",
			cn: "莱佛士坊",
			tm: "ராஃபிள்ஸ் பிளேஸ்",
		},
		code: ["EW14", "NS26"],
		line: ["EWL", "NSL"],
	},
	{
		name: {
			en: "Redhill",
			cn: "红山",
			tm: "ரெட்ஹில்",
		},
		code: ["EW18"],
		line: ["EWL"],
	},
	{
		name: {
			en: "Rochor",
			cn: "梧槽",
			tm: "ரோச்சோர்",
		},
		code: ["DT13"],
		line: ["DTL"],
	},
	{
		name: {
			en: "Sembawang",
			cn: "三巴旺",
			tm: "செம்பாவாங்",
		},
		code: ["NS11"],
		line: ["NSL"],
		connections: "Sembawang Bus Interchange",
	},
	{
		name: {
			en: "Sengkang",
			cn: "盛港",
			tm: "செங்காங்",
		},
		code: ["NE16", "STC"],
		line: ["NEL"],
		connections: "Sengkang Bus Interchange",
	},
	{
		name: {
			en: "Serangoon",
			cn: "实龙岗",
			tm: "சிராங்கூன்",
		},
		code: ["NE12", "CC13"],
		line: ["NEL", "CEL"],
		connections: "Serangoon Bus Interchange",
	},
	{
		name: {
			en: "Shenton Way",
			cn: "珊顿道",
			tm: "ஷென்ட்டன் வே",
		},
		code: ["TE19"],
		line: ["TEL"],
	},
	{
		name: {
			en: "Siglap",
			cn: "实乞纳",
			tm: "சிக்லாப்",
		},
		code: ["TE28"],
		line: ["TEL"],
	},
	{
		name: {
			en: "Simei",
			cn: "四美",
			tm: "ஸீமெய்",
		},
		code: ["EW3"],
		line: ["EWL"],
	},
	{
		name: {
			en: "Sixth Avenue",
			cn: "第六道",
			tm: "சிக்ஸ்த் அவென்யூ",
		},
		code: ["DT7"],
		line: ["DTL"],
	},
	{
		name: {
			en: "Somerset",
			cn: "索美塞",
			tm: "சாமர்செட்",
		},
		code: ["NS23"],
		line: ["NSL"],
	},
	{
		name: {
			en: "Springleaf",
			cn: "春叶",
			tm: "ஸ்பிரிங்லீஃவ்",
		},
		code: ["TE4"],
		line: ["TEL"],
	},
	{
		name: {
			en: "Stadium",
			cn: "体育场",
			tm: "ஸ்டேடியம்",
		},
		code: ["CC6"],
		line: ["CCL"],
	},
	{
		name: {
			en: "Stevens",
			cn: "史蒂芬",
			tm: "ஸ்டீவன்ஸ்",
		},
		code: ["DT10", "TE11"],
		line: ["DTL", "TEL"],
	},
	{
		name: {
			en: "Tai Seng",
			cn: "大成",
			tm: "தை செங்",
		},
		code: ["CC11"],
		line: ["CCL"],
	},
	{
		name: {
			en: "Tampines",
			cn: "淡滨尼",
			tm: "தெம்பனிஸ்",
		},
		code: ["EW2", "DT32"],
		line: ["EWL", "DTL"],
		connections: "Tampines Bus Interchange",
	},
	{
		name: {
			en: "Tampines East",
			cn: "淡滨尼东",
			tm: "தெம்பினிஸ் ஈஸ்ட்",
		},
		code: ["DT33"],
		line: ["DTL"],
	},
	{
		name: {
			en: "Tampines West",
			cn: "淡滨尼西",
			tm: "தெம்பினிஸ் வெஸ்ட்",
		},
		code: ["DT31"],
		line: ["DTL"],
	},
	{
		name: {
			en: "Tan Kah Kee",
			cn: "陈嘉庚",
			tm: "டான் கா கீ",
		},
		code: ["DT8"],
		line: ["DTL"],
	},
	{
		name: {
			en: "Tanah Merah",
			cn: "丹那美拉",
			tm: "தானா மேரா",
		},
		code: ["EW4", "CG"],
		line: ["EWL"],
	},
	{
		name: {
			en: "Tanjong Katong",
			cn: "丹戎加东",
			tm: "தஞ்சோங் காத்தோங்",
		},
		code: ["TE25"],
		line: ["TEL"],
	},
	{
		name: {
			en: "Tanjong Pagar",
			cn: "丹戎巴葛",
			tm: "தஞ்சோங் பகார்",
		},
		code: ["EW15"],
		line: ["EWL"],
	},
	{
		name: {
			en: "Tanjong Rhu",
			cn: "丹戎禺",
			tm: "தஞ்சோங் ரூ",
		},
		code: ["TE23"],
		line: ["TEL"],
	},
	{
		name: {
			en: "Telok Ayer",
			cn: "直落亚逸",
			tm: "தெலுக் ஆயர்",
		},
		code: ["DT18"],
		line: ["DTL"],
	},
	{
		name: {
			en: "Telok Blangah",
			cn: "直落布兰雅",
			tm: "தெலுக் பிளாங்கா",
		},
		code: ["CC28"],
		line: ["CCL"],
	},
	{
		name: {
			en: "Tiong Bahru",
			cn: "中峇鲁",
			tm: "தியோங் பாரு",
		},
		code: ["EW17"],
		line: ["EWL"],
	},
	{
		name: {
			en: "Toa Payoh",
			cn: "大巴窑",
			tm: "தோ பாயோ",
		},
		code: ["NS19"],
		line: ["NSL"],
		connections: "Toa Payoh Bus Interchange",
	},
	{
		name: {
			en: "Tuas Crescent",
			cn: "大士弯",
			tm: "துவாஸ் கிரசண்ட்",
		},
		code: ["EW31"],
		line: ["EWL"],
	},
	{
		name: {
			en: "Tuas Link",
			cn: "大士连路",
			tm: "துவாஸ் லிங்க்",
		},
		code: ["EW33"],
		line: ["EWL"],
		connections: "Tuas Bus Terminal",
	},
	{
		name: {
			en: "Tuas West Road",
			cn: "大士西路",
			tm: "துவாஸ் வெஸ்ட் ரோடு",
		},
		code: ["EW32"],
		line: ["EWL"],
	},
	{
		name: {
			en: "Ubi",
			cn: "乌美",
			tm: "உபி",
		},
		code: ["DT27"],
		line: ["DTL"],
	},
	{
		name: {
			en: "Upper Changi",
			cn: "樟宜上段",
			tm: "அப்பர் சாங்கி",
		},
		code: ["DT34"],
		line: ["DTL"],
	},
	{
		name: {
			en: "Upper Thomson",
			cn: "汤申路上段",
			tm: "அப்பர் தாம்சன்",
		},
		code: ["TE8"],
		line: ["TEL"],
	},
	{
		name: {
			en: "Woodlands",
			cn: "兀兰",
			tm: "ஊட்லண்ட்ஸ்",
		},
		code: ["NS9", "TE2"],
		line: ["NSL", "TEL"],
		connections: "Woodlands Bus Interchange",
	},
	{
		name: {
			en: "Woodlands North",
			cn: "兀兰北",
			tm: "ஊட்லண்ட்ஸ் நார்த்",
		},
		code: ["TE1"],
		line: ["TEL"],
	},
	{
		name: {
			en: "Woodlands South",
			cn: "兀兰南",
			tm: "ஊட்லண்ட்ஸ் சவுத்",
		},
		code: ["TE3"],
		line: ["TEL"],
	},
	{
		name: {
			en: "Woodleigh",
			cn: "兀里",
			tm: "உட் லீ",
		},
		code: ["NE11"],
		line: ["NEL"],
	},
	{
		name: {
			en: "Yew Tee",
			cn: "油池",
			tm: "இயூ டீ",
		},
		code: ["NS5"],
		line: ["NSL"],
	},
	{
		name: {
			en: "Yio Chu Kang",
			cn: "杨厝港",
			tm: "இயோ சூ காங்",
		},
		code: ["NS15"],
		line: ["NSL"],
		connections: "Yio Chu Kang Bus Interchange",
	},
	{
		name: {
			en: "Yishun",
			cn: "义顺",
			tm: "யீஷூன்",
		},
		code: ["NS13"],
		line: ["NSL"],
		connections: "Yishun Bus Interchange",
	},
];

export function getMrtStation(name: string) {
	return mrtStations.find((station) => station.name.en === name);
}

export function getMrtStationCoordinates(name: string) {
	const feature = mrtLowFi.stations.features.find(
		(f) => f.properties.name === name,
	);
	if (!feature) return undefined;

	return {
		longitude: feature.geometry.coordinates[0],
		latitude: feature.geometry.coordinates[1],
	};
}

export default mrtStations;
