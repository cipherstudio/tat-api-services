import * as fs from 'fs';
import * as path from 'path';

// Thai descriptions for common column patterns
const thaiColumnDescriptions: { [key: string]: string } = {
  // Common ID fields
  ID: 'รหัส',
  _ID: 'รหัส',
  CODE: 'รหัส',
  _CODE: 'รหัส',

  // Common name fields
  NAME: 'ชื่อ',
  _NAME: 'ชื่อ',
  DESC: 'คำอธิบาย',
  _DESC: 'คำอธิบาย',
  DESCRIPTION: 'คำอธิบาย',
  _DESCRIPTION: 'คำอธิบาย',

  // Date fields
  DATE: 'วันที่',
  _DATE: 'วันที่',
  CREATED_DATE: 'วันที่สร้าง',
  UPDATED_DATE: 'วันที่อัปเดต',
  LAST_UPDATE_DATE: 'วันที่อัปเดตล่าสุด',
  START_DATE: 'วันที่เริ่มต้น',
  END_DATE: 'วันที่สิ้นสุด',
  BIRTH_DATE: 'วันเกิด',
  HOLIDAY_DATE: 'วันหยุด',

  // Status fields
  STATUS: 'สถานะ',
  _STATUS: 'สถานะ',
  FLAG: 'ธง',
  _FLAG: 'ธง',
  ACTIVE: 'ใช้งาน',
  INACTIVE: 'ไม่ใช้งาน',

  // User fields
  USER: 'ผู้ใช้',
  _USER: 'ผู้ใช้',
  CREATED_BY: 'ผู้สร้าง',
  UPDATED_BY: 'ผู้อัปเดต',
  LAST_UPDATE_BY: 'ผู้อัปเดตล่าสุด',

  // Common business fields
  AMOUNT: 'จำนวนเงิน',
  PRICE: 'ราคา',
  COST: 'ต้นทุน',
  SALARY: 'เงินเดือน',
  BUDGET: 'งบประมาณ',
  EXPENSE: 'ค่าใช้จ่าย',
  INCOME: 'รายได้',

  // Address fields
  ADDRESS: 'ที่อยู่',
  PROVINCE: 'จังหวัด',
  CITY: 'เมือง',
  DISTRICT: 'อำเภอ',
  POSTCODE: 'รหัสไปรษณีย์',
  COUNTRY: 'ประเทศ',

  // Contact fields
  EMAIL: 'อีเมล',
  PHONE: 'เบอร์โทรศัพท์',
  MOBILE: 'เบอร์มือถือ',
  FAX: 'แฟกซ์',

  // Organization fields
  DEPARTMENT: 'แผนก',
  DIVISION: 'กอง',
  SECTION: 'ฝ่าย',
  UNIT: 'หน่วยงาน',
  POSITION: 'ตำแหน่ง',
  WORKINGGROUP: 'กลุ่มงาน',

  // Priority and order
  PRIORITY: 'ลำดับความสำคัญ',
  ORDER: 'ลำดับ',
  SEQUENCE: 'ลำดับ',
  SORT: 'การเรียงลำดับ',

  // Remarks and notes
  REMARK: 'หมายเหตุ',
  NOTE: 'บันทึก',
  COMMENT: 'ความคิดเห็น',
  DETAIL: 'รายละเอียด',

  // Type and category
  TYPE: 'ประเภท',
  _TYPE: 'ประเภท',
  CATEGORY: 'หมวดหมู่',
  GROUP: 'กลุ่ม',

  // Count and quantity
  COUNT: 'จำนวน',
  QUANTITY: 'ปริมาณ',
  NUMBER: 'หมายเลข',

  // Time fields
  TIME: 'เวลา',
  DURATION: 'ระยะเวลา',
  PERIOD: 'ช่วงเวลา',

  // Approval fields
  APPROVED: 'อนุมัติ',
  APPROVAL: 'การอนุมัติ',
  REJECTED: 'ปฏิเสธ',
  PENDING: 'รอดำเนินการ',

  // Financial fields
  BANK_ACCOUNT: 'บัญชีธนาคาร',
  TAX_ID: 'เลขประจำตัวผู้เสียภาษี',
  CARD_ID: 'เลขบัตรประชาชน',

  // Personal fields
  SEX: 'เพศ',
  FATHER: 'บิดา',
  MOTHER: 'มารดา',
  SPOUSE: 'คู่สมรส',
  MARRIED: 'สถานะการสมรส',

  // Holiday and leave
  HOLIDAY: 'วันหยุด',
  LEAVE: 'การลา',
  VACATION: 'วันหยุดพักผ่อน',

  // Deputy and replacement
  DEPUTY: 'ผู้แทน',
  REPLACEMENT: 'การแทนที่',
  SUBSTITUTE: 'ตัวแทน',

  // Position and organization
  POG: 'ตำแหน่งองค์กร',
  PMT: 'ตำแหน่ง',
  EX_POSITION: 'ตำแหน่งพิเศษ',
  LEVEL_POSITION: 'ระดับตำแหน่ง',

  // Khate (เขต)
  KHATE: 'เขต',
  KHATE_CODE: 'รหัสเขต',

  // APA PPN
  APA_PPN_NUMBER: 'หมายเลข APA PPN',

  // Position extension
  POSITION_EX: 'ตำแหน่งเพิ่มเติม',

  // Start and end
  START: 'เริ่มต้น',
  END: 'สิ้นสุด',

  // Create and update
  CREATED: 'สร้าง',
  UPDATED: 'อัปเดต',
  LAST_UPDATE: 'อัปเดตล่าสุด',

  // Date
  CREATE_DATE: 'วันที่สร้าง',

  // Person
  PSN: 'บุคคล',
  PSN_CODE: 'รหัสบุคคล',

  // Position organization group
  POG_CODE: 'รหัสตำแหน่งองค์กร',
  POG_DESC: 'คำอธิบายตำแหน่งองค์กร',
  POG_TYPE: 'ประเภทตำแหน่งองค์กร',

  // Holiday
  HOLIDAY_FLAG: 'ธงวันหยุด',
};

// Thai descriptions for specific table-column combinations
const specificThaiDescriptions: { [key: string]: { [key: string]: string } } = {
  AB_DEPUTY: {
    GDP_ID: 'รหัสผู้แทน',
    PMT_CODE: 'รหัสตำแหน่ง PMT',
    GPD_DEPUTY_POG_CODE: 'รหัสตำแหน่งองค์กรผู้แทน',
    GDP_DEPUTY_POSITION_EX: 'ตำแหน่งเพิ่มเติมของผู้แทน',
    GDP_DEPUTY_PRIORITY: 'ลำดับความสำคัญของผู้แทน',
    GDP_DEPUTY_START_DATE: 'วันที่เริ่มต้นการเป็นผู้แทน',
    GDP_DEPUTY_END_DATE: 'วันที่สิ้นสุดการเป็นผู้แทน',
    GDP_DEPUTY_REMARK: 'หมายเหตุผู้แทน',
    GDP_CREATED_BY: 'ผู้สร้างผู้แทน',
    GDP_CREATED_DATE: 'วันที่สร้างผู้แทน',
    GDP_LAST_UPDATE_BY: 'ผู้อัปเดตผู้แทนล่าสุด',
    GDP_LAST_UPDATE_DATE: 'วันที่อัปเดตผู้แทนล่าสุด',
    GDP_DEPUTY_STATUS: 'สถานะผู้แทน',
    POG_CODE: 'รหัสตำแหน่งองค์กร',
    POG_DESC: 'คำอธิบายตำแหน่งองค์กร',
  },
  AB_HOLIDAY: {
    HOLIDAY_DATE: 'วันที่หยุด',
    DESCRIPTION: 'คำอธิบายวันหยุด',
    CREATE_DATE: 'วันที่สร้าง',
    PSN_CODE: 'รหัสบุคคล',
    POG_CODE: 'รหัสตำแหน่งองค์กร',
    HOLIDAY_FLAG: 'ธงวันหยุด',
    POG_TYPE: 'ประเภทตำแหน่งองค์กร',
    ID: 'รหัสวันหยุด',
  },
  EMPLOYEE: {
    CODE: 'รหัสพนักงาน',
    NAME: 'ชื่อพนักงาน',
    SEX: 'เพศ',
    ADDRESS: 'ที่อยู่',
    KHATE_CODE: 'รหัสเขต',
    KHATE: 'เขต',
    PROVINCE_CODE: 'รหัสจังหวัด',
    PROVINCE: 'จังหวัด',
    POSTCODE: 'รหัสไปรษณีย์',
    BIRTH_DATE: 'วันเกิด',
    SALARY: 'เงินเดือน',
    BANK_ACCOUNT: 'บัญชีธนาคาร',
    START_WORK: 'วันที่เริ่มงาน',
    PMT_POS_WORK: 'ตำแหน่งงาน PMT',
    POSITION: 'ตำแหน่ง',
    APA_PPN_NUMBER: 'หมายเลข APA PPN',
    EX_POSITION_CODE: 'รหัสตำแหน่งพิเศษ',
    EX_POSITION: 'ตำแหน่งพิเศษ',
    LEVEL_POSITION: 'ระดับตำแหน่ง',
    POG_CODE: 'รหัสตำแหน่งองค์กร',
    WORKINGGROUP: 'กลุ่มงาน',
    UNIT: 'หน่วยงาน',
    SECTION: 'ฝ่าย',
    DIVISION: 'กอง',
    DEPARTMENT: 'แผนก',
    FATHER: 'บิดา',
    FATHER_ALIVE: 'บิดายังมีชีวิตอยู่',
    MOTHER: 'มารดา',
    MOTHER_ALIVE: 'มารดายังมีชีวิตอยู่',
    MARRIED: 'สถานะการสมรส',
    SPOUSE: 'คู่สมรส',
    EMAIL: 'อีเมล',
    TYPE_DATA: 'ประเภทข้อมูล',
    CARD_ID: 'เลขบัตรประชาชน',
    TAX_ID: 'เลขประจำตัวผู้เสียภาษี',
  },
};

function getThaiDescription(tableName: string, columnName: string): string {
  // Check for specific table-column combination first
  if (
    specificThaiDescriptions[tableName] &&
    specificThaiDescriptions[tableName][columnName]
  ) {
    return specificThaiDescriptions[tableName][columnName];
  }

  // Check for pattern-based descriptions
  for (const [pattern, description] of Object.entries(thaiColumnDescriptions)) {
    if (columnName.includes(pattern) || columnName.endsWith(pattern)) {
      return description;
    }
  }

  // Default description based on column name
  if (columnName.includes('ID')) return 'รหัส';
  if (columnName.includes('NAME')) return 'ชื่อ';
  if (columnName.includes('DATE')) return 'วันที่';
  if (columnName.includes('CODE')) return 'รหัส';
  if (columnName.includes('DESC')) return 'คำอธิบาย';
  if (columnName.includes('STATUS')) return 'สถานะ';
  if (columnName.includes('FLAG')) return 'ธง';
  if (columnName.includes('AMOUNT')) return 'จำนวน';
  if (columnName.includes('PRICE')) return 'ราคา';
  if (columnName.includes('COUNT')) return 'จำนวน';
  if (columnName.includes('TYPE')) return 'ประเภท';

  return 'ข้อมูล'; // Default fallback
}

function enhanceTableStructureWithThai() {
  try {
    console.log('🔍 Reading existing table structure CSV...');

    const inputPath = path.join(process.cwd(), 'oracle_table_structure.csv');
    if (!fs.existsSync(inputPath)) {
      console.error('❌ File oracle_table_structure.csv not found!');
      console.log(
        '💡 Please run export-table-structure.ts first to generate the base CSV.',
      );
      return;
    }

    const csvContent = fs.readFileSync(inputPath, 'utf8');
    const lines = csvContent.split('\n');

    if (lines.length < 2) {
      console.error('❌ CSV file is empty or invalid!');
      return;
    }

    // Parse header
    const header = lines[0].split(',').map((col) => col.replace(/"/g, ''));
    const columnIndex = header.indexOf('Column Name');
    const tableIndex = header.indexOf('Table Name');

    if (columnIndex === -1 || tableIndex === -1) {
      console.error('❌ Required columns not found in CSV!');
      return;
    }

    // Add Thai Description column after Comments
    const commentsIndex = header.indexOf('Comments');
    const newHeader = [...header];
    newHeader.splice(commentsIndex + 1, 0, 'Thai Description');

    console.log('📝 Adding Thai descriptions to columns...');

    // Process each line
    const enhancedLines = [newHeader.join(',')];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;

      const values = lines[i].split(',').map((val) => val.replace(/"/g, ''));
      const tableName = values[tableIndex];
      const columnName = values[columnIndex];

      if (tableName && columnName) {
        const thaiDescription = getThaiDescription(tableName, columnName);
        values.splice(commentsIndex + 1, 0, thaiDescription);
        enhancedLines.push(values.map((val) => `"${val}"`).join(','));
      }
    }

    // Write enhanced CSV
    const outputPath = path.join(
      process.cwd(),
      'oracle_table_structure_thai.csv',
    );
    fs.writeFileSync(outputPath, enhancedLines.join('\n'), 'utf8');

    console.log(
      `✅ Enhanced table structure with Thai descriptions saved to: ${outputPath}`,
    );
    console.log(`📊 Total lines processed: ${enhancedLines.length - 1}`);

    // Show sample of enhanced data
    console.log('\n📋 Sample of enhanced data:');
    console.log('First 5 lines with Thai descriptions:');
    enhancedLines.slice(0, 6).forEach((line, index) => {
      if (index === 0) {
        console.log(`Header: ${line}`);
      } else {
        console.log(`Line ${index}: ${line}`);
      }
    });
  } catch (error) {
    console.error('❌ Error enhancing table structure:', error);
  }
}

// Run the enhancement
enhanceTableStructureWithThai();
