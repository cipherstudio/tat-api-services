const provinces = [
    {
        "id": 1,
        "name_th": "กรุงเทพมหานคร",
        "name_en": "Bangkok",
        "is_perimeter": false
      },
      {
        "id": 2,
        "name_th": "สมุทรปราการ",
        "name_en": "Samut Prakan",
        "is_perimeter": true
      },
      {
        "id": 3,
        "name_th": "นนทบุรี",
        "name_en": "Nonthaburi",
        "is_perimeter": true
      },
      {
        "id": 4,
        "name_th": "ปทุมธานี",
        "name_en": "Pathum Thani",
        "is_perimeter": true
      },
      {
        "id": 5,
        "name_th": "พระนครศรีอยุธยา",
        "name_en": "Phra Nakhon Si Ayutthaya",
        "is_perimeter": false
      },
      {
        "id": 6,
        "name_th": "อ่างทอง",
        "name_en": "Ang Thong",
        "is_perimeter": false
      },
      {
        "id": 7,
        "name_th": "ลพบุรี",
        "name_en": "Loburi",
        "is_perimeter": false
      },
      {
        "id": 8,
        "name_th": "สิงห์บุรี",
        "name_en": "Sing Buri",
        "is_perimeter": false
      },
      {
        "id": 9,
        "name_th": "ชัยนาท",
        "name_en": "Chai Nat",
        "is_perimeter": false
      },
      {
        "id": 10,
        "name_th": "สระบุรี",
        "name_en": "Saraburi",
        "is_perimeter": false
      },
      {
        "id": 11,
        "name_th": "ชลบุรี",
        "name_en": "Chon Buri",
        "is_perimeter": false
      },
      {
        "id": 12,
        "name_th": "ระยอง",
        "name_en": "Rayong",
        "is_perimeter": false
      },
      {
        "id": 13,
        "name_th": "จันทบุรี",
        "name_en": "Chanthaburi",
        "is_perimeter": false
      },
      {
        "id": 14,
        "name_th": "ตราด",
        "name_en": "Trat",
        "is_perimeter": false
      },
      {
        "id": 15,
        "name_th": "ฉะเชิงเทรา",
        "name_en": "Chachoengsao",
        "is_perimeter": false
      },
      {
        "id": 16,
        "name_th": "ปราจีนบุรี",
        "name_en": "Prachin Buri",
        "is_perimeter": false
      },
      {
        "id": 17,
        "name_th": "นครนายก",
        "name_en": "Nakhon Nayok",
        "is_perimeter": false
      },
      {
        "id": 18,
        "name_th": "สระแก้ว",
        "name_en": "Sa Kaeo",
        "is_perimeter": false
      },
      {
        "id": 19,
        "name_th": "นครราชสีมา",
        "name_en": "Nakhon Ratchasima",
        "is_perimeter": false
      },
      {
        "id": 20,
        "name_th": "บุรีรัมย์",
        "name_en": "Buri Ram",
        "is_perimeter": false
      },
      {
        "id": 21,
        "name_th": "สุรินทร์",
        "name_en": "Surin",
        "is_perimeter": false
      },
      {
        "id": 22,
        "name_th": "ศรีสะเกษ",
        "name_en": "Si Sa Ket",
        "is_perimeter": false
      },
      {
        "id": 23,
        "name_th": "อุบลราชธานี",
        "name_en": "Ubon Ratchathani",
        "is_perimeter": false
      },
      {
        "id": 24,
        "name_th": "ยโสธร",
        "name_en": "Yasothon",
        "is_perimeter": false
      },
      {
        "id": 25,
        "name_th": "ชัยภูมิ",
        "name_en": "Chaiyaphum",
        "is_perimeter": false
      },
      {
        "id": 26,
        "name_th": "อำนาจเจริญ",
        "name_en": "Amnat Charoen",
        "is_perimeter": false
      },
      {
        "id": 27,
        "name_th": "หนองบัวลำภู",
        "name_en": "Nong Bua Lam Phu",
        "is_perimeter": false
      },
      {
        "id": 28,
        "name_th": "ขอนแก่น",
        "name_en": "Khon Kaen",
        "is_perimeter": false
      },
      {
        "id": 29,
        "name_th": "อุดรธานี",
        "name_en": "Udon Thani",
        "is_perimeter": false
      },
      {
        "id": 30,
        "name_th": "เลย",
        "name_en": "Loei",
        "is_perimeter": false
      },
      {
        "id": 31,
        "name_th": "หนองคาย",
        "name_en": "Nong Khai",
        "is_perimeter": false
      },
      {
        "id": 32,
        "name_th": "มหาสารคาม",
        "name_en": "Maha Sarakham",
        "is_perimeter": false
      },
      {
        "id": 33,
        "name_th": "ร้อยเอ็ด",
        "name_en": "Roi Et",
        "is_perimeter": false
      },
      {
        "id": 34,
        "name_th": "กาฬสินธุ์",
        "name_en": "Kalasin",
        "is_perimeter": false
      },
      {
        "id": 35,
        "name_th": "สกลนคร",
        "name_en": "Sakon Nakhon",
        "is_perimeter": false
      },
      {
        "id": 36,
        "name_th": "นครพนม",
        "name_en": "Nakhon Phanom",
        "is_perimeter": false
      },
      {
        "id": 37,
        "name_th": "มุกดาหาร",
        "name_en": "Mukdahan",
        "is_perimeter": false
      },
      {
        "id": 38,
        "name_th": "เชียงใหม่",
        "name_en": "Chiang Mai",
        "is_perimeter": false
      },
      {
        "id": 39,
        "name_th": "ลำพูน",
        "name_en": "Lamphun",
        "is_perimeter": false
      },
      {
        "id": 40,
        "name_th": "ลำปาง",
        "name_en": "Lampang",
        "is_perimeter": false
      },
      {
        "id": 41,
        "name_th": "อุตรดิตถ์",
        "name_en": "Uttaradit",
        "is_perimeter": false
      },
      {
        "id": 42,
        "name_th": "แพร่",
        "name_en": "Phrae",
        "is_perimeter": false
      },
      {
        "id": 43,
        "name_th": "น่าน",
        "name_en": "Nan",
        "is_perimeter": false
      },
      {
        "id": 44,
        "name_th": "พะเยา",
        "name_en": "Phayao",
        "is_perimeter": false
      },
      {
        "id": 45,
        "name_th": "เชียงราย",
        "name_en": "Chiang Rai",
        "is_perimeter": false
      },
      {
        "id": 46,
        "name_th": "แม่ฮ่องสอน",
        "name_en": "Mae Hong Son",
        "is_perimeter": false
      },
      {
        "id": 47,
        "name_th": "นครสวรรค์",
        "name_en": "Nakhon Sawan",
        "is_perimeter": false
      },
      {
        "id": 48,
        "name_th": "อุทัยธานี",
        "name_en": "Uthai Thani",
        "is_perimeter": false
      },
      {
        "id": 49,
        "name_th": "กำแพงเพชร",
        "name_en": "Kamphaeng Phet",
        "is_perimeter": false
      },
      {
        "id": 50,
        "name_th": "ตาก",
        "name_en": "Tak",
        "is_perimeter": false
      },
      {
        "id": 51,
        "name_th": "สุโขทัย",
        "name_en": "Sukhothai",
        "is_perimeter": false
      },
      {
        "id": 52,
        "name_th": "พิษณุโลก",
        "name_en": "Phitsanulok",
        "is_perimeter": false
      },
      {
        "id": 53,
        "name_th": "พิจิตร",
        "name_en": "Phichit",
        "is_perimeter": false
      },
      {
        "id": 54,
        "name_th": "เพชรบูรณ์",
        "name_en": "Phetchabun",
        "is_perimeter": false
      },
      {
        "id": 55,
        "name_th": "ราชบุรี",
        "name_en": "Ratchaburi",
        "is_perimeter": false
      },
      {
        "id": 56,
        "name_th": "กาญจนบุรี",
        "name_en": "Kanchanaburi",
        "is_perimeter": false
      },
      {
        "id": 57,
        "name_th": "สุพรรณบุรี",
        "name_en": "Suphan Buri",
        "is_perimeter": false
      },
      {
        "id": 58,
        "name_th": "นครปฐม",
        "name_en": "Nakhon Pathom",
        "is_perimeter": true
      },
      {
        "id": 59,
        "name_th": "สมุทรสาคร",
        "name_en": "Samut Sakhon",
        "is_perimeter": true
      },
      {
        "id": 60,
        "name_th": "สมุทรสงคราม",
        "name_en": "Samut Songkhram",
        "is_perimeter": false
      },
      {
        "id": 61,
        "name_th": "เพชรบุรี",
        "name_en": "Phetchaburi",
        "is_perimeter": false
      },
      {
        "id": 62,
        "name_th": "ประจวบคีรีขันธ์",
        "name_en": "Prachuap Khiri Khan",
        "is_perimeter": false
      },
      {
        "id": 63,
        "name_th": "นครศรีธรรมราช",
        "name_en": "Nakhon Si Thammarat",
        "is_perimeter": false
      },
      {
        "id": 64,
        "name_th": "กระบี่",
        "name_en": "Krabi",
        "is_perimeter": false
      },
      {
        "id": 65,
        "name_th": "พังงา",
        "name_en": "Phangnga",
        "is_perimeter": false
      },
      {
        "id": 66,
        "name_th": "ภูเก็ต",
        "name_en": "Phuket",
        "is_perimeter": false
      },
      {
        "id": 67,
        "name_th": "สุราษฎร์ธานี",
        "name_en": "Surat Thani",
        "is_perimeter": false
      },
      {
        "id": 68,
        "name_th": "ระนอง",
        "name_en": "Ranong",
        "is_perimeter": false
      },
      {
        "id": 69,
        "name_th": "ชุมพร",
        "name_en": "Chumphon",
        "is_perimeter": false
      },
      {
        "id": 70,
        "name_th": "สงขลา",
        "name_en": "Songkhla",
        "is_perimeter": false
      },
      {
        "id": 71,
        "name_th": "สตูล",
        "name_en": "Satun",
        "is_perimeter": false
      },
      {
        "id": 72,
        "name_th": "ตรัง",
        "name_en": "Trang",
        "is_perimeter": false
      },
      {
        "id": 73,
        "name_th": "พัทลุง",
        "name_en": "Phatthalung",
        "is_perimeter": false
      },
      {
        "id": 74,
        "name_th": "ปัตตานี",
        "name_en": "Pattani",
        "is_perimeter": false
      },
      {
        "id": 75,
        "name_th": "ยะลา",
        "name_en": "Yala",
        "is_perimeter": false
      },
      {
        "id": 76,
        "name_th": "นราธิวาส",
        "name_en": "Narathiwat",
        "is_perimeter": false
      },
      {
        "id": 77,
        "name_th": "บึงกาฬ",
        "name_en": "buogkan",
        "is_perimeter": false
      }
];

module.exports = provinces;