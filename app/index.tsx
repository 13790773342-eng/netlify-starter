
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { Camera, Heart, Upload, Calendar, X, Check, Sparkles, MapPin, Trash2, Map as MapIcon, Settings, Download, Database, ShieldCheck, Printer, ZoomIn, Search, ArrowUp, Pencil, Star } from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import confetti from "canvas-confetti";
import Cropper from "react-easy-crop";

// --- Configuration & Data ---

const TASKS_LIST = [
  "一起看日出", "一起看日落", "一起做顿饭", "穿情侣装", "一起去游乐园",
  "一起看场电影", "一起去旅行", "一起过生日", "一起养只宠物", "一起去海边",
  "一起坐摩天轮", "一起拼乐高", "一起逛超市", "一起去演唱会", "一起淋雨",
  "一起看烟花", "一起去滑雪", "一起去露营", "一起去爬山", "一起去博物馆",
  "一起打游戏", "一起去图书馆", "一起做陶艺", "一起放风筝", "一起去动物园",
  "一起去水族馆", "一起喝醉一次", "一起看恐怖片", "一起做蛋糕", "一起去听音乐会",
  "一起去滑冰", "一起去游泳", "一起去健身", "一起去书店", "一起去公园野餐",
  "一起去电玩城", "一起去吃火锅", "一起去吃自助餐", "一起去吃路边摊", "一起去吃西餐",
  "一起去吃日料", "一起去吃韩料", "一起去吃甜品", "一起去喝奶茶", "一起去喝咖啡",
  "一起去喝酒", "一起去逛街", "一起去买菜", "一起去买花", "一起去买礼物",
  "互相写一封信", "互相画画像", "互相吹头发", "互相剪指甲", "互相按摩",
  "互相做面膜", "互相刷牙", "互相洗脸", "互相洗脚", "互相洗头",
  "一起去拍大头贴", "一起去拍写真", "一起去拍婚纱照", "一起去领证", "一起办婚礼",
  "一起度蜜月", "一起生宝宝", "一起带宝宝", "一起送宝宝上学", "一起接宝宝放学",
  "一起去开家长会", "一起去买房子", "一起去装修房子", "一起去买车", "一起去学车",
  "一起去兜风", "一起去散步", "一起去慢跑", "一起去骑行", "一起去钓鱼",
  "一起去划船", "一起去坐热气球", "一起去坐直升机", "一起去跳伞", "一起去蹦极",
  "一起去潜水", "一起去冲浪", "一起去滑板", "一起去溜冰", "一起去滑草",
  "一起去射箭", "一起去打保龄球", "一起去打台球", "一起去打羽毛球", "一起去打乒乓球",
  "一起去打网球", "一起去打篮球", "一起去打排球", "一起去踢足球", "一起变老"
];

const PROVINCES = [
  "北京", "天津", "河北", "山西", "内蒙古", "辽宁", "吉林", "黑龙江",
  "上海", "江苏", "浙江", "安徽", "福建", "江西", "山东",
  "河南", "湖北", "湖南", "广东", "广西", "海南",
  "重庆", "四川", "贵州", "云南", "西藏",
  "陕西", "甘肃", "青海", "宁夏", "新疆",
  "香港", "澳门", "台湾"
];

const CITIES: Record<string, string[]> = {
  "北京": ["东城区", "西城区", "朝阳区", "海淀区", "丰台区", "石景山区", "门头沟区", "房山区", "通州区", "顺义区", "昌平区", "大兴区", "怀柔区", "平谷区", "密云区", "延庆区"],
  "天津": ["和平区", "河东区", "河西区", "南开区", "河北区", "红桥区", "东丽区", "西青区", "津南区", "北辰区", "武清区", "宝坻区", "滨海新区", "宁河区", "静海区", "蓟州区"],
  "河北": ["石家庄", "唐山", "秦皇岛", "邯郸", "邢台", "保定", "张家口", "承德", "沧州", "廊坊", "衡水"],
  "山西": ["太原", "大同", "阳泉", "长治", "晋城", "朔州", "晋中", "运城", "忻州", "临汾", "吕梁"],
  "内蒙古": ["呼和浩特", "包头", "乌海", "赤峰", "通辽", "鄂尔多斯", "呼伦贝尔", "巴彦淖尔", "乌兰察布", "兴安盟", "锡林郭勒盟", "阿拉善盟"],
  "辽宁": ["沈阳", "大连", "鞍山", "抚顺", "本溪", "丹东", "锦州", "营口", "阜新", "辽阳", "盘锦", "铁岭", "朝阳", "葫芦岛"],
  "吉林": ["长春", "吉林", "四平", "辽源", "通化", "白山", "松原", "白城", "延边朝鲜族自治州"],
  "黑龙江": ["哈尔滨", "齐齐哈尔", "鸡西", "鹤岗", "双鸭山", "大庆", "伊春", "佳木斯", "七台河", "牡丹江", "黑河", "绥化", "大兴安岭地区"],
  "上海": ["黄浦区", "徐汇区", "长宁区", "静安区", "普陀区", "虹口区", "杨浦区", "闵行区", "宝山区", "嘉定区", "浦东新区", "金山区", "松江区", "青浦区", "奉贤区", "崇明区"],
  "江苏": ["南京", "无锡", "徐州", "常州", "苏州", "南通", "连云港", "淮安", "盐城", "扬州", "镇江", "泰州", "宿迁"],
  "浙江": ["杭州", "宁波", "温州", "嘉兴", "湖州", "绍兴", "金华", "衢州", "舟山", "台州", "丽水"],
  "安徽": ["合肥", "芜湖", "蚌埠", "淮南", "马鞍山", "淮北", "铜陵", "安庆", "黄山", "滁州", "阜阳", "宿州", "六安", "亳州", "池州", "宣城"],
  "福建": ["福州", "厦门", "莆田", "三明", "泉州", "漳州", "南平", "龙岩", "宁德"],
  "江西": ["南昌", "景德镇", "萍乡", "九江", "新余", "鹰潭", "赣州", "吉安", "宜春", "抚州", "上饶"],
  "山东": ["济南", "青岛", "淄博", "枣庄", "东营", "烟台", "潍坊", "济宁", "泰安", "威海", "日照", "临沂", "德州", "聊城", "滨州", "菏泽"],
  "河南": ["郑州", "开封", "洛阳", "平顶山", "安阳", "鹤壁", "新乡", "焦作", "濮阳", "许昌", "漯河", "三门峡", "南阳", "商丘", "信阳", "周口", "驻马店", "济源"],
  "湖北": ["武汉", "黄石", "十堰", "宜昌", "襄阳", "鄂州", "荆门", "孝感", "荆州", "黄冈", "咸宁", "随州", "恩施土家族苗族自治州", "仙桃", "天门", "潜江", "神农架林区"],
  "湖南": ["长沙", "株洲", "湘潭", "衡阳", "邵阳", "岳阳", "常德", "张家界", "益阳", "郴州", "永州", "怀化", "娄底", "湘西土家族苗族自治州"],
  "广东": ["广州", "深圳", "珠海", "汕头", "佛山", "江门", "湛江", "茂名", "肇庆", "惠州", "梅州", "汕尾", "河源", "阳江", "清远", "东莞", "中山", "潮州", "揭阳", "云浮"],
  "广西": ["南宁", "柳州", "桂林", "梧州", "北海", "防城港", "钦州", "贵港", "玉林", "百色", "贺州", "河池", "来宾", "崇左"],
  "海南": ["海口", "三亚", "三沙", "儋州"],
  "重庆": ["万州区", "涪陵区", "渝中区", "大渡口区", "江北区", "沙坪坝区", "九龙坡区", "南岸区", "北碚区", "綦江区", "大足区", "渝北区", "巴南区", "黔江区", "长寿区", "江津区", "合川区", "永川区", "南川区", "璧山区", "铜梁区", "潼南区", "荣昌区", "开州区", "梁平区", "武隆区"],
  "四川": ["成都", "自贡", "攀枝花", "泸州", "德阳", "绵阳", "广元", "遂宁", "内江", "乐山", "南充", "眉山", "宜宾", "广安", "达州", "雅安", "巴中", "资阳", "阿坝藏族羌族自治州", "甘孜藏族自治州", "凉山彝族自治州"],
  "贵州": ["贵阳", "六盘水", "遵义", "安顺", "毕节", "铜仁", "黔西南布依族苗族自治州", "黔东南苗族侗族自治州", "黔南布依族苗族自治州"],
  "云南": ["昆明", "曲靖", "玉溪", "保山", "昭通", "丽江", "普洱", "临沧", "楚雄彝族自治州", "红河哈尼族彝族自治州", "文山壮族苗族自治州", "西双版纳傣族自治州", "大理白族自治州", "德宏傣族景颇族自治州", "怒江傈僳族自治州", "迪庆藏族自治州"],
  "西藏": ["拉萨", "日喀则", "昌都", "林芝", "山南", "那曲", "阿里地区"],
  "陕西": ["西安", "铜川", "宝鸡", "咸阳", "渭南", "延安", "汉中", "榆林", "安康", "商洛"],
  "甘肃": ["兰州", "嘉峪关", "金昌", "白银", "天水", "武威", "张掖", "平凉", "酒泉", "庆阳", "定西", "陇南", "临夏回族自治州", "甘南藏族自治州"],
  "青海": ["西宁", "海东", "海北藏族自治州", "黄南藏族自治州", "海南藏族自治州", "果洛藏族自治州", "玉树藏族自治州", "海西蒙古族藏族自治州"],
  "宁夏": ["银川", "石嘴山", "吴忠", "固原", "中卫"],
  "新疆": ["乌鲁木齐", "克拉玛依", "吐鲁番", "哈密", "昌吉回族自治州", "博尔塔拉蒙古自治州", "巴音郭楞蒙古自治州", "阿克苏地区", "克孜勒苏柯尔克孜自治州", "喀什地区", "和田地区", "伊犁哈萨克自治州", "塔城地区", "阿勒泰地区"],
  "香港": ["香港"],
  "澳门": ["澳门"],
  "台湾": ["台北", "高雄", "基隆", "台中", "台南", "新竹", "嘉义"]
};

const DB_NAME = "LoveListDB";
const STORE_NAME = "photos";
const SHUTTER_SOUND = ""; 

// Province coordinates for map markers (Approximate relative % positions)
const PROVINCE_COORDS: Record<string, { x: number, y: number }> = {
  "北京": { x: 74, y: 28 },
  "天津": { x: 76, y: 30 },
  "河北": { x: 73, y: 32 },
  "山西": { x: 68, y: 35 },
  "内蒙古": { x: 60, y: 20 },
  "辽宁": { x: 82, y: 25 },
  "吉林": { x: 88, y: 18 },
  "黑龙江": { x: 88, y: 8 },
  "上海": { x: 85, y: 55 },
  "江苏": { x: 80, y: 50 },
  "浙江": { x: 82, y: 60 },
  "安徽": { x: 76, y: 52 },
  "福建": { x: 78, y: 70 },
  "江西": { x: 72, y: 65 },
  "山东": { x: 78, y: 40 },
  "河南": { x: 70, y: 45 },
  "湖北": { x: 68, y: 55 },
  "湖南": { x: 65, y: 65 },
  "广东": { x: 70, y: 80 },
  "广西": { x: 58, y: 78 },
  "海南": { x: 62, y: 92 },
  "重庆": { x: 58, y: 60 },
  "四川": { x: 48, y: 55 },
  "贵州": { x: 55, y: 70 },
  "云南": { x: 45, y: 78 },
  "西藏": { x: 20, y: 55 },
  "陕西": { x: 60, y: 45 },
  "甘肃": { x: 45, y: 35 },
  "青海": { x: 35, y: 40 },
  "宁夏": { x: 55, y: 38 },
  "新疆": { x: 20, y: 25 },
  "香港": { x: 72, y: 82 },
  "澳门": { x: 71, y: 82 },
  "台湾": { x: 88, y: 75 }
};

const openDB = () => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 2);
    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = (event: any) => {
      resolve(event.target.result);
    };
    request.onerror = (event) => {
      reject(event);
    };
  });
};

const savePhotoToDB = async (id: number, file: Blob) => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  return new Promise<void>((resolve, reject) => {
    const request = store.put({ id, file });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

const getPhotoFromDB = async (id: number): Promise<Blob | null> => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);
  return new Promise((resolve, reject) => {
    const request = store.get(id);
    request.onsuccess = () => {
      resolve(request.result ? request.result.file : null);
    };
    request.onerror = () => reject(request.error);
  });
};

const deletePhotoFromDB = async (id: number) => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  return new Promise<void>((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

const clearAllPhotosFromDB = async () => {
   const db = await openDB();
   const tx = db.transaction(STORE_NAME, "readwrite");
   const store = tx.objectStore(STORE_NAME);
   return new Promise<void>((resolve, reject) => {
     const request = store.clear();
     request.onsuccess = () => resolve();
     request.onerror = () => reject(request.error);
   });
};

// Image Cropper Component
const ImageCropper = ({ imageSrc, onCropComplete, onCancel }: { imageSrc: string, onCropComplete: (croppedImg: Blob) => void, onCancel: () => void }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropChange = (crop: any) => {
    setCrop(crop);
  };

  const onCropCompleteCallback = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createCroppedImage = async () => {
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedImage) {
        onCropComplete(croppedImage);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black bg-opacity-90 flex flex-col items-center justify-center p-4">
      <div className="relative w-full h-[60vh] bg-gray-900 rounded-lg overflow-hidden mb-4">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={onCropChange}
          onCropComplete={onCropCompleteCallback}
          onZoomChange={setZoom}
        />
      </div>
      <div className="w-full max-w-md space-y-4">
        <div className="flex items-center gap-2 text-white">
            <ZoomIn size={20} />
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
        </div>
        <div className="flex gap-4">
            <button onClick={onCancel} className="flex-1 py-3 bg-gray-700 text-white rounded-xl font-handwritten text-xl">
                取消
            </button>
            <button onClick={createCroppedImage} className="flex-1 py-3 bg-rose-500 text-white rounded-xl font-handwritten text-xl">
                确认裁剪
            </button>
        </div>
      </div>
    </div>
  );
};

// Utility to crop image
async function getCroppedImg(imageSrc: string, pixelCrop: any): Promise<Blob | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/jpeg', 0.9);
  });
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

// --- Components ---

const TabButton = ({ active, onClick, label, icon: Icon }: { active: boolean, onClick: () => void, label: string, icon?: any }) => (
    <button 
        onClick={onClick}
        className={`
            flex flex-col items-center justify-center py-2 rounded-xl text-sm font-bold transition-all
            ${active 
                ? 'bg-rose-500 text-white shadow-md transform scale-105' 
                : 'bg-white text-gray-500 hover:bg-rose-50 border border-gray-100'}
        `}
    >
        {Icon && <Icon size={18} className="mb-0.5" />}
        <span>{label}</span>
    </button>
);

const LoveMapSection = ({ tasks }: { tasks: TaskData[] }) => {
    // Calculate stats per province
    const provinceStats = useMemo(() => {
        const counts: Record<string, number> = {};
        tasks.forEach(task => {
            if (task.completed && task.location?.province) {
                const p = task.location.province;
                counts[p] = (counts[p] || 0) + 1;
            }
        });
        // Convert to array and sort
        return Object.entries(counts)
            .map(([province, count]) => ({ province, count }))
            .sort((a, b) => b.count - a.count);
    }, [tasks]);

    // Visited provinces count
    const visitedCount = provinceStats.length;

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 1. Map Card */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-rose-100 relative overflow-hidden">
                <h2 className="text-2xl font-bold text-rose-800 mb-4 flex items-center gap-2 font-handwritten">
                    我们的足迹
                </h2>
                <div className="w-full aspect-[4/3] bg-gradient-to-br from-[#fdf2f8] via-white to-[#fdf2f8] rounded-2xl border border-rose-100 relative overflow-hidden flex items-center justify-center">
                    
                    {/* Pink China Map Outline */}
                    <div className="relative w-full h-full p-4">
                       <svg viewBox="0 0 800 600" className="w-full h-full drop-shadow-lg">
                          {/* Simplified outline of China */}
                          <path 
                            d="M230,120 L280,80 L320,60 L380,40 L450,20 L520,40 L600,60 L650,40 L680,20 L720,40 L740,80 L720,120 L750,150 L730,180 L760,200 L740,240 L700,260 L680,300 L650,340 L620,380 L640,400 L620,440 L580,460 L540,480 L500,520 L460,500 L420,520 L380,500 L340,520 L300,500 L260,480 L220,460 L180,440 L140,420 L100,380 L60,340 L40,300 L60,260 L100,240 L140,220 L180,200 L200,160 Z"
                            fill="none" 
                            stroke="#f472b6" 
                            strokeWidth="3"
                            strokeLinejoin="round"
                            className="drop-shadow-sm"
                          />
                          {/* Taiwan */}
                          <path d="M700,420 L710,410 L720,420 L710,430 Z" fill="none" stroke="#f472b6" strokeWidth="2" />
                          {/* Hainan */}
                          <path d="M480,550 L490,540 L500,550 L490,560 Z" fill="none" stroke="#f472b6" strokeWidth="2" />
                       </svg>

                       {/* Pins for visited provinces */}
                       {provinceStats.map((stat) => {
                           const coords = PROVINCE_COORDS[stat.province];
                           if (!coords) return null;
                           return (
                               <div 
                                    key={stat.province}
                                    className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
                                    style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
                               >
                                    <div className="relative">
                                        <MapPin className="text-rose-500 fill-rose-500 animate-bounce" size={24} style={{ animationDuration: '2s' }} />
                                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                          <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                                        </span>
                                    </div>
                                    <span className="mt-1 text-xs font-bold text-rose-600 bg-white/90 px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                        {stat.province} ({stat.count})
                                    </span>
                               </div>
                           );
                       })}
                    </div>

                    <div className="absolute bottom-4 right-4 text-rose-400 font-bold text-sm bg-white/80 px-3 py-1 rounded-full shadow-sm backdrop-blur-sm border border-rose-100">
                        点亮了 <span className="text-rose-600 text-lg mx-1">{visitedCount}</span> 个省份
                    </div>
                </div>
            </div>

            {/* 2. Stats List Card (Below Map) */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-rose-100">
                <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2 font-handwritten">
                    <Star className="text-yellow-400 fill-yellow-400" size={24} />
                    甜蜜足迹统计
                </h3>
                
                <div className="space-y-3">
                    {provinceStats.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 font-handwritten">
                            还没有去过任何地方哦，快去打卡吧！
                        </div>
                    ) : (
                        provinceStats.map((stat, idx) => (
                            <div key={stat.province} className="flex items-center justify-between p-4 rounded-2xl bg-[#fff0f3]/50 hover:bg-[#fff0f3] transition-colors group">
                                <div className="flex items-center gap-4">
                                    <span className={`
                                        w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold shadow-sm font-handwritten
                                        ${idx < 3 ? 'bg-rose-400 text-white' : 'bg-white text-gray-400 border border-gray-100'}
                                    `}>
                                        {idx + 1}
                                    </span>
                                    <span className="font-bold text-gray-700 text-lg font-handwritten group-hover:text-rose-600 transition-colors">
                                        {stat.province}
                                    </span>
                                </div>
                                <span className="text-sm text-rose-500 font-bold bg-white px-3 py-1 rounded-lg border border-rose-100 shadow-sm font-handwritten">
                                    {stat.count} 次回忆
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const TaskCard = ({ task, onClick }: { task: TaskData; onClick: () => void }) => {
  const [bgImage, setBgImage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (task.hasPhoto) {
      getPhotoFromDB(task.id).then((blob) => {
        if (isMounted && blob) {
          setBgImage(URL.createObjectURL(blob));
        }
      });
    } else {
      setBgImage(null);
    }
    return () => {
      isMounted = false;
    };
  }, [task.hasPhoto, task.id]);

  return (
    <div
      onClick={onClick}
      className="relative aspect-square rounded-2xl border-2 border-rose-100 bg-white p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group overflow-hidden hover:scale-[1.03]"
    >
        {/* Blurred Background Image if available */}
        {bgImage && (
            <div
                className="absolute inset-0 bg-cover bg-center opacity-30 blur-sm transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${bgImage})` }}
            />
        )}

      <div className="z-10 w-full h-full flex flex-col items-center justify-center">
          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110 ${
            task.completed
              ? "bg-rose-500 border-rose-500 text-white"
              : "border-rose-200 text-transparent group-hover:border-rose-300"
          }`}>
            <Check size={16} strokeWidth={3} className={task.completed ? "scale-100" : "scale-0"} style={{transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'}}/>
          </div>
          <h3 className={`font-handwritten text-xl leading-snug px-2 transition-colors duration-300 ${
              task.completed ? "text-rose-600" : "text-gray-700 group-hover:text-rose-500"
          }`}>
            {task.customTitle || task.title}
          </h3>
          {task.date && (
              <p className="text-xs text-rose-400 mt-2 font-handwritten">{task.date}</p>
          )}
      </div>
    </div>
  );
};

const TaskDetailModal = ({
  task,
  onClose,
  onUpdate,
}: {
  task: TaskData;
  onClose: () => void;
  onUpdate: (updates: Partial<TaskData>) => void;
}) => {
  const [note, setNote] = useState(task.note || "");
  const [date, setDate] = useState(task.date || "");
  const [customTitle, setCustomTitle] = useState(task.customTitle || task.title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  
  // Initialize location state carefully
  const [location, setLocation] = useState<{
      province?: string;
      city?: string;
  }>(task.location || {});

  const [isGenerating, setIsGenerating] = useState(false);
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const completeButtonRef = useRef<HTMLButtonElement>(null);

  // Cropper State
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

  // Printing Animation State
  const [printingState, setPrintingState] = useState<'idle' | 'printing' | 'preview'>('idle');
  const [generatedPolaroidUrl, setGeneratedPolaroidUrl] = useState<string | null>(null);

  // Play sound
  const playShutterSound = () => {
     if(SHUTTER_SOUND) {
         const audio = new Audio(SHUTTER_SOUND);
         audio.volume = 0.5;
         audio.play().catch(e => console.log("Audio play failed", e));
     }
  };

  useEffect(() => {
    if (task.hasPhoto) {
      setIsPhotoLoading(true);
      getPhotoFromDB(task.id).then((blob) => {
        if (blob) setPhoto(URL.createObjectURL(blob));
        setIsPhotoLoading(false);
      });
    }
  }, [task.id, task.hasPhoto]);

  // Handle Province Change: Reset city when province changes
  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setLocation({
          province: e.target.value,
          city: "" // Reset city
      });
  };

  // Handle City Change
  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setLocation(prev => ({
          ...prev,
          city: e.target.value
      }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setCropImageSrc(reader.result as string);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setIsPhotoLoading(true);
    setCropImageSrc(null); // Close cropper
    try {
        await savePhotoToDB(task.id, croppedBlob);
        setPhoto(URL.createObjectURL(croppedBlob));
        onUpdate({ hasPhoto: true });
    } catch (error) {
        console.error("Failed to save photo", error);
        alert("保存照片失败");
    } finally {
        setIsPhotoLoading(false);
    }
  };

  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);

  const executeDeletePhoto = async () => {
      try {
        setIsPhotoLoading(true);
        await deletePhotoFromDB(task.id);
        setPhoto(null);
        onUpdate({ hasPhoto: false });
        setIsDeletingPhoto(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (error) {
        console.error("Delete failed", error);
        alert("删除失败");
      } finally {
        setIsPhotoLoading(false);
      }
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Write a short, super romantic, poetic 1-sentence caption (in Chinese) for a couple's memory about "${customTitle}". Context: ${note}. Tone: Sweet, warm, sentimental.`,
      });
      setNote(prev => (prev ? prev + "\n" + response.text.trim() : response.text.trim()));
    } catch (error) {
      console.error("AI Error", error);
      alert("AI 灵感枯竭了，稍后再试吧~");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleCompleted = () => {
    const newStatus = !task.completed;
    onUpdate({ completed: newStatus });
    if (newStatus && completeButtonRef.current) {
        // Confetti logic...
        const rect = completeButtonRef.current.getBoundingClientRect();
        const xLeft = rect.left / window.innerWidth;
        const xRight = rect.right / window.innerWidth;
        const y = (rect.top + rect.height / 2) / window.innerHeight;

        confetti({ particleCount: 40, spread: 60, origin: { x: xLeft, y: y }, angle: 135, colors: ['#fb7185', '#f43f5e', '#ffe4e6'] });
        confetti({ particleCount: 40, spread: 60, origin: { x: xRight, y: y }, angle: 45, colors: ['#fb7185', '#f43f5e', '#ffe4e6'] });

        if (task.hasPhoto) {
            setTimeout(() => { playShutterSound(); }, 800);
        }
    }
  };

  const handleSave = () => {
    onUpdate({ note, date, location, customTitle });
    onClose();
  };

  // Prepare Polaroid Image Blob (Hidden process)
  const generatePolaroidBlob = async () => {
     if (!photo) return null;
     const canvas = document.createElement("canvas");
     canvas.width = 800;
     canvas.height = 1000;
     const ctx = canvas.getContext("2d");
     if (!ctx) return null;

     const gradient = ctx.createLinearGradient(0, 0, 800, 1000);
     gradient.addColorStop(0, "#fff1f2");
     gradient.addColorStop(1, "#ffe4e6");
     ctx.fillStyle = gradient;
     ctx.fillRect(0, 0, 800, 1000);
     
     ctx.shadowColor = "rgba(0,0,0,0.1)";
     ctx.shadowBlur = 20;
     ctx.shadowOffsetX = 0;
     ctx.shadowOffsetY = 10;

     ctx.fillStyle = "#ffffff";
     ctx.fillRect(50, 50, 700, 700);

     try {
        const img = await createImage(photo);
        ctx.shadowColor = "transparent";
        ctx.drawImage(img, 70, 70, 660, 660);
     } catch (e) {
         console.error("Failed to load image for print", e);
         return null;
     }

     ctx.font = "bold 48px 'Long Cang', cursive";
     ctx.fillStyle = "#4c0519";
     ctx.textAlign = "center";
     ctx.fillText(customTitle, 400, 820);

     ctx.font = "32px 'Long Cang', cursive";
     ctx.fillStyle = "#fb7185";
     let locText = "";
     if (location.city) locText += location.city + " ";
     if (date) locText += date;
     if (!locText) locText = "甜蜜时刻";
     ctx.fillText(locText, 400, 880);

     ctx.font = "italic 24px 'Long Cang', cursive";
     ctx.fillStyle = "#9ca3af";
     ctx.fillText("— Love List 100 —", 400, 950);

     return new Promise<string>((resolve) => {
        canvas.toBlob((blob) => {
            if (blob) resolve(URL.createObjectURL(blob));
        }, 'image/png');
     });
  };

  const startPrintingProcess = async () => {
      if (!photo) return;
      setPrintingState('printing');
      playShutterSound();
      
      const url = await generatePolaroidBlob();
      if (url) {
          setGeneratedPolaroidUrl(url);
          setTimeout(() => {
              setPrintingState('preview');
              const link = document.createElement("a");
              link.href = url;
              link.download = `polaroid-${task.id}.png`;
              link.click();
          }, 2500); 
      } else {
          setPrintingState('idle');
          alert("打印失败");
      }
  };

  const closePreview = () => {
      setPrintingState('idle');
      setGeneratedPolaroidUrl(null);
  };

  // Derived city options based on current province selection
  const cityOptions = location.province && CITIES[location.province] ? CITIES[location.province] : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      {cropImageSrc && (
          <ImageCropper
              imageSrc={cropImageSrc}
              onCropComplete={handleCropComplete}
              onCancel={() => setCropImageSrc(null)}
          />
      )}

      {printingState === 'preview' && generatedPolaroidUrl && (
          <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md cursor-pointer" onClick={closePreview}>
              <img 
                src={generatedPolaroidUrl} 
                alt="Polaroid" 
                className="w-[90vw] max-w-md h-auto shadow-2xl rounded-sm transform transition-all duration-500 scale-100 hover:scale-105"
                onClick={(e) => e.stopPropagation()} 
              />
              <p className="mt-8 text-white font-handwritten text-xl animate-bounce">已保存到相册 ✨ 点击任意处关闭</p>
          </div>
      )}

      <div className="bg-[#fff0f3] w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-rose-100 flex justify-between items-center bg-white/50">
            {isEditingTitle ? (
                <div className="flex items-center gap-2 flex-1 mr-4">
                    <input 
                        type="text" 
                        value={customTitle} 
                        onChange={(e) => setCustomTitle(e.target.value)}
                        className="flex-1 bg-white border border-rose-200 rounded-lg px-2 py-1 font-handwritten text-xl outline-none focus:border-rose-400"
                        autoFocus
                    />
                    <button onClick={() => setIsEditingTitle(false)} className="bg-rose-500 text-white p-1 rounded-full"><Check size={16}/></button>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold font-handwritten text-rose-800">{customTitle}</h2>
                    <button onClick={() => setIsEditingTitle(true)} className="text-rose-300 hover:text-rose-500"><Pencil size={16}/></button>
                </div>
            )}
          <button onClick={onClose} className="p-2 hover:bg-rose-100 rounded-full transition-colors text-rose-400">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          
          {/* Photo Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-rose-600 font-bold font-handwritten text-lg">
              <Camera size={20} />
              <span>照片记录</span>
            </div>
            
            <div className="relative w-full aspect-square bg-white rounded-2xl border-2 border-dashed border-rose-200 flex flex-col items-center justify-center overflow-hidden group hover:border-rose-400 transition-colors">
              {isPhotoLoading ? (
                  <div className="animate-spin text-rose-400"><Sparkles size={32}/></div>
              ) : photo ? (
                <>
                  <img src={photo} alt="Memory" className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 flex gap-2">
                      {isDeletingPhoto ? (
                          <div className="flex items-center gap-1 bg-white/90 p-1 rounded-lg shadow-sm animate-in fade-in zoom-in duration-200">
                              <button onClick={executeDeletePhoto} className="bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600 font-bold">确认?</button>
                              <button onClick={() => setIsDeletingPhoto(false)} className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded hover:bg-gray-300">取消</button>
                          </div>
                      ) : (
                        <button onClick={() => setIsDeletingPhoto(true)} className="p-2 bg-white/80 rounded-full text-rose-500 hover:bg-red-50 hover:text-red-500 transition-all shadow-sm" title="删除照片">
                            <Trash2 size={18} />
                        </button>
                      )}
                  </div>
                </>
              ) : (
                <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center text-rose-300 hover:text-rose-500 transition-colors">
                  <Upload size={48} className="mb-2" />
                  <span className="font-handwritten text-lg">上传甜蜜瞬间</span>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                </label>
              )}
            </div>

            {/* Print Button Area */}
            {photo && (
                <div className="relative flex justify-center mt-4 h-16"> 
                    {printingState === 'printing' && generatedPolaroidUrl && (
                        <img 
                            src={generatedPolaroidUrl} 
                            className="absolute top-0 w-24 h-32 object-cover border-4 border-white shadow-lg z-0"
                            style={{ animation: 'slideOutDown 2.5s cubic-bezier(0.25, 1, 0.5, 1) forwards' }}
                        />
                    )}
                    <button
                        onClick={startPrintingProcess}
                        disabled={printingState !== 'idle'}
                        className={`relative z-10 flex items-center gap-2 px-8 py-3 rounded-xl shadow-md font-handwritten text-lg transition-all duration-500 w-full justify-center
                            ${printingState !== 'idle' 
                                ? 'bg-gradient-to-r from-rose-300 via-pink-400 to-rose-300 text-white scale-95 shadow-inner' 
                                : 'bg-white text-rose-500 border border-rose-200 hover:border-rose-400 hover:shadow-lg'
                            }
                        `}
                    >
                        <Printer size={20} className={printingState !== 'idle' ? 'animate-bounce' : ''} />
                        {printingState === 'printing' ? '正在打印...' : '打印拍立得照片'}
                    </button>
                </div>
            )}
          </div>

          {/* Date & Location */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-rose-600 font-bold font-handwritten">
                <Calendar size={18} /> 日期
              </label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-gray-600 focus:outline-none focus:border-rose-400 font-handwritten" />
            </div>
            <div className="space-y-2">
               <label className="flex items-center gap-2 text-rose-600 font-bold font-handwritten">
                <MapPin size={18} /> 地点
              </label>
              <div className="flex flex-col gap-2">
                  <select
                    value={location.province || ""}
                    onChange={handleProvinceChange}
                    className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-gray-600 focus:outline-none focus:border-rose-400 font-handwritten"
                  >
                      <option value="">省份</option>
                      {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <select
                    value={location.city || ""}
                    onChange={handleCityChange}
                    disabled={!location.province}
                    className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-gray-600 focus:outline-none focus:border-rose-400 font-handwritten disabled:bg-gray-50"
                  >
                      <option value="">城市/区</option>
                      {cityOptions.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
              </div>
            </div>
          </div>

          {/* Note Section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 text-rose-600 font-bold font-handwritten text-lg">
                <Heart size={20} /> 恋爱日记
              </label>
              <button
                onClick={handleGenerateAI}
                disabled={isGenerating}
                className="flex items-center gap-1 text-xs bg-purple-100 text-purple-600 px-3 py-1 rounded-full hover:bg-purple-200 transition-colors disabled:opacity-50"
              >
                <Sparkles size={14} />
                {isGenerating ? "AI 思考中..." : "AI 润色"}
              </button>
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="记录下这一刻的心情吧..."
              className="w-full h-32 bg-white border border-rose-200 rounded-xl p-4 text-gray-600 focus:outline-none focus:border-rose-400 resize-none font-handwritten text-lg leading-relaxed"
            />
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white/50 border-t border-rose-100 flex gap-3">
          <button
            ref={completeButtonRef}
            onClick={toggleCompleted}
            className={`flex-1 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 text-lg font-handwritten ${
              task.completed
                ? "bg-green-100 text-green-600 border border-green-200"
                : "bg-white text-gray-400 border border-gray-200 hover:border-rose-300 hover:text-rose-400"
            }`}
          >
            {task.completed ? <><Check size={20} /> 已完成</> : "标记为已完成"}
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-rose-500 text-white py-3 rounded-xl font-bold hover:bg-rose-600 transition-colors shadow-md shadow-rose-200 text-lg font-handwritten"
          >
            保存记忆
          </button>
        </div>
      </div>
      <style>{`
        @keyframes slideOutDown {
          0% { transform: translateY(0) scale(0.2); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(150%) scale(0.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

const SettingsModal = ({
    onClose,
    onReset,
    stats
}: {
    onClose: () => void;
    onReset: () => void;
    stats: { completed: number, photos: number }
}) => {
    const [confirmReset, setConfirmReset] = useState(false);

    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(localStorage));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "love_list_backup.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 font-handwritten">数据管理</h2>
                    <button onClick={onClose}><X size={24} className="text-gray-400 hover:text-gray-600"/></button>
                </div>

                <div className="space-y-6">
                    <div className="bg-rose-50 p-4 rounded-xl flex items-center gap-3 text-rose-800">
                        <ShieldCheck size={24} />
                        <div>
                            <h3 className="font-bold font-handwritten text-lg">私有化模式</h3>
                            <p className="text-sm opacity-80 font-handwritten">所有数据仅存储在您的设备上</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <div className="text-2xl font-bold text-rose-500 font-handwritten">{stats.completed}</div>
                            <div className="text-xs text-gray-500 font-handwritten">完成心愿</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <div className="text-2xl font-bold text-rose-500 font-handwritten">{stats.photos}</div>
                            <div className="text-xs text-gray-500 font-handwritten">珍藏照片</div>
                        </div>
                    </div>

                    <button onClick={handleExport} className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 font-handwritten text-lg">
                        <Download size={18} /> 导出文字数据 (JSON)
                    </button>

                    <div className="pt-4 border-t border-gray-100">
                        {!confirmReset ? (
                            <button 
                                onClick={() => setConfirmReset(true)}
                                className="w-full py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-handwritten text-lg flex items-center justify-center gap-2"
                            >
                                <Trash2 size={18} /> 清空所有数据
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button onClick={() => setConfirmReset(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-handwritten">取消</button>
                                <button onClick={onReset} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-handwritten hover:bg-red-600 animate-pulse">确认清空?</button>
                            </div>
                        )}
                        <p className="text-xs text-center text-gray-400 mt-2 font-handwritten">此操作无法撤销，包含所有照片</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main App Component ---

const App = () => {
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [selectedTask, setSelectedTask] = useState<TaskData | null>(null);
  const [filter, setFilter] = useState<'all' | 'completed' | 'todo' | 'map'>('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Initialize Data
  useEffect(() => {
    const loadData = () => {
        const saved = localStorage.getItem("love_tasks_v2");
        if (saved) {
          setTasks(JSON.parse(saved));
        } else {
          const initialTasks = TASKS_LIST.map((title, index) => ({
            id: index + 1,
            title,
            completed: false,
            hasPhoto: false
          }));
          setTasks(initialTasks);
        }
    };
    loadData();
  }, []);

  // Save Data
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem("love_tasks_v2", JSON.stringify(tasks));
    }
  }, [tasks]);

  // Scroll Listener
  useEffect(() => {
      const handleScroll = () => {
          if (window.scrollY > 300) setShowScrollTop(true);
          else setShowScrollTop(false);
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFullReset = async () => {
      try {
          await clearAllPhotosFromDB();
          localStorage.removeItem("love_tasks_v2");
          const initialTasks = TASKS_LIST.map((title, index) => ({
              id: index + 1,
              title,
              completed: false,
              hasPhoto: false
          }));
          setTasks(initialTasks);
          setFilter('all');
          setSearchQuery('');
          setShowSettings(false);
          alert("数据已重置");
      } catch (e) {
          console.error("Reset failed", e);
          alert("重置失败");
      }
  };

  const handleUpdateTask = (updates: Partial<TaskData>) => {
    if (!selectedTask) return;
    const newTasks = tasks.map((t) =>
      t.id === selectedTask.id ? { ...t, ...updates } : t
    );
    setTasks(newTasks);
    setSelectedTask({ ...selectedTask, ...updates });
  };

  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (searchQuery.trim()) {
        const lowerQ = searchQuery.toLowerCase();
        result = result.filter(t => 
            (t.customTitle || t.title).toLowerCase().includes(lowerQ) || 
            (t.note && t.note.toLowerCase().includes(lowerQ))
        );
    }
    if (filter === 'completed') return result.filter(t => t.completed);
    if (filter === 'todo') return result.filter(t => !t.completed);
    return result;
  }, [tasks, filter, searchQuery]);

  const progress = Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100);

  return (
    <div className="min-h-screen pb-20 bg-[#f8e8f2] font-handwritten transition-colors duration-500">
      
      {/* Header Area */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm shadow-sm border-b border-rose-100">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-[#ec4899] flex items-center gap-2">
              <Heart className="fill-[#ec4899] w-6 h-6" /> 
              恋人必做的100件小事
            </h1>
            <div className="flex items-center gap-3">
                <span className="text-[#f472b6] font-bold text-lg">{progress}% 完成</span>
                <button onClick={() => setShowSettings(true)} className="text-gray-400 hover:text-[#ec4899]">
                    <Settings size={20}/>
                </button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative mb-2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-rose-300" />
              </div>
              <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索我们的回忆..."
                  className="block w-full pl-9 pr-3 py-2 border border-rose-100 rounded-full leading-5 bg-white placeholder-rose-200 focus:outline-none focus:border-[#ec4899] focus:ring-1 focus:ring-[#ec4899] text-gray-600 shadow-sm"
              />
          </div>

          {/* Progress Bar (Below Search as requested) */}
          <div className="w-full h-3 bg-pink-100 rounded-full overflow-hidden mb-4">
              <div 
                  className="h-full bg-gradient-to-r from-[#f472b6] to-[#ec4899] transition-all duration-1000 ease-out rounded-full"
                  style={{ width: `${progress}%` }}
              />
          </div>
          
          {/* Navigation Grid - 4 Columns Fixed */}
          <div className="grid grid-cols-4 gap-2">
            <TabButton 
                active={filter === 'all'} 
                onClick={() => setFilter('all')} 
                label="全部"
                icon={null}
            />
            <TabButton 
                active={filter === 'todo'} 
                onClick={() => setFilter('todo')} 
                label="待完成"
                icon={null}
            />
            <TabButton 
                active={filter === 'completed'} 
                onClick={() => setFilter('completed')} 
                label="已完成"
                icon={null}
            />
            <button 
                onClick={() => setFilter('map')}
                className={`
                    flex flex-col items-center justify-center py-2 rounded-xl text-sm font-bold transition-all shadow-sm
                    ${filter === 'map'
                        ? "bg-[#ec4899] text-white shadow-md transform scale-105" 
                        : "bg-white text-gray-500 border border-gray-100 hover:bg-gray-50"}
                `}
            >
                <MapIcon size={18} className="mb-0.5" />
                <span>恋爱足迹</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-4 animate-in slide-in-from-bottom-4 duration-500">
        
        {filter === 'map' ? (
            <LoveMapSection tasks={tasks} />
        ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => setSelectedTask(task)}
                />
              ))}
            </div>
        )}
        
        {filteredTasks.length === 0 && filter !== 'map' && (
            <div className="text-center py-20 text-rose-300">
                <div className="text-6xl mb-4">🍂</div>
                <p className="text-2xl">这里空空如也~</p>
            </div>
        )}
      </main>

      {/* Scroll To Top */}
      <div className={`fixed bottom-6 right-6 transition-all duration-500 transform ${showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
          <button 
            onClick={scrollToTop}
            className="w-12 h-12 bg-white/90 backdrop-blur border border-rose-200 rounded-full shadow-lg flex items-center justify-center text-[#ec4899] hover:bg-[#ec4899] hover:text-white transition-colors"
          >
              <ArrowUp size={24} />
          </button>
      </div>

      {/* Modals */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleUpdateTask}
        />
      )}

      {showSettings && (
          <SettingsModal 
            onClose={() => setShowSettings(false)}
            onReset={handleFullReset}
            stats={{
                completed: tasks.filter(t => t.completed).length,
                photos: tasks.filter(t => t.hasPhoto).length
            }}
          />
      )}
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);

// Interfaces and Types
interface TaskData {
  id: number;
  title: string;
  completed: boolean;
  hasPhoto?: boolean;
  customTitle?: string;
  date?: string;
  note?: string;
  location?: {
    country?: string;
    province?: string;
    city?: string;
  };
}
