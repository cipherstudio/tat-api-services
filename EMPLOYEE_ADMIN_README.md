# Employee Admin System

## ภาพรวม

ระบบ Employee Admin ถูกออกแบบมาเพื่อจัดการข้อมูลของพนักงานในระบบ โดยมีการเชื่อมต่อกับข้อมูลจากตาราง `OP_MASTER_T` ผ่าน `PMT_CODE`

## โครงสร้างตาราง

### ตาราง `employee_admin`

| Field | Type | Description |
|-------|------|-------------|
| `id` | INT (Primary Key) | รหัสอ้างอิง |
| `pmt_code` | VARCHAR | PMT_CODE จาก OP_MASTER_T |
| `employee_code` | VARCHAR | รหัสพนักงาน |
| `employee_name` | VARCHAR | ชื่อพนักงาน |
| `position` | VARCHAR | ตำแหน่ง |
| `department` | VARCHAR | แผนก |
| `division` | VARCHAR | กอง |
| `section` | VARCHAR | ฝ่าย |
| `is_active` | BOOLEAN | สถานะการใช้งาน |
| `is_suspended` | BOOLEAN | สถานะการระงับ |
| `suspended_until` | TIMESTAMP | วันที่ระงับจนถึง |
| `created_by` | VARCHAR | สร้างโดย |
| `updated_by` | VARCHAR | อัพเดทโดย |
| `created_at` | TIMESTAMP | วันที่สร้าง |
| `updated_at` | TIMESTAMP | วันที่อัพเดท |
| `deleted_at` | TIMESTAMP | วันที่ลบ (Soft Delete) |

## API Endpoints

### 1. สร้าง Employee Admin
```
POST /employee-admin
```

### 2. ดูรายการ Employee Admin (พร้อม Pagination และ Filter)
```
GET /employee-admin?page=1&limit=10&department=IT
```

### 3. ดูรายการ Active Employees
```
GET /employee-admin/active-employees
```

### 4. ดูรายการ Active Non-Suspended Employees
```
GET /employee-admin/active-non-suspended-employees
```

### 5. ดู Employee Admin ตาม ID
```
GET /employee-admin/:id
```

### 6. ดู Employee Admin ตาม PMT_CODE
```
GET /employee-admin/pmt-code/:pmtCode
```

### 7. ดู Employee Admin ตาม Employee Code
```
GET /employee-admin/employee-code/:employeeCode
```

### 8. อัพเดท Employee Admin
```
PATCH /employee-admin/:id
```

### 9. ลบ Employee Admin (Soft Delete)
```
DELETE /employee-admin/:id
```

### 10. ระงับ Employee
```
POST /employee-admin/:id/suspend
Body: { "suspended_until": "2024-12-31", "updated_by": "admin_user" }
```

### 11. เปิดใช้งาน Employee
```
POST /employee-admin/:id/activate
Body: { "updated_by": "admin_user" }
```

## การใช้งาน

### 1. รัน Migration
```bash
npm run migration:run
```

### 2. รัน Seed Data
```bash
npm run seed:run
```

### 3. ตัวอย่างการสร้าง Employee Admin

```typescript
const createEmployeeAdminDto = {
  pmt_code: 'PMT001',
  employee_code: '38019',
  employee_name: 'John Doe',
  position: 'System Administrator',
  department: 'IT Department',
  division: 'Information Technology',
  section: 'System Management',
  is_active: true,
  created_by: 'system'
};
```

## การเชื่อมต่อกับ Oracle Database

ระบบนี้ถูกออกแบบมาเพื่อเชื่อมต่อกับข้อมูลจากตาราง `OP_MASTER_T` ใน Oracle Database ผ่าน `PMT_CODE` ซึ่งจะใช้เป็น unique identifier สำหรับการเชื่อมต่อข้อมูล

## การรักษาความปลอดภัย

1. **Authentication**: ใช้ JWT Token
2. **Authorization**: ใช้ Role-based Access Control
3. **Data Validation**: ใช้ class-validator
4. **Soft Delete**: ไม่ลบข้อมูลจริง แต่ใช้ deleted_at
5. **Audit Trail**: บันทึกการเปลี่ยนแปลงทั้งหมด

## การ Monitor และ Logging

- บันทึกการเปลี่ยนแปลงข้อมูล
- บันทึกการระงับ/เปิดใช้งาน
- บันทึกการสร้างและอัพเดทข้อมูล

## การ Backup และ Recovery

- ข้อมูลถูกเก็บใน PostgreSQL
- มีการทำ Index สำหรับการค้นหาที่รวดเร็ว
- มีการทำ Unique Constraints เพื่อป้องกันข้อมูลซ้ำ
- มีการทำ Foreign Key Constraints เพื่อรักษาความสมบูรณ์ของข้อมูล

## ฟีเจอร์หลัก

### 1. การจัดการข้อมูลพนักงาน
- เก็บข้อมูลพื้นฐานของพนักงาน
- เชื่อมต่อกับข้อมูลจาก Oracle Database
- รองรับการค้นหาและกรองข้อมูล

### 2. การจัดการสถานะ
- เปิด/ปิดการใช้งานพนักงาน
- ระงับการใช้งานชั่วคราว
- กำหนดวันที่ระงับ

### 3. การ Audit Trail
- บันทึกผู้สร้างและผู้แก้ไข
- บันทึกเวลาการสร้างและแก้ไข
- Soft Delete เพื่อรักษาประวัติ

### 4. การค้นหาและกรอง
- ค้นหาตาม PMT_CODE
- ค้นหาตาม Employee Code
- กรองตามแผนก, กอง, ฝ่าย
- กรองตามสถานะการใช้งาน 