async function generateMarketingNumbers() {
  const now = dayjs();
  const currentMonth = now.month();

  // Ambil data counter dari DB
  const result = await client.query(`
        SELECT current_order_number, current_project_number, last_updated
        FROM counters
        WHERE counter_name = 'marketing'
        FOR UPDATE
    `);

  let { current_order_number, current_project_number, last_updated } = result.rows[0];

  // Reset jika bulan baru
  const lastMonth = dayjs(last_updated).month();
  if (currentMonth !== lastMonth) {
    current_order_number = 0;
    current_project_number = 0;
    console.log(`🔁 Bulan baru! Reset nomor ke P01 (${now.format('MMM YYYY')})`);
  }

  // Increment
  current_order_number += 1;
  current_project_number += 1;

  // Simpan kembali ke DB
  await client.query(
    `
        UPDATE counters
        SET 
            current_order_number = $1,
            current_project_number = $2,
            last_updated = CURRENT_TIMESTAMP
        WHERE counter_name = 'marketing'
        `,
    [current_order_number, current_project_number]
  );

  // Format hasil
  const projectNumber = `P${String(current_project_number).padStart(2, "0")} ${now.format("DD/MMM/YYYY")}`;
  const orderNumber = `${current_order_number}`;

  return { projectNumber, orderNumber };
}
