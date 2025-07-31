# IsAdmin Feature Integration

## ภาพรวม

ระบบได้เพิ่มฟีเจอร์ `isAdmin` เพื่อตรวจสอบว่าพนักงานเป็นแอดมินหรือไม่ โดยการเช็คจากตาราง `employee_admin` ที่เชื่อมต่อกับข้อมูลจาก `OP_MASTER_T` ผ่าน `PMT_CODE`

## การเปลี่ยนแปลงที่เพิ่มเข้ามา

### 1. Employee Repository Updates

#### Method: `findByCodeWithPosition4ot`
- **เพิ่ม**: `isAdmin?: boolean` ใน return type
- **เพิ่ม**: LEFT JOIN กับตาราง `employee_admin`
- **เพิ่ม**: CASE statement เพื่อเช็ค `isAdmin` (ใช้ `1`/`0` สำหรับ Oracle compatibility)

```typescript
async findByCodeWithPosition4ot(
  code: string,
): Promise<
  | (Employee & ViewPosition4ot & OpLevelSalR & { isAdmin?: boolean })
  | undefined
> {
  // ... existing joins ...
  .leftJoin('employee_admin', (builder) => {
    builder.on(
      'employee_admin.pmt_code',
      '=',
      this.knex.raw('RTRIM("OP_MASTER_T"."PMT_CODE")'),
    );
  })
  .select([
    // ... existing fields ...
    this.knex.raw(
      'CASE WHEN employee_admin.id IS NOT NULL THEN 1 ELSE 0 END as is_admin',
    ),
  ])
}
```

#### Method: `findByCode`
- **เพิ่ม**: `isAdmin?: boolean` ใน return type
- **เพิ่ม**: LEFT JOIN กับตาราง `employee_admin`
- **เพิ่ม**: CASE statement เพื่อเช็ค `isAdmin` (ใช้ `1`/`0` สำหรับ Oracle compatibility)

#### Method: `findWithQueryWithPosition4ot`
- **เพิ่ม**: `isAdmin?: boolean` ใน return type ของ data array
- **เพิ่ม**: LEFT JOIN กับตาราง `employee_admin`
- **เพิ่ม**: CASE statement เพื่อเช็ค `isAdmin` (ใช้ `1`/`0` สำหรับ Oracle compatibility)

#### Method: `checkIsAdmin` (ใหม่)
```typescript
async checkIsAdmin(pmtCode: string): Promise<boolean> {
  const result = await this.knex('employee_admin')
    .where('pmt_code', pmtCode)
    .where('is_active', true)
    .whereNull('deleted_at')
    .first();

  return !!result;
}
```

### 2. Dataviews Service Updates

#### Method: `findEmployeeByCodeWithPosition4ot` (ใหม่)
```typescript
async findEmployeeByCodeWithPosition4ot(code: string): Promise<any | undefined> {
  return this.employeeRepository.findByCodeWithPosition4ot(code);
}
```

#### Method: `checkEmployeeIsAdmin` (ใหม่)
```typescript
async checkEmployeeIsAdmin(pmtCode: string): Promise<boolean> {
  return this.employeeRepository.checkIsAdmin(pmtCode);
}
```

### 3. Dataviews Controller Updates

#### Endpoint: `GET /dataviews/v1/employees/:code/with-position4ot`
- ดึงข้อมูลพนักงานพร้อมข้อมูลตำแหน่งและระดับเงินเดือน
- รวมข้อมูล `isAdmin` ในผลลัพธ์

#### Endpoint: `GET /dataviews/v1/employees/:pmtCode/is-admin`
- ตรวจสอบว่าพนักงานเป็นแอดมินหรือไม่
- คืนค่า `true` หรือ `false`

## Oracle Database Compatibility

### ปัญหาที่พบ
Oracle Database ไม่รองรับ `true` และ `false` ใน CASE statement ทำให้เกิด error:
```
ORA-00904: "FALSE": invalid identifier
```

### การแก้ไข
เปลี่ยนจาก `true`/`false` เป็น `1`/`0` ใน CASE statement:

```sql
-- ก่อน (ไม่ทำงานใน Oracle)
CASE WHEN employee_admin.id IS NOT NULL THEN true ELSE false END as is_admin

-- หลัง (ทำงานใน Oracle)
CASE WHEN employee_admin.id IS NOT NULL THEN 1 ELSE 0 END as is_admin
```

### การแปลงผลลัพธ์
ระบบจะแปลง `1`/`0` เป็น `true`/`false` อัตโนมัติผ่าน `toCamelCase` function

## การใช้งาน

### 1. ตรวจสอบ isAdmin ในข้อมูลพนักงาน

```typescript
// ดึงข้อมูลพนักงานพร้อม isAdmin
const employee = await dataviewsService.findEmployeeByCodeWithPosition4ot('38019');
console.log(employee.isAdmin); // true หรือ false
```

### 2. ตรวจสอบ isAdmin แยก

```typescript
// ตรวจสอบ isAdmin โดยเฉพาะ
const isAdmin = await dataviewsService.checkEmployeeIsAdmin('38019');
console.log(isAdmin); // true หรือ false
```

### 3. ใช้ผ่าน API

```bash
# ดึงข้อมูลพนักงานพร้อม isAdmin
GET /dataviews/v1/employees/38019/with-position4ot

# ตรวจสอบ isAdmin
GET /dataviews/v1/employees/38019/is-admin
```

## Response Examples

### 1. Employee with isAdmin
```json
{
  "pmtCode": "38019",
  "pmtNameT": "นาย สัญชัย ธรรมโหร",
  "pmtNameE": "Mr. Sanchai Thammahor",
  "pmtLevelCode": "L01",
  "pmtPosNo": "P001",
  "isAdmin": true,
  // ... other employee fields
}
```

### 2. IsAdmin Check
```json
true
```

## การเชื่อมต่อกับ Employee Admin System

ระบบ `isAdmin` เชื่อมต่อกับ Employee Admin System ผ่าน:

1. **ตาราง `employee_admin`**: เก็บข้อมูลพนักงานที่เป็นแอดมิน
2. **PMT_CODE**: ใช้เป็น unique identifier สำหรับการเชื่อมต่อ
3. **สถานะ Active**: เช็คเฉพาะพนักงานที่มี `is_active = true`
4. **Soft Delete**: ไม่รวมพนักงานที่ถูกลบ (มี `deleted_at`)

## การตรวจสอบเงื่อนไข

ระบบจะตรวจสอบ `isAdmin` ตามเงื่อนไขต่อไปนี้:

1. **มีข้อมูลในตาราง `employee_admin`**: PMT_CODE ต้องมีอยู่ในตาราง
2. **สถานะ Active**: `is_active = true`
3. **ไม่ถูกลบ**: `deleted_at IS NULL`

## การใช้งานใน Frontend

```typescript
// ตัวอย่างการใช้งานใน React/Vue/Angular
const checkUserAdminStatus = async (pmtCode: string) => {
  try {
    const response = await fetch(`/api/dataviews/v1/employees/${pmtCode}/is-admin`);
    const isAdmin = await response.json();
    
    if (isAdmin) {
      // แสดงเมนูแอดมิน
      showAdminMenu();
    } else {
      // แสดงเมนูปกติ
      showNormalMenu();
    }
  } catch (error) {
    console.error('Error checking admin status:', error);
  }
};
```

## การทดสอบ

### 1. ทดสอบ API Endpoints

```bash
# ทดสอบดึงข้อมูลพนักงานพร้อม isAdmin
curl -X GET "http://localhost:3000/dataviews/v1/employees/38019/with-position4ot" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# ทดสอบตรวจสอบ isAdmin
curl -X GET "http://localhost:3000/dataviews/v1/employees/38019/is-admin" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. ทดสอบใน Code

```typescript
// ทดสอบใน Service
const isAdmin = await dataviewsService.checkEmployeeIsAdmin('38019');
expect(isAdmin).toBe(true);

// ทดสอบใน Repository
const employee = await employeeRepository.findByCodeWithPosition4ot('38019');
expect(employee.isAdmin).toBe(true);
```

## การบำรุงรักษา

1. **การเพิ่มแอดมิน**: ใช้ Employee Admin System
2. **การลบแอดมิน**: ใช้ Soft Delete ใน Employee Admin System
3. **การตรวจสอบ**: ระบบจะเช็คอัตโนมัติทุกครั้งที่เรียกข้อมูลพนักงาน
4. **การ Cache**: สามารถเพิ่ม Redis Cache เพื่อเพิ่มประสิทธิภาพได้

## ข้อควรระวัง

1. **Performance**: การ JOIN กับตาราง `employee_admin` อาจส่งผลต่อประสิทธิภาพ
2. **Consistency**: ต้องแน่ใจว่าข้อมูลใน `employee_admin` สอดคล้องกับ `OP_MASTER_T`
3. **Security**: ตรวจสอบสิทธิ์การเข้าถึงก่อนแสดงข้อมูลแอดมิน
4. **Error Handling**: จัดการกรณีที่ตาราง `employee_admin` ไม่มีข้อมูล
5. **Oracle Compatibility**: ใช้ `1`/`0` แทน `true`/`false` ใน CASE statement 