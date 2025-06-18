// อ้างอิงข้อมูลประเทศจาก countries.js 
const countries = require('./countries');

// สร้าง mapping function เพื่อหา country id จากชื่อไทย
const findCountryIdByNameTh = (nameTh) => {
  const country = countries.find(c => c.name_th === nameTh);
  return country ? country.id : null;
};

// ประเทศกลุ่ม TEMP_EXEMPTED (ไม่มีสิทธิ์เบิกสำหรับชั่วคราว)
const tempExemptedCountries = [
  'พม่า', // MYANMAR
  'บรูไน', // BRUNEI DARUSSALAM  
  'อินโดนีเซีย', // INDONESIA
  'กัมพูชา', // CAMBODIA
  'ลาว', // LAO PDR
  'มาเลเซีย', // MALAYSIA
  'ฟิลิปปินส์', // PHILIPPINES
  'สิงคโปร์', // SINGAPORE
  'ศรีลังกา', // SRI LANKA
  'เวียดนาม', // VIETNAM
  'ฟีจี', // FIJI
  'ปาปัวนิวกินี', // PAPUA NEW GUINEA
  'ซามัว', // SAMOA
  'ติมอร์-เลสเต' // TIMOR-LESTE
];

// ประเทศกลุ่ม PERM_B (ประเภท ข สำหรับประจำ)
const permBCountries = [
  'เวียดนาม', // VIETNAM
  'ลาว', // LAO PDR
  'กัมพูชา', // CAMBODIA
  'พม่า', // MYANMAR
  'มาเลเซีย', // MALAYSIA
  'ศรีลังกา', // SRI LANKA
  'อินโดนีเซีย', // INDONESIA
  'ฟิลิปปินส์', // PHILIPPINES
  'สิงคโปร์', // SINGAPORE
  'บรูไน' // BRUNEI DARUSSALAM
];

const attire_destination_group_countries = [];

tempExemptedCountries.forEach(countryNameTh => {
  const countryId = findCountryIdByNameTh(countryNameTh);
  if (countryId) {
    attire_destination_group_countries.push({
      group_code: 'TEMP_EXEMPTED',
      country_id: countryId,
      country_name_th: countryNameTh
    });
  } else {
    console.warn(`ไม่พบประเทศ: ${countryNameTh} ในฐานข้อมูล countries`);
  }
});

permBCountries.forEach(countryNameTh => {
  const countryId = findCountryIdByNameTh(countryNameTh);
  if (countryId) {
    attire_destination_group_countries.push({
      group_code: 'PERM_B',
      country_id: countryId,
      country_name_th: countryNameTh
    });
  } else {
    console.warn(`ไม่พบประเทศ: ${countryNameTh} ในฐานข้อมูล countries`);
  }
});

module.exports = attire_destination_group_countries;