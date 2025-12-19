const officeDomestic = [
    { id: 1, name: 'ททท. สำนักงานใหญ่', region: 'ภาคกลาง', is_head_office: true, province_id: 1 },
  
    // Northern Region
    { id: 2, name: 'ททท. สำนักงานเชียงใหม่', region: 'ภาคเหนือ', is_head_office: false, province_id: 38 },
    { id: 3, name: 'ททท. สำนักงานเชียงราย', region: 'ภาคเหนือ', is_head_office: false, province_id: 45 },
    { id: 4, name: 'ททท. สำนักงานแม่ฮ่องสอน', region: 'ภาคเหนือ', is_head_office: false, province_id: 46 },
    { id: 5, name: 'ททท. สำนักงานพิษณุโลก', region: 'ภาคเหนือ', is_head_office: false, province_id: 52 },
    { id: 6, name: 'ททท. สำนักงานลำปาง', region: 'ภาคเหนือ', is_head_office: false, province_id: 40 },
    { id: 7, name: 'ททท. สำนักงานตาก', region: 'ภาคเหนือ', is_head_office: false, province_id: 50 },
    { id: 8, name: 'ททท. สำนักงานสุโขทัย', region: 'ภาคเหนือ', is_head_office: false, province_id: 51 },
    { id: 32, name: 'ททท. สำนักงานแพร่', region: 'ภาคเหนือ', is_head_office: false, province_id: 42 },
    { id: 33, name: 'ททท. สำนักงานน่าน', region: 'ภาคเหนือ', is_head_office: false, province_id: 43 },
    { id: 34, name: 'ททท. สำนักงานอุทัยธานี', region: 'ภาคเหนือ', is_head_office: false, province_id: 48 },
    { id: 35, name: 'ททท. สำนักงานนครสวรรค์', region: 'ภาคเหนือ', is_head_office: false, province_id: 47 },
    
    // Central Region
    { id: 9, name: 'ททท. สำนักงานพระนครศรีอยุธยา', region: 'ภาคกลาง', is_head_office: false, province_id: 5 },
    { id: 10, name: 'ททท. สำนักงานลพบุรี', region: 'ภาคกลาง', is_head_office: false, province_id: 7 },
    { id: 11, name: 'ททท. สำนักงานกาญจนบุรี', region: 'ภาคกลาง', is_head_office: false, province_id: 56 },
    { id: 12, name: 'ททท. สำนักงานราชบุรี', region: 'ภาคกลาง', is_head_office: false, province_id: 55 },
    { id: 13, name: 'ททท. สำนักงานเพชรบุรี', region: 'ภาคกลาง', is_head_office: false, province_id: 61 },
    { id: 14, name: 'ททท. สำนักงานประจวบคีรีขันธ์', region: 'ภาคกลาง', is_head_office: false, province_id: 62 },
    { id: 36, name: 'ททท. สำนักงานสุพรรณบุรี', region: 'ภาคกลาง', is_head_office: false, province_id: 57 },
    { id: 37, name: 'ททท. สำนักงานกรุงเทพมหานคร', region: 'ภาคกลาง', is_head_office: false, province_id: 1 },
    { id: 38, name: 'ททท. สำนักงานสมุทรสงคราม', region: 'ภาคกลาง', is_head_office: false, province_id: 60 },
    
    // Northeastern Region
    { id: 15, name: 'ททท. สำนักงานนครราชสีมา', region: 'ภาคตะวันออกเฉียงเหนือ', is_head_office: false, province_id: 19 },
    { id: 16, name: 'ททท. สำนักงานขอนแก่น', region: 'ภาคตะวันออกเฉียงเหนือ', is_head_office: false, province_id: 28 },
    { id: 17, name: 'ททท. สำนักงานอุบลราชธานี', region: 'ภาคตะวันออกเฉียงเหนือ', is_head_office: false, province_id: 23 },
    { id: 18, name: 'ททท. สำนักงานอุดรธานี', region: 'ภาคตะวันออกเฉียงเหนือ', is_head_office: false, province_id: 29 },
    { id: 19, name: 'ททท. สำนักงานหนองคาย', region: 'ภาคตะวันออกเฉียงเหนือ', is_head_office: false, province_id: 31 },
    { id: 20, name: 'ททท. สำนักงานเลย', region: 'ภาคตะวันออกเฉียงเหนือ', is_head_office: false, province_id: 30 },
    { id: 39, name: 'ททท. สำนักงานนครพนม', region: 'ภาคตะวันออกเฉียงเหนือ', is_head_office: false, province_id: 36 },
    { id: 40, name: 'ททท. สำนักงานสุรินทร์', region: 'ภาคตะวันออกเฉียงเหนือ', is_head_office: false, province_id: 21 },
    { id: 41, name: 'ททท. สำนักงานบุรีรัมย์', region: 'ภาคตะวันออกเฉียงเหนือ', is_head_office: false, province_id: 20 },
    
    // Eastern Region
    { id: 21, name: 'ททท. สำนักงานพัทยา', region: 'ภาคตะวันออก', is_head_office: false, province_id: 11 },
    { id: 22, name: 'ททท. สำนักงานชลบุรี', region: 'ภาคตะวันออก', is_head_office: false, province_id: 11 },
    { id: 23, name: 'ททท. สำนักงานจันทบุรี', region: 'ภาคตะวันออก', is_head_office: false, province_id: 13 },
    { id: 24, name: 'ททท. สำนักงานตราด', region: 'ภาคตะวันออก', is_head_office: false, province_id: 14 },
    { id: 42, name: 'ททท. สำนักงานระยอง', region: 'ภาคตะวันออก', is_head_office: false, province_id: 12 },
    { id: 43, name: 'ททท. สำนักงานฉะเชิงเทรา', region: 'ภาคตะวันออก', is_head_office: false, province_id: 15 },
    { id: 44, name: 'ททท. สำนักงานนครนายก', region: 'ภาคตะวันออก', is_head_office: false, province_id: 17 },
    
    // Southern Region
    { id: 25, name: 'ททท. สำนักงานภูเก็ต', region: 'ภาคใต้', is_head_office: false, province_id: 66 },
    { id: 26, name: 'ททท. สำนักงานสุราษฎร์ธานี', region: 'ภาคใต้', is_head_office: false, province_id: 67 },
    { id: 27, name: 'ททท. สำนักงานนครศรีธรรมราช', region: 'ภาคใต้', is_head_office: false, province_id: 63 },
    { id: 28, name: 'ททท. สำนักงานหาดใหญ่', region: 'ภาคใต้', is_head_office: false, province_id: 70 },
    { id: 29, name: 'ททท. สำนักงานกระบี่', region: 'ภาคใต้', is_head_office: false, province_id: 64 },
    { id: 30, name: 'ททท. สำนักงานพังงา', region: 'ภาคใต้', is_head_office: false, province_id: 65 },
    { id: 31, name: 'ททท. สำนักงานตรัง', region: 'ภาคใต้', is_head_office: false, province_id: 72 },
    { id: 45, name: 'ททท. สำนักงานนราธิวาส', region: 'ภาคใต้', is_head_office: false, province_id: 76 },
    { id: 46, name: 'ททท. สำนักงานชุมพร', region: 'ภาคใต้', is_head_office: false, province_id: 69 },
    { id: 47, name: 'ททท. สำนักงานเกาะสมุย', region: 'ภาคใต้', is_head_office: false, province_id: 67 },
    { id: 48, name: 'ททท. สำนักงานสตูล', region: 'ภาคใต้', is_head_office: false, province_id: 71 },
]

module.exports = officeDomestic;
