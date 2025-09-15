/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable('report_certificate', (table) => {
      table.boolean('is_payment_order_number_1').nullable().defaultTo(false);
      table.string('payment_order_number_1').nullable();
      table.boolean('is_payment_without_receipt').nullable().defaultTo(false).comment('เป็นการจ่ายเงินซึ่งตามลักษณะไม่มีใบเสร็จรับเงินหรือไม่อาจเรียกใบเสร็จรับเงินจากผู้รับได้');
      table.boolean('is_payment_nonstandard_receipt').nullable().defaultTo(false).comment('เป็นการจ่ายเงินที่ออกใบเสร็จรับเงินไม่เป็นไปตามข้อกำหนดในระเบียบของ ททท.และได้แนบหลักฐาน การรับเงินพร้อมกับใบรับรองแทนใบเสร็จรับเงินนี้');

      table.boolean('is_payment_order_number_2').nullable().defaultTo(false);
      table.string('payment_order_number_2').nullable();
      table.boolean('is_payment_with_lost_receipt').nullable().defaultTo(false).comment('เป็นการจ่ายเงินที่มีใบเสร็จรับเงิน แต่ใบเสร็จรับเงินสูญหาย และไม่อาจนำสำเนาของใบเสร็จรับเงินดังกล่าวซึ่งผู้รับเงินรับรองสำเนาถูกต้องมาแสดงได และขอรับรองว่าไม่เคยนำต้นฉบับมาขอเบิกเงิน และหากค้นพบเอกสาร ดังกล่าวในภายหลังก็จะไม่นำมาใช้เพื่อขอเบิกเงินอีก');
      table.boolean('is_payment_with_lost_document').nullable().defaultTo(false).comment('เป็นการจ่ายเงินที่มีหลักฐานการจ่ายเงินอื่น แต่หลักฐานการจ่ายดังกล่าวสูญหาย และขอรับรองว่าไม่เคยนำต้นฉบับมาขอเบิกเงิน และหากค้นพบเอกสาร ดังกล่าวในภายหลังก็จะไม่นำมาใช้เพื่อขอเบิกเงินอีก');
    });
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function(knex) {
    return knex.schema.alterTable('report_certificate', (table) => {
        table.dropColumn('is_payment_order_number_1');
        table.dropColumn('is_payment_order_number_2');
        table.dropColumn('payment_order_number_1');
        table.dropColumn('payment_order_number_2');
        table.dropColumn('is_payment_without_receipt');
        table.dropColumn('is_payment_nonstandard_receipt');
        table.dropColumn('is_payment_with_lost_receipt');
        table.dropColumn('is_payment_with_lost_document');
    });
  };
  