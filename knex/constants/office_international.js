const officeInternational = [
  // -------------------- อาเซียน เอเชียใต้ และแปซิฟิกใต้ --------------------
  { id: 1, name: 'สำนักงานกัวลาลัมเปอร์', region: 'อาเซียน เอเชียใต้ และแปซิฟิกใต้', country_id: 158, currency_id: 2, pog_code: '720300' },
  { id: 2, name: 'สำนักงานจาการ์ตา', region: 'อาเซียน เอเชียใต้ และแปซิฟิกใต้', country_id: 101, currency_id: 2, pog_code: '720800' },
  { id: 4, name: 'สำนักงานนิวเดลี', region: 'อาเซียน เอเชียใต้ และแปซิฟิกใต้', country_id: 105, currency_id: 2, pog_code: '720500' },
  { id: 5, name: 'สำนักงานมุมไบ', region: 'อาเซียน เอเชียใต้ และแปซิฟิกใต้', country_id: 105, currency_id: 2, pog_code: '720700' },
  { id: 3, name: 'สำนักงานสิงคโปร์', region: 'อาเซียน เอเชียใต้ และแปซิฟิกใต้', country_id: 198, currency_id: 3, pog_code: '720400' },
  { id: 6, name: 'สำนักงานโฮจิมินห์', region: 'อาเซียน เอเชียใต้ และแปซิฟิกใต้', country_id: 241, currency_id: 2, pog_code: '720600' },
  { id: 30, name: 'สำนักงานซิดนีย์', region: 'อาเซียน เอเชียใต้ และแปซิฟิกใต้', country_id: 13, currency_id: 7, pog_code: '720200' },

  // -------------------- เอเชียตะวันออก --------------------
  { id: 10, name: 'สำนักงานปักกิ่ง', region: 'เอเชียตะวันออก', country_id: 48, currency_id: 2, pog_code: '710700' },
  { id: 9, name: 'สำนักงานเซี่ยงไฮ้', region: 'เอเชียตะวันออก', country_id: 48, currency_id: 2, pog_code: '710800' },
  { id: 12, name: 'สำนักงานเฉิงตู', region: 'เอเชียตะวันออก', country_id: 48, currency_id: 2, pog_code: '711000' },
  { id: 11, name: 'สำนักงานคุนหมิง', region: 'เอเชียตะวันออก', country_id: 48, currency_id: 2, pog_code: '710900' },
  { id: 13, name: 'สำนักงานกวางโจ', region: 'เอเชียตะวันออก', country_id: 48, currency_id: 2, pog_code: '711100' },
  { id: 8, name: 'สำนักงานไทเป', region: 'เอเชียตะวันออก', country_id: 228, currency_id: 2, pog_code: '710400' },
  { id: 7, name: 'สำนักงานฮ่องกง', region: 'เอเชียตะวันออก', country_id: 95, currency_id: 4, pog_code: '710600' },
  { id: 14, name: 'สำนักงานโตเกียว', region: 'เอเชียตะวันออก', country_id: 114, currency_id: 8, pog_code: '710200' },
  { id: 15, name: 'สำนักงานโอซากา', region: 'เอเชียตะวันออก', country_id: 114, currency_id: 8, pog_code: '710300' },
  { id: 16, name: 'สำนักงานฟุกุโอกะ', region: 'เอเชียตะวันออก', country_id: 114, currency_id: 8, pog_code: '711200' },
  { id: 17, name: 'สำนักงานโซล', region: 'เอเชียตะวันออก', country_id: 122, currency_id: 2, pog_code: '710500' },

  // -------------------- อเมริกา --------------------
  { id: 21, name: 'สำนักงานชิคาโก', region: 'อเมริกา', country_id: 233, currency_id: 2, pog_code: '820500' },
  { id: 20, name: 'สำนักงานลอสแอนเจลิส', region: 'อเมริกา', country_id: 233, currency_id: 2, pog_code: '820300' },
  { id: 19, name: 'สำนักงานนิวยอร์ก', region: 'อเมริกา', country_id: 233, currency_id: 2, pog_code: '820200' },
  { id: 29, name: 'สำนักงานโทรอนโต', region: 'อเมริกา', country_id: 38, currency_id: 12, pog_code: '' },

  // -------------------- ยุโรป แอฟริกา และตะวันออกกลาง --------------------
  { id: 28, name: 'สำนักงานกรุงปราก', region: 'ยุโรป แอฟริกา และตะวันออกกลาง', country_id: 56, currency_id: 10, pog_code: '810900' },
  { id: 25, name: 'สำนักงานกรุงโรม', region: 'ยุโรป แอฟริกา และตะวันออกกลาง', country_id: 110, currency_id: 10, pog_code: '810500' },
  { id: 18, name: 'สำนักงานดูไบ', region: 'ยุโรป แอฟริกา และตะวันออกกลาง', country_id: 2, currency_id: 2, pog_code: '820600' },
  { id: 23, name: 'สำนักงานแฟรงก์เฟิร์ต', region: 'ยุโรป แอฟริกา และตะวันออกกลาง', country_id: 57, currency_id: 10, pog_code: '810300' },
  { id: 22, name: 'สำนักงานลอนดอน', region: 'ยุโรป แอฟริกา และตะวันออกกลาง', country_id: 77, currency_id: 5, pog_code: '810200' },
  { id: 24, name: 'สำนักงานปารีส', region: 'ยุโรป แอฟริกา และตะวันออกกลาง', country_id: 75, currency_id: 10, pog_code: '810400' },
  { id: 26, name: 'สำนักงานสตอกโฮล์ม', region: 'ยุโรป แอฟริกา และตะวันออกกลาง', country_id: 197, currency_id: 6, pog_code: '810600' },
  { id: 27, name: 'สำนักงานมอสโก', region: 'ยุโรป แอฟริกา และตะวันออกกลาง', country_id: 191, currency_id: 2, pog_code: '810700' },
];

module.exports = officeInternational;
