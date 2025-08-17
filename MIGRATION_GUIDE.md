# Migration และ Seed Guide

## การใช้งาน Migration และ Seed ที่มี Transaction Support

### 🚀 **Scripts ใหม่ที่มี Transaction Support**

#### 1. **Migration เท่านั้น**
```bash
npm run db:migrate:tx
```

#### 2. **Seed เท่านั้น**
```bash
npm run db:seed:tx
```

#### 3. **Migration และ Seed พร้อมกัน**
```bash
npm run db:setup:tx
```

### 📁 **ไฟล์ Scripts ที่สร้างใหม่:**
- `scripts/run-migrations-with-tx.ts` - รัน migration พร้อม transaction
- `scripts/run-seeds-with-tx.ts` - รัน seed พร้อม transaction
- `scripts/run-migrations-and-seeds-with-tx.ts` - รันทั้ง migration และ seed

### 📋 **Scripts เดิม (ยังคงใช้งานได้)**

#### Migration
```bash
npm run db:migrate          # ใช้ run-migrations.ts
npm run knex:migrate        # ใช้ knex CLI โดยตรง
```

#### Seed
```bash
npm run db:seed:admin       # สร้าง super admin
npm run knex:seed           # รัน seeds ทั้งหมด
```

### 🔄 **Transaction Behavior**

#### **เมื่อสำเร็จ:**
- Migration/Seed จะถูก commit
- ฐานข้อมูลจะถูกอัปเดต
- แสดงข้อความ "Transaction committed successfully"

#### **เมื่อเกิด Error:**
- Migration/Seed จะถูก rollback
- ฐานข้อมูลจะกลับสู่สถานะเดิม
- แสดงข้อความ "Transaction rolled back"
- แสดง error details

### 🏗️ **การทำงานใน main.ts**

เมื่อเริ่มแอปพลิเคชัน ระบบจะ:
1. รัน migration ก่อน (ใน transaction)
2. รัน seed ต่อ (ใน transaction แยก)
3. หากเกิด error จะ rollback และแสดงข้อความ
4. แอปจะยังคงเริ่มทำงานได้ (ไม่หยุด)

### 📁 **ไฟล์ที่เกี่ยวข้อง**

- `src/database/migration-utils.ts` - Utility functions สำหรับ transaction
- `src/database/run-migrations.ts` - Migration runner เดิม
- `scripts/run-seed.ts` - Seed runner สำหรับ super admin
- `src/main.ts` - การเรียกใช้ใน main application

### ⚠️ **ข้อควรระวัง**

1. **Oracle Database:** บาง DDL operations ใน Oracle อาจไม่ support transaction
2. **Migration Rollback:** หาก migration สร้าง table หรือ alter structure อาจไม่สามารถ rollback ได้
3. **Seed Data:** ข้อมูลที่ถูก insert จะถูกลบออกเมื่อ rollback

### 🔧 **การ Debug**

หากต้องการดู logs เพิ่มเติม:
```bash
# เปิด debug mode
DEBUG=knex:* npm run db:migrate:tx
```

### 📝 **ตัวอย่าง Output**

#### สำเร็จ:
```
Starting migration transaction...
Batch 1 run: 3 migrations
Completed migrations: 20250418061520_create_users_table, 20250418061539_create_sessions_table, 20250418061549_create_audit_logs_table
Migration transaction committed successfully
Starting seed transaction...
Completed seeds: 01_provinces-amphurs, 02_countries, 03_places
Seed transaction committed successfully
All database operations completed successfully
```

#### Error:
```
Starting migration transaction...
Migration error: ORA-00955: name is already being used by an existing object
Rolling back migration transaction...
Migration transaction rolled back
Database operations failed: ORA-00955: name is already being used by an existing object
``` 