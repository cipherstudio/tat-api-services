/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const data = [
    {
      name: 'ค่าใช้จ่ายในการเดินทางไปปฏิบัติงาน',
      form: [
        { name: 'ชั่วคราวในประเทศ' },
        { name: 'ประจำในประเทศ' },
        { name: 'ในต่างประเทศชั่วคราว' },
        { name: 'ประจำในต่างประเทศ' },
      ],
    },
    {
      name: 'ค่าใช้จ่ายในการฝึกอบรม',
      form: [
        { name: 'ค่าใช้จ่ายเดินทางของผู้เข้ารับการฝึกอบรมในประเทศ' },
        { name: 'ค่าลงทะเบียนฝึกอบรม' },
      ],
    },
    {
      name: 'ค่าใช้จ่ายในการบริหารงาน',
      form: [
        { name: 'ค่าเบี้ยประชุม' },
        { name: 'ค่าเบี้ยประชุม กรณีเป็นการประชุมผ่านสื่ออิเล็กกรอนิกส์' },
        { name: 'ค่าตอบแทบรายเดือนคณะกรรมการ ทททท.' },
        { name: 'ค่าตอบแทนรายเดือนคณะกรรมการตรวจสอบ ทกท.' },
      ],
    },
    {
      name: 'ค่าการศึกษาของบุตร',
      form: [{ name: 'ค่าการศึกษาของบุตร' }],
    },
    {
      name: 'ค่ารักษาพยาบาล',
      form: [
        { name: 'ค่ารักษาพยาบาลผู้ป่วยนอก สถานพยาบาลของทางราชการ' },
        { name: 'ค่ารักษาพยาบาลผู้ป่วยนอก สถานพยาบาลของเอกชน' },
        { name: 'ค่ารักษาพยาบาลผู้ป่วยนอก กรณีเบิกจ่ายตรง' },
        { name: 'ค่ารักษาพยาบาลผู้ป่วยใน ไม่มีหนังสือส่งตัว (ราชการ)' },
        { name: 'ค่ารักษาพยาบาลผู้ป่วยใน มีหนังสือส่งตัว (ราชการ)' },
        { name: 'ค่ารักษาพยาบาลผู้ป่วยใน ไม่มีหนังสือส่งตัว (เอกชน)' },
        { name: 'ค่ารักษาพยาบาลผู้ป่วยใน มีหนังสือส่งตัว (เอกชน)' },
      ],
    },
    {
      name: 'การพัสดุ',
      form: [
        { name: 'การจัดซื้อ/การจัดจ้าง/การเช่า' },
        { name: 'ค่าจ้างรายเดือน' },
        {
          name: 'ค่าจ้างวันหยุดหรือค่าปฏิบัติงานหลังเวลากำการปกติ ณ ที่ทำการ (ภารกิจโครงการเดิม)',
        },
        {
          name: 'ค่าจ้างวันหยุดหรือค่าปฏิบัติงานหลังเวลาทำการปกติ ณ ที่ทำการ (ภารกิจไม่ใช่โครงการเดิม)',
        },
        {
          name: 'ค่าจ้างวันหยุดนอกที่ตั้ง (ในเขต กทม. หรือจังหวัดที่เป็นที่ตั้งสำนักงานสาขา)',
        },
        {
          name: 'ค่าจ้างวันหยุดนอกที่ตั้ง ต่างจังหวัด (ไม่ใช่ในเขต กกม. หรือจังหวัดที่เป็นที่ตั้งสำนักงานสาขา)',
        },
      ],
    },
    {
      name: 'เงินสนับสนุน',
      form: [{ name: 'เงินสนับสนุน' }],
    },
  ];

  // Insert document types
  for (const type of data) {
    const [typeId] = await knex(
      'disbursement_supporting_document_types',
    ).insert({ name: type.name }, ['id']);
    for (const form of type.form) {
      await knex('disbursement_supporting_forms').insert({
        name: form.name,
        document_type_id: typeId.id,
      });
    }
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  // ลบเฉพาะข้อมูลที่ seed ไป (โดยใช้ชื่อ type)
  const typeNames = [
    'ค่าใช้จ่ายในการเดินทางไปปฏิบัติงาน',
    'ค่าใช้จ่ายในการฝึกอบรม',
    'ค่าใช้จ่ายในการบริหารงาน',
    'ค่าการศึกษาของบุตร',
    'ค่ารักษาพยาบาล',
    'การพัสดุ',
    'เงินสนับสนุน',
  ];
  // หา id ของ type ที่ seed ไป
  const types = await knex('disbursement_supporting_document_types')
    .whereIn('name', typeNames)
    .select('id');
  const typeIds = types.map((t) => t.id);
  // ลบ forms ที่เกี่ยวข้อง
  await knex('disbursement_supporting_forms')
    .whereIn('document_type_id', typeIds)
    .del();
  // ลบ types
  await knex('disbursement_supporting_document_types')
    .whereIn('id', typeIds)
    .del();
};
