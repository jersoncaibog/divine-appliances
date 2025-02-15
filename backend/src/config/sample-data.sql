-- Sample Customers Data
INSERT INTO customers (
        rfid_number,
        name,
        contact_number,
        loan_status,
        is_active
    )
VALUES (
        'RF001',
        'John Smith',
        '09171234567',
        'Active',
        true
    ),
    (
        'RF002',
        'Maria Garcia',
        '09182345678',
        'Active',
        true
    ),
    (
        'RF003',
        'David Wilson',
        '09193456789',
        'Completed',
        true
    ),
    (
        'RF004',
        'Sarah Johnson',
        '09204567890',
        'Active',
        true
    ),
    (
        'RF005',
        'Michael Brown',
        '09215678901',
        'Active',
        true
    ),
    (
        'RF006',
        'Jennifer Lee',
        '09226789012',
        'Active',
        true
    ),
    (
        'RF007',
        'Robert Taylor',
        '09237890123',
        'Completed',
        true
    ),
    (
        'RF008',
        'Lisa Anderson',
        '09248901234',
        'Active',
        true
    ),
    (
        'RF009',
        'James Martinez',
        '09259012345',
        'Active',
        true
    ),
    (
        'RF010',
        'Patricia White',
        '09260123456',
        'Active',
        true
    ),
    (
        'RF011',
        'Joseph Clark',
        '09271234567',
        'Completed',
        true
    ),
    (
        'RF012',
        'Nancy Rodriguez',
        '09282345678',
        'Active',
        true
    ),
    (
        'RF013',
        'Christopher Lee',
        '09293456789',
        'Active',
        true
    ),
    (
        'RF014',
        'Michelle King',
        '09304567890',
        'Active',
        true
    ),
    (
        'RF015',
        'Daniel Lopez',
        '09315678901',
        'Completed',
        true
    ),
    (
        'RF016',
        'Sandra Scott',
        '09326789012',
        'Active',
        true
    ),
    (
        'RF017',
        'Kevin Wright',
        '09337890123',
        'Active',
        true
    ),
    (
        'RF018',
        'Laura Green',
        '09348901234',
        'Active',
        true
    ),
    (
        'RF019',
        'Ronald Hall',
        '09359012345',
        'Completed',
        true
    ),
    (
        'RF020',
        'Betty Young',
        '09360123456',
        'Active',
        true
    );
-- Sample Appliances Data
INSERT INTO appliances (name, price, stock_quantity)
VALUES ('Samsung 32" Smart TV', 15999.99, 10),
    ('LG Front Load Washer', 25999.99, 5),
    ('Panasonic Microwave Oven', 4999.99, 15),
    ('Sharp Refrigerator', 29999.99, 8),
    ('Sony Home Theater System', 19999.99, 6),
    ('Whirlpool Air Conditioner', 27999.99, 7),
    ('Philips Air Fryer', 5999.99, 12),
    ('Electrolux Gas Range', 18999.99, 4),
    ('Toshiba Rice Cooker', 2999.99, 20),
    ('Fujidenzo Water Dispenser', 8999.99, 9),
    ('Hanabishi Electric Fan', 1999.99, 25),
    ('Xtreme Blender', 2499.99, 15),
    ('Condura Chest Freezer', 22999.99, 6),
    ('American Home Food Processor', 3999.99, 10),
    ('Asahi Electric Kettle', 1499.99, 18),
    ('Dowell Stand Mixer', 4499.99, 8),
    ('Kyowa Coffee Maker', 2999.99, 12),
    ('Union Glass Top Freezer', 16999.99, 7),
    ('Imarflex Induction Cooker', 3499.99, 14),
    ('3D Smart LED TV', 21999.99, 5);
-- Sample Loans Data
INSERT INTO loans (
        customer_id,
        appliance_id,
        total_loan_amount,
        monthly_payment,
        payment_status,
        balance,
        is_active
    )
VALUES (
        1,
        1,
        18000.00,
        1500.00,
        'Unpaid',
        18000.00,
        true
    ),
    (
        2,
        4,
        32000.00,
        2666.67,
        'Unpaid',
        32000.00,
        true
    ),
    (3, 2, 28000.00, 2333.33, 'Paid', 0.00, true),
    (
        4,
        6,
        30000.00,
        2500.00,
        'Unpaid',
        25000.00,
        true
    ),
    (5, 3, 6000.00, 500.00, 'Overdue', 4500.00, true),
    (
        6,
        8,
        20000.00,
        1666.67,
        'Unpaid',
        18333.33,
        true
    ),
    (7, 5, 22000.00, 1833.33, 'Paid', 0.00, true),
    (8, 7, 7000.00, 583.33, 'Unpaid', 5833.33, true),
    (
        9,
        10,
        10000.00,
        833.33,
        'Overdue',
        7500.00,
        true
    ),
    (10, 12, 3000.00, 250.00, 'Unpaid', 2500.00, true),
    (11, 15, 2000.00, 166.67, 'Paid', 0.00, true),
    (
        12,
        13,
        25000.00,
        2083.33,
        'Unpaid',
        22916.67,
        true
    ),
    (13, 16, 5000.00, 416.67, 'Unpaid', 4583.33, true),
    (
        14,
        18,
        18000.00,
        1500.00,
        'Overdue',
        15000.00,
        true
    ),
    (15, 20, 24000.00, 2000.00, 'Paid', 0.00, true),
    (16, 11, 2500.00, 208.33, 'Unpaid', 2083.33, true),
    (17, 14, 4500.00, 375.00, 'Unpaid', 3750.00, true),
    (18, 17, 3500.00, 291.67, 'Unpaid', 2916.67, true),
    (19, 19, 4000.00, 333.33, 'Paid', 0.00, true),
    (20, 9, 3500.00, 291.67, 'Unpaid', 2916.67, true);
-- Sample Payments Data
INSERT INTO payments (
        loan_id,
        amount_paid,
        payment_date,
        remaining_balance
    )
VALUES (1, 1500.00, '2024-02-01 10:00:00', 16500.00),
    (2, 2666.67, '2024-02-01 11:30:00', 29333.33),
    (3, 2333.33, '2024-02-01 13:45:00', 25666.67),
    (4, 2500.00, '2024-02-02 09:15:00', 27500.00),
    (5, 500.00, '2024-02-02 14:20:00', 5500.00),
    (6, 1666.67, '2024-02-03 10:30:00', 18333.33),
    (7, 1833.33, '2024-02-03 15:45:00', 20166.67),
    (8, 583.33, '2024-02-04 11:00:00', 6416.67),
    (9, 833.33, '2024-02-04 16:20:00', 9166.67),
    (10, 250.00, '2024-02-05 09:45:00', 2750.00),
    (11, 166.67, '2024-02-05 13:30:00', 1833.33),
    (12, 2083.33, '2024-02-06 10:15:00', 22916.67),
    (13, 416.67, '2024-02-06 14:45:00', 4583.33),
    (14, 1500.00, '2024-02-07 11:30:00', 16500.00),
    (15, 2000.00, '2024-02-07 15:20:00', 22000.00),
    (16, 208.33, '2024-02-08 09:30:00', 2291.67),
    (17, 375.00, '2024-02-08 14:15:00', 4125.00),
    (18, 291.67, '2024-02-09 10:45:00', 3208.33),
    (19, 333.33, '2024-02-09 15:30:00', 3666.67),
    (20, 291.67, '2024-02-10 11:00:00', 3208.33);